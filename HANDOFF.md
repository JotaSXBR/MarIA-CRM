# MarIA CRM handoff

Updated: 2026-09-16

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current work

PR [#22](https://github.com/JotaSXBR/MarIA-CRM/pull/22) merged. Branch `feat/admin-management` adds the global-admin management surface:

- Migration `0005_admin_grants.sql` grants `maria_runtime` `SELECT/INSERT/UPDATE` on the global `organizations`/`workspaces` tables and adds a unique index on `memberships (user_id, workspace_id)` (previously unenforced).
- `@maria/database` gains `listOrganizations`/`createOrganization`/`listWorkspaces`/`createWorkspace` (global tables, no workspace scope; `createWorkspace` returns undefined for a missing org).
- `@maria/auth` gains `listUsers`, `updateUser` (name/active), `listMembers`, `addMembership` (created/duplicate/not-found), `updateMembershipRole` and `removeMembership`. Membership ops run via `withWorkspace`; anti-lockout guards refuse demoting/removing a workspace's last admin and deactivating the last active global admin.
- `apps/api` adds `/admin/*` routes guarded by a shared `requireAdmin` helper (`session.isAdmin`): users list/patch, organizations list/create, workspaces list/create, workspace members list, membership create/patch/delete.
- Tests: API contract coverage for all new routes; a Testcontainers auth test proves the new grants work under `maria_runtime` and the last-admin guards hold; the E2E now provisions org, workspaces, membership and a member user entirely through the admin API.

`pnpm verify` passes on Windows with Node 24.21.0, pnpm 11.26.0 and Docker/Testcontainers. Merge remains manual by the user.

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

Review CI and merge the admin-management PR manually. Remaining slices: web CRM flows (login + contacts/companies), then pipelines/stages/deals. Resend invitations are paused indefinitely; WAHA messaging and the agent runtime come after the non-AI features. Preserve RLS and transaction cleanup.

Update this file in place as status changes. Replace stale facts; do not add transcript, secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
