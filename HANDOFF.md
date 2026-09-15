# MarIA CRM handoff

Updated: 2026-09-16

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current work

PR [#25](https://github.com/JotaSXBR/MarIA-CRM/pull/25) merged (pipelines/stages/deals + Kanban). PR [#26](https://github.com/JotaSXBR/MarIA-CRM/pull/26) merged (uuid 14.0.2 override for Dependabot alert). Branch `feat/deal-detail` adds deal editing to the Kanban board:

- Clicking a deal card opens a `DealEditor` dialog (title, value in BRL ↔ `value_cents`, contact and company pickers fed by `/contacts` + `/companies`, admin-only delete).
- `apps/web/vite.config.ts` proxy now forwards `/pipelines`, `/stages`, `/deals` — without it the board 404s in dev.
- Test note: happy-dom does not submit forms on submit-button click; use `fireEvent.submit(form)` in web tests.

`pnpm verify` passes on Windows with Node 24.21.0, pnpm 11.26.0 and Docker/Testcontainers. Merge remains manual by the user.

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

Review CI and merge the deal-detail PR manually. Remaining slices: admin-panel UI screens, then WAHA messaging; the agent runtime comes after the non-AI features. Resend invitations are paused indefinitely. Deferred web work: vendored shadcn/ui components when richer primitives are needed, contact detail pages, stage rename/reorder UI. Preserve RLS and transaction cleanup.

Update this file in place as status changes. Replace stale facts; do not add transcript, secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
