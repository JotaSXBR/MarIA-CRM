# MarIA CRM handoff

Updated: 2026-09-16

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current work

PR [#21](https://github.com/JotaSXBR/MarIA-CRM/pull/21) merged. Branch `feat/companies-crud` adds workspace-scoped company CRUD mirroring the contacts contract:

- Migration `0004_company_soft_delete.sql` adds `companies.deleted_at` plus a partial `workspace_id` index on active rows.
- `@maria/database` gains `listCompanies`, `getCompany`, `createCompany`, `updateCompany` and `deleteCompany`, all through `withWorkspace` and filtering `deleted_at is null`. Soft delete via `UPDATE` keeps `maria_runtime` at least privilege (no `DELETE` grant).
- `apps/api` adds `GET`/`POST /companies` and `GET`/`PATCH`/`DELETE /companies/:id` (all with `?workspaceId=`), reusing the shared session+membership authorization helper (renamed `authorizeWorkspaceRequest`). `DELETE` requires the workspace `admin` role.
- Tests mirror the contacts coverage: API contract (401/403/404/roundtrip, cross-workspace denial), RLS CRUD isolation and an E2E create/delete/404 roundtrip against the built server.

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

Review CI and merge the companies-CRUD PR manually. Remaining slices: workspace/org management in the admin panel, web CRM flows (login + contacts/companies), then pipelines/stages/deals. Resend invitations are paused indefinitely; WAHA messaging and the agent runtime come after the non-AI features. Preserve RLS and transaction cleanup.

Update this file in place as status changes. Replace stale facts; do not add transcript, secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
