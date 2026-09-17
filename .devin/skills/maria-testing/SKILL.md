---
name: maria-testing
description: Select and implement MarIA CRM tests for API, database, tenant isolation and UI changes.
---

# MarIA CRM testing

Use the scope matrix in root DEVELOPMENT.md; executable commands live in manifests.
pnpm test:e2e currently tests the built API over HTTP, not a browser.

Examples: packages/database/test/rls.integration.test.ts,
packages/auth/test/auth.integration.test.ts, apps/api/test/auth.integration.test.ts,
apps/api/test/server.e2e.test.ts and apps/web/test/app.test.tsx.

- Reuse packages/database/test/utils/postgres.ts and the shared migration runner.
  Do not maintain another migration filename list. Docker failure must fail integration,
  not silently skip PostgreSQL assertions.
- Test tenant-owned behavior with the runtime role: cross-tenant reads/writes/references,
  missing scope, rollback and pooled context cleanup. Admin connections are for fixtures.
- Multi-row invariants require deliberately overlapping transactions on independent
  connections. A max:1 shared pool cannot prove concurrency safety.
- Migration checks cover empty DB, prior-prefix upgrade with preserved data, no-op rerun,
  invalid SQL rollback and changed/unknown history rejection.
- happy-dom component tests do not prove browser routing, proxy behavior or drag-and-drop.
  Submit forms with fireEvent.submit(form) where the existing tests require it.
- Await expected rejections before rollback assertions; close pools/containers in cleanup.
- Record command, revision/dirty scope, date, environment, result and missing checks.

The ADR 0010 dispatch ledger is implemented: packages/database/test/messaging.integration.test.ts
covers exclusive claims on independent connections, fencing/lease expiry and cross-tenant
isolation. Extend those tests for messaging changes. Still absent: a dedicated worker process
and the agent runtime — never claim coverage for either.
