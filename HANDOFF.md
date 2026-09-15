# MarIA CRM handoff

Updated: 2026-09-16

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current work

PR [#27](https://github.com/JotaSXBR/MarIA-CRM/pull/27) merged (deal editor + dev-proxy fix). Branch `feat/admin-panel` adds the admin UI:

- `GET /me` returns `{userId, email, name, isAdmin}`; `verifySession` now includes `name`.
- `WorkspaceProvider` also fetches `/me` and exposes `session`/`sessionLoaded`; the sidebar shows "Administração" only for global admins.
- `/admin` page (guarded client-side by `session.isAdmin`; the API still enforces `isAdmin` server-side): user list + create (with optional initial workspace/role), activate/deactivate, organizations list/create, workspaces list/create (org picker), members-per-workspace management (role change, add, remove).
- Test note: happy-dom does not submit forms on submit-button click; use `fireEvent.submit(form)` in web tests.
- Code-simplifier pass applied on this branch: `updateDeal` now validates only contact/company refs (`contactCompanyRefsValid` split out of `dealRefsValid`); all PATCH bodies now declare `minProperties: 1` so an empty patch is a 400, not a Drizzle `.set({})` failure.

`pnpm verify` passes on Windows with Node 24.21.0, pnpm 11.26.0 and Docker/Testcontainers. Merge remains manual by the user.

Deferred simplifications from the code-simplifier review (not applied):

- `lastPosition` helper should take an extra filter and be reused by `createStage`/`createDeal` (they repeat the query inline).
- Soft-delete/existence-check blocks in `deletePipeline`/`deleteStage`/`deleteDeal`/`deleteContact`/`deleteCompany` could share a `softDeleteById` helper.
- The repeated `DELETE /:id` route boilerplate in `app.ts` (auth → workspace admin → delete → status map) could be a small wrapper.
- `admin.tsx` mutations repeat identical `onSuccess`/`onError`; a local `useAdminMutation` would deduplicate.

Local dev (manual test): `docker compose -f docker/compose.yaml up -d` with `POSTGRES_PASSWORD`, apply `packages/database/drizzle/*.sql` via psql, set `maria_runtime` password, run API with `DATABASE_URL`/`ADMIN_EMAIL`/`ADMIN_PASSWORD`, `pnpm --filter @maria/web dev`.

## Devin Adaptation

Added Devin-specific skills and configuration in `.devin/`:

- `maria-dev-setup`: Environment setup and development commands
- `maria-database-rls`: Database operations and RLS patterns
- `maria-api-development`: Fastify API development patterns
- `maria-testing`: Testing strategy (unit, integration, E2E)
- `maria-devin-adaptation`: Context adaptation for Devin operations
- `config.json`: Project configuration and invariants
- `hooks.v1.json` + `rtk-pretooluse.mjs`: project-scoped `PreToolUse` adapter that
  rewrites supported Devin `exec` commands through RTK and fails open when RTK is unavailable

Devin operates as a general-purpose agent with specialized skills, following AGENTS.md as the primary contract. Codex agents in `.codex/agents/` have been updated to reference these Devin skills for consistent patterns between both tools.

## Codex Agent Adaptation

Codex agents now follow Devin patterns:

- **explorer**: References `maria-devin-adaptation` and `maria-testing` for context
- **reviewer**: References `maria-testing` and `maria-database-rls` for security review
- **worker**: References `maria-dev-setup`, `maria-database-rls`, `maria-api-development`, and `maria-testing` for implementation

Both tools now share the same underlying patterns and conventions, maintaining AGENTS.md as the primary contract.

## Environment

Docker Desktop integration is enabled for this WSL distribution, and PostgreSQL integration tests pass locally through Testcontainers. Chromium automated browser runs lack `libnspr4`; the web result was manually approved by the user.

Use `nvm use` to select Node 24.21.0 and Corepack for pnpm 11.26.0. In WSL, confirm `node` and `pnpm` resolve to Linux binaries rather than Windows shims before running gates.

## Next actions

Admin panel PR #28 merged; refactor PR #29 (scoped deal-ref validation + `minProperties: 1` on PATCH bodies) is open pending merge; `docs/decision-records` adds `adr/` and fixes doc drift. Remaining slices: WAHA messaging, then the agent runtime comes after the non-AI features. Resend invitations are paused indefinitely. Deferred web work: vendored shadcn/ui components when richer primitives are needed, contact detail pages, stage rename/reorder UI, admin user rename. Deferred code-simplifier items are listed in §Current work. Preserve RLS and transaction cleanup.

Update this file in place as status changes. Replace stale facts; do not add transcript, secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
