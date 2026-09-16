# 0012 — One transactional migration runner

**Status:** accepted (2026-09-16)

## Context

Development replayed SQL manually, tests hardcoded a filename list and CI used a shell glob.
The workflows could apply different schemas and had no shared history for an existing database.

## Decision

Use the same PostgreSQL runner in `packages/database/src/migrate.ts` for setup, tests and CI.
Discover numbered SQL files in order and require applied history to be an unchanged prefix,
identified by filename and SHA-256 checksum in `public.maria_schema_migrations`. Serialize runners
with a database transaction advisory lock. Apply pending SQL and ledger changes in one transaction;
any SQL failure rolls back that batch. This strategy supports transactional SQL only.

The CLI requires a separate privileged `MIGRATION_DATABASE_URL`. Runtime password provisioning is
an explicit opt-in operation using a separate environment variable and does not emit credentials.
The API continues to use only its restricted runtime connection.

Reject nonempty databases without a ledger, altered checksums, unknown history entries, gaps or
retroactively inserted migrations. Do not infer historical application from table names. Legacy
manual installations require backup, schema/history reconciliation and a reviewed adoption plan;
there is no automatic baseline command. Do not modify historical migrations as part of this change.

## Consequences

New migrations automatically enter the same path in all environments. Tests cover empty DB,
upgrade with existing data, rerun, rollback and invalid history. The container smoke provisions
through this runner, then runs authenticated CRUD with the runtime role. Deployment wiring remains
planned and must use this runner as a separate privileged step rather than grant migrations to API.

Rejected alternatives: continue raw SQL replay (no durable history), silently adopt existing tables
(cannot prove the applied schema), or introduce a second migration tool/configuration while Drizzle
Kit has no established metadata baseline. Nontransactional DDL needs a future reviewed strategy.
