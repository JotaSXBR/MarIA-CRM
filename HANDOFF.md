# MarIA CRM handoff

Updated: 2026-09-15

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current work

PR [#16](https://github.com/JotaSXBR/MarIA-CRM/pull/16) is open from `feat/runtime-role-provisioning` and awaits manual review and merge. It preserves the two local Devin-adaptation commits that were previously ahead of `origin/main` and adds migration `0001_runtime_role.sql`, which creates `maria_runtime` without a password or privileged attributes, rejects an existing unsafe or protected-table-owning role, and applies only the currently required database/schema/table grants. Deployment must set the login credential through its secret manager.

The PostgreSQL integration test now consumes the checked-in runtime-role migration instead of provisioning grants itself. It verifies login and role restrictions, least-privilege grants, non-ownership, forced RLS, cross-workspace isolation, transaction cleanup and fail-closed migration behavior. `pnpm verify` passes on Windows with Node 24.21.0, pnpm 11.26.0 and Docker/Testcontainers.

`createDatabase(...).listContacts(workspaceId)` still runs through the guarded workspace transaction. `GET /contacts` remains injectable only; the production server injects neither database nor authorization dependencies, so unauthenticated access remains unavailable while `/health` remains liveness-only.

## Devin Adaptation

Added Devin-specific skills and configuration in `.devin/`:

- `maria-dev-setup`: Environment setup and development commands
- `maria-database-rls`: Database operations and RLS patterns
- `maria-api-development`: Fastify API development patterns
- `maria-testing`: Testing strategy (unit, integration, E2E)
- `maria-devin-adaptation`: Context adaptation for Devin operations
- `config.json`: Project configuration and invariants

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

Review CI and merge PR #16 manually. After it merges, add real authentication and membership authorization before wiring the contacts route into the production server. Runtime credential/deployment wiring, remaining contact operations, web CRM flows and remaining product domains are still pending; preserve RLS and transaction cleanup.

Update this file in place as status changes. Replace stale facts; do not add transcript, secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
