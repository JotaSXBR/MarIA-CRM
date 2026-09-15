# MarIA CRM handoff

Updated: 2026-09-16

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current work

PR [#18](https://github.com/JotaSXBR/MarIA-CRM/pull/18) merged. Branch `feat/contact-crud` adds workspace-scoped contact CRUD:

- Migration `0003_contact_soft_delete.sql` adds `contacts.deleted_at` plus a partial `workspace_id` index on active rows.
- `@maria/database` gains `getContact`, `createContact`, `updateContact` and `deleteContact`, all through `withWorkspace`; reads/updates/delete filter `deleted_at is null`. Delete is a soft delete via `UPDATE` because `maria_runtime` deliberately has no `DELETE` grant (least privilege preserved; user-approved decision).
- `apps/api` adds `POST /contacts`, `GET /contacts/:id`, `PATCH /contacts/:id` and `DELETE /contacts/:id` (all with `?workspaceId=`), sharing one session+membership authorization helper. `DELETE` additionally requires the workspace `admin` role (403 for members).
- API integration tests cover member CRUD, unauthenticated rejection, 404 on missing rows, admin-only delete and cross-tenant denial; the database RLS test proves cross-workspace CRUD isolation and that soft-deleted rows stay hidden; the E2E test runs a real create/read/update/delete roundtrip against the built server.
- `.gitattributes` pins `eol=lf` so Windows checkouts stop breaking `pnpm fmt:check` with CRLF.

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

Review CI and merge the contact-CRUD PR manually. Remaining slices: workspace/org management in the admin panel, web CRM flows and Resend invitation delivery. Runtime credential/deployment wiring, worker/agent runtime and remaining product domains are still pending; preserve RLS and transaction cleanup.

Update this file in place as status changes. Replace stale facts; do not add transcript, secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
