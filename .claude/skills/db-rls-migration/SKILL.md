---
description: Safely change MarIA PostgreSQL/Drizzle schema, migrations or RLS. Use whenever a task touches tenant-owned persistence.
---

# DB / RLS migration

1. Read `docs/engineering/DATABASE-TENANCY.md`.
2. Identify ownership: workspace-owned, org-owned, global/system.
3. For tenant-owned tables define the tenant FK(s) and RLS policy before application access.
4. Ensure app DB role cannot own/bypass protected tables.
5. Generate migration, then read the SQL line-by-line.
6. Do not use `drizzle-kit push` outside disposable local development.
7. Prefer expand/contract. Flag DROP/TRUNCATE/destructive rewrite for human approval.
8. Add RLS tests proving tenant A succeeds and tenant B/missing context fails.
9. Run migration from empty DB and relevant upgrade path with Testcontainers.
10. Verify pool-safe transaction-local tenant context.
11. Include migration/rollback/backup notes in PR.
