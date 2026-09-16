# 0008 — WhatsApp messaging: provider port, webhook authenticity and conversation model

**Status:** accepted (2026-09-16)

**Superseded:** 2026-09-16 by [ADR 0010](0010-messaging-effect-recovery.md).
**Implementation:** planned; this record does not certify provider behavior or shipped messaging.

## Context

The next product slice is WhatsApp messaging. AGENTS.md already fixes the non-negotiables:
`MessagingProvider` with WAHA first and a Meta WhatsApp Cloud API adapter from day one (§5),
provider payloads normalized at the adapter boundary with webhook authenticity verified and
provider IDs preserved for dedup/reconciliation (§6), per-conversation `epoch` for anti-stale
human takeover (§4.5), durable outbox + `effect_receipts` for every mutating side effect (§4.4,
§Transaction boundary), and media binaries behind `StoragePort`, never in business tables.

Provider facts that shape the design:

- **WAHA** delivers per-session webhooks. With `hmac.key` (or `WHATSAPP_HOOK_HMAC_KEY`)
  configured it sends `X-Webhook-Hmac` (HMAC-SHA-512 over the raw body) plus
  `X-Webhook-Hmac-Algorithm` and a per-request `X-Webhook-Request-Id`. It retries delivery
  (default 15 attempts, configurable policy), so duplicate events are expected. Relevant
  events: `message`, `message.ack`, `session.status`.
- **Meta Cloud API** requires a one-time GET handshake (`hub.mode`, `hub.verify_token`,
  `hub.challenge` — echo the raw challenge) and signs every POST with
  `X-Hub-Signature-256: sha256=<hmac>` (HMAC-SHA-256 over the raw body keyed on the app
  secret). Meta re-escapes non-ASCII characters, so the signature only verifies over the
  raw bytes. It retries for up to 7 days and delivers statuses out of order; `wamid.*`
  is the dedup key.

## Decision

- **Package layout** follows ARCHITECTURE.md: `@maria/messaging` holds provider-normalized
  contracts and the `MessagingProvider` port; `packages/channel-waha` and
  `packages/channel-meta` are the only places provider payload/API types exist. Provider
  types never cross the port into domain, API or UI code.
- **Port shape:** the port exposes normalized verbs only — `verifyWebhook(rawBody, headers)`,
  `normalizeEvent(rawPayload)` → discriminated `InboundEvent`
  (`message.received | message.status | session.status`), and `send`/`sendText` →
  `SendResult { providerMessageId }`. Channel configuration lives per instance, not globally.
- **Webhook authenticity** is verified on the **raw body before parsing**:
  - WAHA: `X-Webhook-Hmac`, HMAC-SHA-512 with the per-session key, timing-safe compare.
  - Meta: `X-Hub-Signature-256`, HMAC-SHA-256 with the app secret, timing-safe compare;
    GET handshake answers `hub.challenge` only when `hub.verify_token` matches.
  - Fastify keeps the raw body for webhook content types. Failure → `401`, nothing
    persisted. Success → persist the raw event + dedup key and enqueue outbox work in one
    transaction, then return `200` fast. Normalization/processing happens asynchronously
    in the worker, never inline in the webhook request.
- **Data model** (all tenant-owned, RLS + `FORCE ROW LEVEL SECURITY` like existing tables):
  - `channel_instances` — `workspace_id`, `provider` (`waha` | `meta`), provider session /
    phone-number id, `status`, timestamps.
  - `conversations` — `workspace_id`, `channel_instance_id`, `contact_id`, `epoch`
    (monotonic, incremented on human takeover/reply per §4.5), `status`,
    `last_message_at`.
  - `messages` — `workspace_id`, `conversation_id`, `direction` (`inbound` | `outbound`),
    `provider_message_id`, `type`, text payload, media as `StoragePort` object refs,
    delivery `status`, timestamps.
  - `webhook_events` — `workspace_id`, `channel_instance_id`, provider event id, raw
    payload (jsonb), processing status; unique `(channel_instance_id, provider_event_id)`
    makes provider retries idempotent.
  - Unique `(channel_instance_id, provider_message_id)` on `messages` for
    dedup/reconciliation of both WAHA message ids and Meta `wamid`.
- **Outbound flow** per the transaction boundary: persist message + outbox event in one
  transaction; the adapter call happens outside the transaction; `effect_key` derives from
  the message id so worker retries hit `effect_receipts` instead of re-sending.
- **Inbound flow:** verified `webhook_events` row → worker normalizes → upserts contact /
  conversation / message inside a `withWorkspace` transaction → outbox event for anything
  downstream (inbox UI, later agent runs).

## Consequences

- Webhook handlers stay thin: verify, persist, enqueue, `200`. Provider retries and
  out-of-order statuses are absorbed by the dedup keys instead of bespoke logic.
- A third provider is a new adapter package + `provider` enum value; domain and API code
  do not change.
- Raw-body capture is now a hard requirement on the Fastify content parser config for
  webhook routes; regressions there break signature verification loudly (all `401`s),
  which is the safe failure mode.
- `channel_instances` is the anchor for per-session secrets (WAHA HMAC key, Meta app
  secret reference); secrets stay out of model context per §4.6.
- The conversation `epoch` exists before the agent runtime lands, so human takeover
  semantics are enforceable from the first human-reply feature.
