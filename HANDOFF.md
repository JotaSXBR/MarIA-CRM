# MarIA CRM handoff

Updated: 2026-09-15

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current work

PR [#13](https://github.com/JotaSXBR/MarIA-CRM/pull/13) was merged after CI and CodeQL passed. The checked-in product migration now has real PostgreSQL coverage for contacts and companies under forced RLS, including cross-workspace isolation and transaction cleanup.

The current slice adds the first consuming contract: `createDatabase(...).listContacts(workspaceId)` runs through the existing guarded workspace transaction, and `buildApp` can expose `GET /contacts` only when both that database dependency and an authorization resolver are injected. The production server injects neither, so unauthenticated `/contacts` remains unavailable while `/health` remains liveness-only.

Repository Codex routing is versioned in `.codex/` and documented in `AGENTS.md`. Codex agents have been adapted to align with Devin patterns, referencing the equivalent Devin skills for context.

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

Add real authentication and membership authorization before wiring the contacts route into the production server. Runtime role provisioning, remaining contact operations, web CRM flows and remaining product domains are still pending; preserve RLS and transaction cleanup.

Update this file in place as status changes. Replace stale facts; do not add transcript, secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
