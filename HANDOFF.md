# MarIA CRM handoff

Updated: 2026-09-17

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current work

All dependency and messaging PRs are merged; `main` is green with no open PRs.

- Outbound WAHA messaging (ADR 0010 effect-recovery contract) landed via #44:
  `dispatch_intents`/`dispatch_attempts` ledger (effect identity, fencing +
  lease, RLS+FORCE), `SendResult` `rejected`/`unknown`, WAHA `send` via
  `POST /api/sendText` (`sendIdempotency: "none"`), `POST
/conversations/:id/messages` (commit→claim→send→settle), lazy maintenance on
  `GET /conversations`, inbox composer + status bubbles.

- `packages/database/drizzle/0010_dispatch_ledger.sql` adds `dispatch_intents`
  (effect identity = unique `(channel_instance_id, message_id)`, epoch captured
  at commit) and `dispatch_attempts` (fencing token + lease, one open attempt
  per intent), both RLS + FORCE, granted to `maria_runtime`.
- `packages/database/src/index.ts` adds `createOutboundIntent` (message + intent
  in one tx), `claimDispatchIntent` (atomic pending→dispatching, epoch check
  cancels stale intents, inactive channel fails fast), `settleDispatch`
  (fencing-token-matched completion; stale claimers are no-ops),
  `reapExpiredDispatches` (expired lease → `unknown`, never retried) and
  `listPendingIntents`.
- `packages/messaging` extends `SendResult` with `rejected`/`unknown` and adds
  `ProviderCapabilities`; `SendInput` carries `session`.
- `packages/channel-waha` implements `send` via `POST {WAHA_BASE_URL}/api/sendText`
  with `X-Api-Key`, 15s timeout; 4xx → `rejected`, 5xx/timeout/no-id → `unknown`.
  Capabilities certified as `sendIdempotency: "none"`, `reconciliation: "webhook"`.
- `apps/api` adds `POST /conversations/:id/messages` (commit intent → claim →
  send → settle synchronously) plus lazy maintenance: `GET /conversations` reaps
  expired leases and resumes orphaned `pending` intents in the background.
  `WAHA_BASE_URL`/`WAHA_API_KEY` configure the provider; unset → sends `blocked`.
- `apps/web` inbox has a message composer and shows outbound status
  (`pending`/`sent`/`unknown`/`failed`/`cancelled`) on each bubble.
- `normalizeEvent` is aligned to the real WAHA envelope: event data lives in
  `payload` (not `data`), dedup uses the envelope `id` (`evt_<ULID>`),
  `message.ack` maps `ackName`/numeric `ack` to
  ERROR/PENDING/SERVER/DEVICE/READ/PLAYED, `fromMe` messages are ignored,
  `sender.phone` is the bare number, and the webhook route drops events whose
  `session` differs from the instance's `providerInstanceId`.
- `docker/compose.yaml` now runs WAHA (`devlikeapro/waha:latest-2026.8.2`,
  port 127.0.0.1:3001, GOWS default engine) + Redis (`REDIS_URL`, internal
  only) with session/media volumes; `docker/.env.example` documents required
  values. Webhooks are configured per session (`POST /api/sessions` with
  `config.webhooks[].hmac.key`) — see DEVELOPMENT.md "Local WAHA + Redis".
- Known limitation: queue maintenance is request-driven (lazy per workspace);
  a dedicated dispatcher worker remains future work. Human-takeover epoch
  increments land with the agent runtime; intents already carry the epoch check.
- Known gap: outbound replies reuse the inbound `providerThreadId` (already a
  valid WhatsApp chatId). Starting a conversation with a CRM contact needs
  Brazilian phone normalization (9th digit) in the adapter — the previous
  WAHA setup delegated this to the Brazilian Phone Numbers app, which MarIA
  does not use.

## Environment

Windows, Node 24.21.0, pnpm 11.26.0, Docker 29.7.2.

## Verification for this slice

- `pnpm verify` ✓ — fmt:check, oxlint (0 errors, 9 pre-existing `apps/web`
  warnings), typecheck, unit tests, integration (database 15, auth 4, api 22),
  built API HTTP E2E, build.
- Integration evidence covers: exclusive concurrent claim on independent
  connections, stale-fencing no-op settle, expired lease → `unknown`,
  epoch-mismatch cancellation, inactive-channel fast fail, cross-tenant
  claim/reap isolation.

## Next actions

0. Dependency alignment done: #37/#39/#40/#42 merged, react+react-dom bumped
   together to 19.3.0 via #46 (Dependabot's split PRs #38/#41 auto-closed as
   superseded — react/react-dom must keep exact matching versions). Docs
   alignment merged via #45.
1. CI smoke fix merged via #47: `apps/api/src/server.ts` now ends the `pg`
   pool (`database.close()`) on SIGTERM/SIGINT — idle pool sockets used to
   hold the event loop ~10s and race `docker stop --timeout 10` (exit 137).
   `main` CI is green again.
