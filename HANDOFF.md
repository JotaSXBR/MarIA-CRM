# MarIA CRM handoff

Updated: 2026-09-16

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current work

PR [#24](https://github.com/JotaSXBR/MarIA-CRM/pull/24) merged (web SPA). Branch `feat/pipelines-deals` adds pipelines/stages/deals with a Kanban board:

- Migration `0007_pipelines.sql` creates `pipelines`, `stages`, `deals` — all with `workspace_id`, RLS + FORCE, soft delete (`deleted_at`), least-privilege grants for `maria_runtime` (no DELETE), and active-row partial indexes.
- Ordering uses `fractional-indexing` position strings: stages sort inside a pipeline, deals inside a stage. `POST /deals/:id/move` takes `stageId` + `prevDealId`/`nextDealId` neighbors and computes the new key between them.
- FK-scoped reads (research lesson): `createStage`/`createDeal`/`updateDeal`/`moveDeal` verify referenced pipeline, stage, contact and company rows inside `withWorkspace` — RLS does not stop cross-tenant FK references on write.
- `DELETE /pipelines/:id` and `DELETE /stages/:id` require workspace admin and return 409 while the pipeline/stage still has active deals.
- `apps/web` gains `/pipelines`: Kanban board with dnd-kit (`@dnd-kit/core` + `sortable`), per-stage deal creation, admin-only delete/pipeline/stage controls. Index and post-login now land on `/pipelines`.

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

Review CI and merge the pipelines/deals PR manually. Remaining slices: deal detail/edit (contact/company pickers), admin-panel UI screens, then WAHA messaging; the agent runtime comes after the non-AI features. Resend invitations are paused indefinitely. Deferred web work: vendored shadcn/ui components when richer primitives are needed, contact detail pages. Preserve RLS and transaction cleanup.

Update this file in place as status changes. Replace stale facts; do not add transcript, secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
