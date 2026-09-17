# MarIA CRM handoff

Updated: 2026-09-17

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current work

Branch `feat/messaging-contact-link` (from `main`): automatically link inbound
conversations to existing contacts by phone or create a contact on the first
inbound message.

- `packages/database/src/index.ts`: `receiveInboundMessage` now resolves a
  `senderPhone` to a workspace contact and writes `conversation.contactId`.
  If no active contact exists, it creates one with the phone as name.
- New migration `0009_contact_phone_unique.sql` adds a partial unique index on
  `(workspace_id, phone) where deleted_at is null` to prevent racy duplicates
  across concurrent webhooks; `schema.ts` reflects the index.
- `packages/database/test/messaging.integration.test.ts` covers first-message
  contact creation, reuse, cross-tenant separation and the null case.
- PR #36 is open: https://github.com/JotaSXBR/MarIA-CRM/pull/36
- `main` contains the inbound slice and the inbox read API (PRs #34 and #35).

## Environment

Windows, Node 24.21.0, pnpm 11.26.0, Docker 29.7.2.

## Verification for this slice

- `pnpm typecheck` ✓
- `pnpm fmt:check` ✓
- `pnpm exec oxlint --type-aware apps packages` ✓ (0 errors, 9 pre-existing warnings)
- `pnpm test` ✓
- `pnpm test:integration` ✓ (database 14, auth 4, api 20)
- `pnpm test:e2e` ✓
- `pnpm build` ✓

## Next actions

1. Review/merge PR #36.
2. Add an agent-facing inbox UI (`/conversations` list and thread view) that
   displays the linked contact name.
3. Outbound messaging remains blocked until ADR 0010 dispatch/idempotency
   contract is validated.

Update this file in place as status changes. Replace stale facts; do not add transcript, secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
