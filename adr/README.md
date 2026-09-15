# Architecture Decision Records

Short, append-only records of decisions that shape the system. Each ADR uses a light MADR
format: **Status · Context · Decision · Consequences**. ADRs are retrospective when backfilled
— they record what was decided and why, not what might be.

Rules:

- New architectural, auth/authz, tenancy or dependency decisions get an ADR in the same PR.
- ADRs are challenged against reality: when the code drifts from a record, either fix the code
  or mark the ADR `superseded` and link the replacement.
- Keep them short. Evidence lives in the PR; the ADR lives here.

| #    | Title                                                                         | Status   |
| ---- | ----------------------------------------------------------------------------- | -------- |
| 0001 | [Record decisions as ADRs](0001-record-decisions.md)                          | accepted |
| 0002 | [Local authentication over WorkOS](0002-local-authentication.md)              | accepted |
| 0003 | [Web stack: TanStack Router/Query + Vite proxy](0003-web-stack.md)            | accepted |
| 0004 | [Pipeline ordering, soft delete and drag-and-drop](0004-pipeline-ordering.md) | accepted |
| 0005 | [Global admin model](0005-global-admin-model.md)                              | accepted |
| 0006 | [pnpm override for transitive uuid](0006-uuid-override.md)                    | accepted |
| 0007 | [Agent tooling policy](0007-agent-tooling.md)                                 | accepted |
