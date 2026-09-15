# MarIA CRM handoff

Updated: 2026-09-16

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current work

PR [#23](https://github.com/JotaSXBR/MarIA-CRM/pull/23) merged. Branch `feat/web-app` adds the first real web UI plus the API support it needs:

- Migration `0006_membership_user_scope.sql` replaces the memberships policy with `workspace_id = app.workspace_id OR user_id = app.user_id` for reads; `WITH CHECK` stays workspace-only, so writes still require workspace context.
- `@maria/database` gains `withUser(userId, cb)` (transaction-local `app.user_id`, same role-safety check as `withWorkspace`; both now share `scopedTransaction`).
- `@maria/auth` gains `listUserWorkspaces`; `apps/api` exposes `GET /me/workspaces` for any authenticated session.
- `apps/web` is a real SPA now: TanStack Router (code-based route tree, `beforeLoad` auth guard) + TanStack Query + Tailwind v4 via `@tailwindcss/vite`; Vite dev proxy forwards `/auth`, `/me`, `/admin`, `/contacts`, `/companies`, `/health` to `localhost:3000` (no CORS changes). Pages: `/login`, authenticated shell with sidebar + workspace picker, `/contacts` and `/companies` (list/create/edit; delete only for workspace admins).
- Session token lives in `localStorage`; workspace selection persists across reloads.

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

Review CI and merge the web-app PR manually. Remaining slices: pipelines/stages/deals (Kanban), then WAHA messaging; the agent runtime comes after the non-AI features. Resend invitations are paused indefinitely. Deferred web work: vendored shadcn/ui components when richer primitives are needed, admin-panel UI screens, contact detail pages. Preserve RLS and transaction cleanup.

Update this file in place as status changes. Replace stale facts; do not add transcript, secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
