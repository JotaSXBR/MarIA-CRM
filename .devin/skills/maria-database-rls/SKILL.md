---
name: maria-database-rls
description: Change MarIA CRM persistence, SQL migrations and scoped transactions while preserving tenant isolation. Applies when touching packages/database schema, migrations or scoped transaction helpers.
---

# MarIA CRM database and RLS

Read root AGENTS.md section 4.1, DEVELOPMENT.md migration instructions and affected SQL/tests.
packages/database/src/index.ts owns scoped transaction helpers.

- Authorize the caller before withWorkspace. It validates scope/role and sets transaction-local
  context; it does not decide whether the caller belongs to that workspace.
- withUser supports membership bootstrap reads, not workspace-scoped writes.
- Preserve RLS and existing FORCE RLS. Runtime cannot own protected tables or have
  superuser/BYPASSRLS attributes.
- Validate related IDs in the same scoped transaction; simple FKs do not prove tenant equality.
- Align schema and reviewed SQL. Drizzle Kit is not configured: do not advertise an unavailable
  generator command. Add numbered SQL migrations; never rewrite applied SQL or push in production.
- Unique constraints over nullable columns do not deduplicate NULLs — PostgreSQL treats
  NULLs as distinct. When NULL must not duplicate, enforce that case with a partial
  unique index (see channel_instances, migration 0013). Where NULL-distinct is the
  intent (contacts.phone, messages.provider_message_id), mark it with a comment so
  the rule is not "fixed" by mistake.
- Use the shared migration runner for setup/tests/CI with a separate privileged connection.
  Reject changed history and unmanaged existing schemas. Existing DB adoption needs explicit
  backup/reconciliation planning, not automatic replay.
- Use migration 0001 and DEVELOPMENT.md provisioning instructions for runtime credentials.
  Do not copy ad hoc CREATE ROLE examples or secrets into source.
- Multi-row invariants need transaction-level serialization across processes (ADR 0011).
  In-process mutexes and sequential tests cannot prove safety.
- Use maria-testing for real PostgreSQL runtime-role isolation, rollback, context cleanup
  and concurrency checks.
- `jsonb_set` does not create intermediate path keys. For jsonb state columns (e.g.
  `workspaces.onboarding_state`) take `FOR UPDATE` and write the merged whole object.
