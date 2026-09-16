# MarIA CRM handoff

Updated: 2026-09-16

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current work

Branch `chore/process-review` (from `main`): internal process/engineering review. The review
consolidates sources of truth and hardens the contract:

- `AGENTS.md` is the single normative contract (tool routing, approvals, invariants moved in);
  `DEVELOPMENT.md` (new) owns reproducible setup, the shared migration runner and the
  verification matrix. Skills in `.devin/skills/` were condensed to pointers — they no longer
  carry a second baseline or roadmap. `.devin/config.json` became a source map.
- ADR lifecycle formalized (ADR 0009): `proposed/accepted/rejected/superseded`; supersession
  headers appended to 0001, 0005, 0007, 0008 without rewriting accepted bodies.
- ADR 0010 supersedes 0008: messaging outbound now requires committed dispatch intent +
  attempt/fencing before provider calls; ambiguous outcomes become `unknown` (reconcile or
  block for operator, never blind resend); `epoch` checked at intent-commit and dispatch-claim;
  event identity ≠ message identity.
- ADR 0011 supersedes 0005 and is **implemented**: last-admin guards use
  `pg_advisory_xact_lock` (global `maria_auth_global_admin`, per-workspace
  `maria_auth_memberships`) in `packages/auth/src/index.ts`, with real concurrency tests using
  independent pools + `pg_stat_activity` lock detection.
- ADR 0012 **implemented**: shared migration runner `packages/database/src/migrate.ts`
  (`maria_schema_migrations` ledger, SHA-256 checksums, transactional apply, fail-closed on
  drift/unmanaged DBs) + `migrate-cli.ts` (`pnpm db:migrate`, `MIGRATION_DATABASE_URL`,
  `--provision-runtime`). Reused by tests, CI smoke and local setup — no more hardcoded
  filename lists or `psql` globs.
- CI smoke now runs the container as `maria_runtime` and exercises login → org/workspace →
  membership → contact CRUD → cross-tenant denial via `scripts/smoke-container.mjs`.
- `pnpm dev` is `turbo watch dev` with `^build` and explicit `passThroughEnv` (migration
  credentials never reach the API).

Verified on this branch (Windows, Node 24.21.0, Docker 29.7.2): `tsc --noEmit` clean for
`@maria/database` + `@maria/auth`; `prettier --check` clean on all new files.

Still outstanding: full `pnpm verify` (incl. new integration tests), `.codex/` agents
realignment (they reference skills that still exist but were slimmed), and an automated
browser suite — the manual browser checklist in `DEVELOPMENT.md` governs UI changes meanwhile.

## Environment

Docker is available locally; integration tests run through Testcontainers. Chromium
automated browser runs lack `libnspr4` — manual browser checks per `DEVELOPMENT.md`.
Use `nvm use` for Node 24.21.0 and Corepack for pnpm 11.26.0. Local dev setup follows
`DEVELOPMENT.md` (fresh DB → `db:migrate --provision-runtime` → runtime `DATABASE_URL`).

## Next actions

1. Land this review PR, then implement messaging per ADR 0010: `@maria/messaging` contracts +
   `channel_instances`/`conversations`/`messages`/`webhook_events` migration, WAHA inbound
   webhook first. Outbound stays disabled until each adapter meets the ADR 0010 contract.
2. Realign `.codex/agents/*.toml` if stale references surface.
3. Deferred: vendored shadcn/ui primitives, contact detail pages, stage rename/reorder UI,
   admin user rename, code-simplifier leftovers from PR #29, Playwright suite.

Update this file in place as status changes. Replace stale facts; do not add transcript, secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
