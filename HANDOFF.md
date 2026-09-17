# MarIA CRM handoff

Updated: 2026-09-17

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current work

Branch `feat/outbound-dispatch` (from `main`): outbound WAHA messaging under the
ADR 0010 effect-recovery contract.

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
- `normalizeEvent` was re-aligned to the real WAHA envelope after a docs
  deep-dive: event data lives in `payload` (not `data`), dedup uses the
  envelope `id` (`evt_<ULID>`), `message.ack` maps `ackName`/numeric `ack`
  to ERROR/PENDING/SERVER/DEVICE/READ/PLAYED, `fromMe` messages are ignored,
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

1. Review/merge this PR, then point a WAHA instance at the webhook route.
2. Delivery-status state machine from `message.ack` events (out-of-order safe).
3. Meta WhatsApp Cloud API adapter as the second provider.
4. Agent runtime (Control/Execution planes, durable `AgentRun`, epoch takeover).

Update this file in place as status changes. Replace stale facts; do not add transcript, secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
