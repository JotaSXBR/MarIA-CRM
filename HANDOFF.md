# MarIA CRM handoff

Updated: 2026-09-16

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current work

Branch `feat/messaging-inbox` (from `main`): workspace API for channel instances
and inbox read, stacked after the merged inbound messaging slice.

- `packages/database` adds `listChannelInstances`, `listConversations`,
  `getConversation` and `listMessages` under workspace-scoped RLS.
- `apps/api` adds authenticated workspace routes:
  - `GET /channel-instances` and `POST /channel-instances`
  - `GET /conversations`
  - `GET /conversations/:id/messages`
- `apps/api/test/auth.integration.test.ts` and
  `packages/database/test/messaging.integration.test.ts` cover auth denial,
  workspace forwarding and cross-tenant read isolation.
- PR #35 is open: https://github.com/JotaSXBR/MarIA-CRM/pull/35
- `main` already contains the inbound slice (PR #34 merged).

## Environment

Windows, Node 24.21.0, pnpm 11.26.0, Docker 29.7.2.

## Verification for this slice

- `pnpm typecheck` ✓
- `pnpm fmt:check` ✓
- `pnpm exec oxlint --type-aware apps packages` ✓ (0 errors, 9 pre-existing warnings)
- `pnpm test` ✓
- `pnpm test:integration` ✓ (database 13, auth 4, api 20)
- `pnpm test:e2e` ✓
- `pnpm build` ✓

## Next actions

1. Review/merge PR #35.
2. Link incoming conversations to contacts by phone (or create contacts on
   first inbound message) and add an agent-facing inbox UI.
3. Outbound messaging remains blocked until ADR 0010 dispatch/idempotency
   contract is validated.

Update this file in place as status changes. Replace stale facts; do not add transcript, secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