2. Point a WAHA instance at the webhook route to validate the real round
   trip. Deploy target baseline: **Coolify 4.3.21** on the VPS — WAHA + Redis
   ship **inside the application stack** (same deploy compose), not as a
   separate Coolify application; the API ships as an immutable GHCR image
   (CI-built, same digest promoted staging→prod). On the internal compose
   network, the per-session webhook can target the API service name directly.
   The Coolify compose/resource wiring is a later deploy slice, deliberately
   separate from the dev compose.
3. Delivery-status state machine landed on this branch:
   `recordDeliveryStatus` consumes `message.ack` webhooks
   (SERVER→sent, DEVICE→delivered, READ/PLAYED→read, ERROR→failed),
   deduped via `webhook_events`, correlated by
   `(channel_instance_id, provider_message_id, direction=outbound)` and
   monotonic — out-of-order/replayed acks never regress `read`, and a late
   authoritative ack reconciles `unknown`/`failed` dispatches (ADR 0010).
4. Meta WhatsApp Cloud API adapter as the second provider.
5. Agent runtime (Control/Execution planes, durable `AgentRun`, epoch takeover).

## Failed-send recovery (in PR)

- `POST /messages/:id/retry` — only `failed`/`cancelled` outbound messages;
  creates a NEW message+intent (fresh effect identity, ADR 0010) and kicks the
  dispatcher. `unknown` returns 409 — it may have reached the provider.
- `POST /messages/:id/resolve` `{resolution: "sent"|"not_sent"}` — operator
  resolution for `unknown` only: `sent` confirms arrival, `not_sent` cancels
  (unlocking retry). Implemented by `resolveUnknownMessage` + `getMessage`.
- Inbox: pt-BR status labels; outbound bubbles get a "Reenviar" action on
  failed/cancelled, and "Foi entregue"/"Reenviar" (resolve+retry chain) on
  unknown.

## Dispatcher choreography (ADR 0013, merged #52)

`POST /conversations/:id/messages` no longer sends synchronously: it commits
message+intent and kicks `dispatcher.dispatchPending` in the background — the
response is the `pending` message and status advances asynchronously.
`dispatchPending` drains the workspace queue as one presence burst:
`online` once per session → per intent `seen → typing clamp(len*70ms,
1.5s, 8s)±10% → paused → send → settle` → `offline` once at the end. The
sequence follows WAHA's official "How to Avoid Blocking" guidance (seen →
typing → random wait ∝ size → stop-typing → send; offline once per batch),
not the earlier n8n-derived padding (ADR 0013 amendment). Waits live in
`dispatch.ts` (`CHOREOGRAPHY`); `sleep`/`rng` are injectable. Presence/seen are capability-gated and best-effort — failures
never block the send. Concurrent drains for a workspace join the running one
(drain re-lists until empty). Crash-during-wait inherits ADR 0010 semantics:
lease expiry → `unknown` (the ledger cannot distinguish pre-send from
post-send crashes — conservative side). Cross-workspace background polling is
still impossible under RLS; dispatch is triggered by workspace activity
(write kick + lazy GET maintenance), which is correct while intents only
originate from API requests.

## WhatsApp interaction choreography (ADR 0013, merged #51)

Provider contract gains optional best-effort primitives + capability flags:
`setPresence` (online/offline global; typing/recording/paused chat-scoped),
`sendSeen`, `resolveLid` — all implemented on WAHA (`POST
/api/{session}/presence`, `POST /api/sendSeen`, `GET /api/{session}/lids/{lid}`).
The dispatcher (future) orchestrates the humanization sequence — online → seen →
typing `clamp(len*0.07, 1.5, 8)s ±10%` → paused → send → offline — so delays
survive restarts and never hold HTTP requests; `recording` replaces `typing` for
future voice replies and media sends slot in at the send step.

Inbound changes on the same branch: `@lid` senders keep `sender.lid` (no fake
phone) and the webhook resolves the real number via `resolveLid`
(alternate-identity payload fields are tried first). Message text is never
filtered — content arriving on our number reaches the inbox verbatim.
Compose pins `devlikeapro/waha:gows-2026.8.2` — the `latest-*` tag ships the
WEBJS build and cannot run `WHATSAPP_DEFAULT_ENGINE=GOWS`. Live finding
corrected: the `@lid` DM payload did NOT carry the real number; the lids API
is the authoritative resolution path.

## Live WAHA round-trip (verified 2026-09-17)

Real WEBJS session linked via QR on the local compose stack; full loop
verified: inbound DM → webhook → conversation/contact/message; API outbound
→ `sendText` → `sent`; `message.ack` advanced it to `read`. Live findings
fixed in PR #50: turbo dev `passThroughEnv` was stripping
`WAHA_BASE_URL`/`WAHA_API_KEY`; `POST /channel-instances` 500'd on a missing
`createdAt` in the response `returning`; `status@broadcast` Status updates
flooded the inbox (now dropped by the adapter + `ignore.status` session
flag). Remaining live observations — both addressed in the ADR 0013 branch:
senders can arrive as `@lid` (privacy identifier; the payload did not carry
the real number — resolution now goes through `GET /api/{session}/lids/{lid}`);
inbound `body` may carry a `_#Name:_` attribution prefix from external
platforms — stored verbatim, never filtered.

Update this file in place as status changes. Replace stale facts; do not add transcript, secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
