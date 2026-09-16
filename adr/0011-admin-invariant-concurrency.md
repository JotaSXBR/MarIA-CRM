# 0011 — Concurrent administrator protection

**Status:** accepted (2026-09-16; supersedes ADR 0005)

## Context

Sequential count-then-write checks do not preserve the last-admin invariant across transactions.
Tests using a single runtime connection serialize requests and cannot demonstrate this guarantee.
ADR 0005 also conflated adding a named index with introducing membership uniqueness.

## Decision

Retain two role axes: global `users.is_admin` authorizes server-side administration of users,
organizations, workspaces and memberships; workspace `admin` manages workspace data, not memberships.
Org-level delegated administration remains unsupported. UI visibility is not authorization.

Serialize last-global-admin checks and deactivation with a transaction-local global lock; serialize
membership demotion/removal with a transaction-local per-workspace lock. Acquire the relevant lock
before reading the condition and hold it through mutation/commit. Preserve scoped transactions and
RLS; never use application-only mutexes, because multiple API processes share the database.
Conflicting operations must leave an administrator and return `last-admin`/HTTP 409 for the loser.

Tests use independent runtime pools/connections and deliberately overlapping operations for global
deactivation, workspace demotion/removal and mixed membership operations. Transaction completion
must release locks, including error/rollback paths. Future admin-mutating paths share this protocol.

Historical correction: migration 0002 already declares `UNIQUE (user_id, workspace_id)`; migration
0005 adds a separate named unique index on the same columns. Do not rewrite applied SQL to correct
this history. Removing a redundant index, if needed, belongs in a separately reviewed migration.

## Consequences

Writes affecting one protected admin set serialize; unrelated workspaces can proceed independently.
Advisory locks protect cooperating application paths, not arbitrary privileged SQL. Keep privileged
maintenance outside application runtime and subject to review. Database-backed concurrency tests
are required evidence; successful sequential tests alone are insufficient.
