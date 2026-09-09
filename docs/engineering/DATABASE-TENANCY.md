# Database & Tenancy

## Canonical tenant model

`org` is the commercial/identity organization. A `workspace` is the principal CRM operating
boundary. Most business data is owned by exactly one workspace.

Do not blindly duplicate `org_id` and `workspace_id` on every row. Instead:
- workspace-owned rows: `workspace_id UUID NOT NULL`;
- org-owned rows: `org_id UUID NOT NULL`;
- rows intentionally carrying both must have a constraint/FK strategy that makes mismatches impossible.

This removes a consistency hazard in the original contract while preserving strong tenant isolation.

## RLS requirements

Every tenant-owned table:
1. `ENABLE ROW LEVEL SECURITY`;
2. normally `FORCE ROW LEVEL SECURITY`;
3. policies for `SELECT`, `INSERT`, `UPDATE`, `DELETE` as appropriate;
4. application role cannot own table and cannot have `BYPASSRLS`;
5. migrations/admin use a separate privileged role unavailable to application code.

RLS should read transaction-local context such as:
- `app.current_workspace_id`;
- `app.current_org_id`;
- optionally `app.current_user_id`.

## Pool-safe tenant context

Never do a session-scoped `SET app.current_workspace_id = ...` and then return that connection to
a pool.

Tenant queries run inside a DB transaction that first executes a transaction-local setting, e.g.
conceptually:

```sql
SELECT set_config('app.current_workspace_id', $1, true);
```

The `true` makes the setting local to the transaction. The database helper should make it difficult
to issue tenant queries outside this scoped transaction.

## Authorization path

1. API verifies external authentication.
2. External subject maps to local `user`.
3. Application verifies local active `membership`.
4. Policy layer resolves allowed workspace/permissions.
5. DB transaction sets tenant/user context.
6. RLS enforces row boundary independently of application filters.

WorkOS is not the RLS source of truth.

## Migrations

Production:
- generated/versioned SQL only;
- review generated SQL;
- expand → migrate/backfill → switch reads/writes → contract;
- destructive step requires human approval;
- no `drizzle-kit push`.

CI:
- create fresh PostgreSQL from zero and migrate to head;
- optionally restore previous migration snapshot and upgrade;
- run tenant-crossing negative tests;
- validate policies exist on expected tables.

## Queue/outbox locking

Workers claim durable rows with:
- status/available-at fields;
- bounded lease/lock owner;
- `FOR UPDATE SKIP LOCKED`;
- attempts/backoff/dead-letter policy.

`LISTEN/NOTIFY` can reduce polling latency but notifications are disposable wake-ups, never the
durable event source.
