# MarIA CRM handoff

Updated: 2026-09-17

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current work

Branch `feat/inbox-ui` (from `main`): agent-facing inbox UI plus backend join
that returns the linked contact name for each conversation.

- `packages/database/src/index.ts` now returns `contactName` from `listConversations`
  and `getConversation` via a `LEFT JOIN` to `contacts` under the workspace scope.
- `apps/api/src/app.ts` adds `contactName: ["string", "null"]` to the conversation
  response schema and type contract.
- `apps/web/src/routes/inbox.tsx` adds the `/inbox` page:
  - left panel lists conversations by contact name (or phone when null);
  - right panel shows the selected thread with inbound/outbound message bubbles;
  - uses TanStack Query and the existing `api` / `useWorkspace` helpers.
- `apps/web/src/router.tsx` and `apps/web/src/routes/shell.tsx` register the
  `/inbox` route and navigation link.
- `apps/web/vite.config.ts` proxies `/conversations`, `/channel-instances` and
  `/webhooks` to the API dev server.
- `apps/api/test/auth.integration.test.ts` was updated so the inbox stub
  conversation includes `contactName`.

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

1. Review/merge this PR.
2. Implement outbound messaging after ADR 0010 is certified (intent/attempt
   ledger, ambiguous-result blocking, provider reconciliation).
3. Consider the Meta WhatsApp Cloud API adapter as a parallel channel option.

Update this file in place as status changes. Replace stale facts; do not add transcript, secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
