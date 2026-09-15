# MarIA CRM handoff

Updated: 2026-09-16

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current work

PR [#18](https://github.com/JotaSXBR/MarIA-CRM/pull/18) is open from `feat/local-auth-mvp` and awaits manual review and merge.

This branch adds the local Auth MVP and CI/test infrastructure fixes:

- Migration `0002_local_identity.sql` creates `users`, `sessions`, `memberships` and `invitations`; `memberships` and `invitations` are workspace-scoped with `FORCE ROW LEVEL SECURITY`.
- New package `@maria/auth` exposes `AuthPort`: local `login`, `verifySession`, `authorizeWorkspace`, `createUser`, `ensureAdmin` and `seedAdmin`, using `bcryptjs` for password hashing and opaque session tokens stored in PostgreSQL.
- `apps/api` now creates a PostgreSQL pool on startup, seeds the first admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD`, and exposes `POST /auth/login`, `POST /admin/users` and authenticated `GET /contacts?workspaceId=...`.
- `GET /contacts` requires a valid session token and an active workspace membership.
- Shared Testcontainers helper exported via `@maria/database/testing` removes duplicated migration setup across database, auth and API tests.
- TypeScript type-checking no longer requires building `@maria/database` first; `@maria/database` exports point `types` to source and `default` to `dist`.
- Web tests use `@testing-library/react` + `happy-dom` instead of `react-dom/server`.
- Root `vitest.config.ts` and `@vitest/coverage-v8` added; `pnpm test:coverage` runs the full suite with coverage.
- `turbo.json` now builds workspace dependencies before running `test` and `test:integration`, so Vitest can resolve `@maria/*` package exports at runtime.
- `docker/api.Dockerfile` copies `@maria/auth` and `@maria/database` source and builds them with `turbo run build --filter=@maria/api...`; `.dockerignore` includes the required files.
- CI smoke test now starts a PostgreSQL container, applies migrations and then runs the API image with `DATABASE_URL`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` before hitting `/health`.
- Integration tests cover login success/failure, session expiry, workspace authorization, cross-tenant isolation, missing/invalid token, missing membership and admin-only user creation. E2E test spins up the built server against a Testcontainers database and logs in as the seeded admin.

`pnpm verify` passes on Windows with Node 24.21.0, pnpm 11.26.0 and Docker/Testcontainers. Merge remains manual by the user.

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

Review CI and merge PR #18 manually. After it merges, add the remaining contact CRUD operations, workspace/org management in the admin panel, web CRM flows and Resend invitation delivery. Runtime credential/deployment wiring, worker/agent runtime and remaining product domains are still pending; preserve RLS and transaction cleanup.

Update this file in place as status changes. Replace stale facts; do not add transcript, secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
