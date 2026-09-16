# Architecture Decision Records

Use **Status · Context · Decision · Consequences**. AGENTS.md owns operational obligations;
ADR 0009 defines the record lifecycle.

- Record durable architecture, auth/authz, tenancy, migration-strategy or material dependency
  decisions. Routine work spanning packages or sessions is not alone an ADR trigger.
- States: proposed, accepted, rejected, superseded. Acceptance does not mean implementation.
  Identify implementation evidence or state that implementation is planned.
- Preserve accepted bodies. Append status/supersession/evidence metadata and link replacements;
  record historical corrections without rewriting the original decision.
- Keep verification/approval evidence in the PR and the latest checkpoint in HANDOFF.md.

| #    | Title                                                                                  | Status                           |
| ---- | -------------------------------------------------------------------------------------- | -------------------------------- |
| 0001 | [Record decisions](0001-record-decisions.md)                                           | superseded by 0009               |
| 0002 | [Local authentication](0002-local-authentication.md)                                   | accepted                         |
| 0003 | [Web stack](0003-web-stack.md)                                                         | accepted                         |
| 0004 | [Pipeline ordering](0004-pipeline-ordering.md)                                         | accepted                         |
| 0005 | [Global admin model](0005-global-admin-model.md)                                       | superseded by 0011               |
| 0006 | [uuid override](0006-uuid-override.md)                                                 | accepted                         |
| 0007 | [Agent tooling](0007-agent-tooling.md)                                                 | superseded by 0009               |
| 0008 | [Messaging model](0008-messaging-waha-meta.md)                                         | superseded by 0010               |
| 0009 | [Development contract and verification](0009-development-contract-and-verification.md) | accepted                         |
| 0010 | [Messaging effect recovery](0010-messaging-effect-recovery.md)                         | accepted; implementation planned |
| 0011 | [Concurrent administrator protection](0011-admin-invariant-concurrency.md)             | accepted                         |
| 0012 | [Transactional migration history](0012-transactional-migration-history.md)             | accepted                         |
