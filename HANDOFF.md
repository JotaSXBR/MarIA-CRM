# MarIA CRM handoff

Updated: 2026-09-16

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current work

Branch `feat/messaging-inbound` (from `main`): first inbound messaging slice per
ADR 0010.

- New package `@maria/messaging` with the `MessagingProvider` port and normalized
  `InboundEvent` types.
- New package `@maria/channel-waha` implementing `verifyWebhook` (HMAC-SHA-512)
  and `normalizeEvent` for `message`, `message.ack` and `session.status`; outbound
  `send` is explicitly blocked (`WAHA outbound not certified`).
- Migration `0008_messaging_core.sql` adds `channel_instances`, `conversations`,
  `messages` and `webhook_events` with RLS, `FORCE ROW LEVEL SECURITY`, dedup
  uniques and `epoch`.
- `packages/database` exposes `createChannelInstance`, `getChannelInstance` and
  `receiveInboundMessage`; the latter upserts the conversation, inserts the
  message and records the webhook event transactionally, with idempotent dedup.
- `apps/api` adds `POST /webhooks/waha/:workspaceId/:channelInstanceId` that
  verifies HMAC on the raw body, normalizes and persists in one transaction, then
  returns `200` fast.
- Tests: `@maria/channel-waha` unit tests, `packages/database` RLS/messaging
  integration tests proving cross-tenant isolation and webhook dedup.

## Environment

Windows, Node 24.21.0, pnpm 11.26.0, Docker 29.7.2. `pnpm verify` not yet run in
full; `typecheck`, `fmt:check`, `oxlint --type-aware apps packages` (9 pre-existing
warnings in `apps/web`), `test`, `test:integration`, `test:e2e` and `build` all
passed locally after the slice.

## Next actions

1. Commit/push this branch and open PR for review.
2. Next slice: add an API for creating `channel_instances`, then expose
   conversation/message inbox read APIs for the workspace UI.
3. Outbound messaging remains blocked until ADR 0010 dispatch/idempotency
   contract is validated.

Update this file in place as status changes. Replace stale facts; do not add transcript, secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
