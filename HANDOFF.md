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
3. Delivery-status state machine from `message.ack` events (out-of-order safe).
4. Meta WhatsApp Cloud API adapter as the second provider.
5. Agent runtime (Control/Execution planes, durable `AgentRun`, epoch takeover).

Update this file in place as status changes. Replace stale facts; do not add transcript, secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
