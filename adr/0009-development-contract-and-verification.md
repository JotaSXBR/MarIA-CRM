# 0009 — Development contract, approvals and verification evidence

**Status:** accepted (2026-09-16; supersedes ADRs 0001 and 0007)

## Context

Operational obligations were split across the engineering contract, ADRs, agent skills and
the handoff. Duplicate roadmaps and setup recipes drifted. Passing verification was recorded
without a revision or a clear distinction between API E2E and browser coverage.

## Decision

- `AGENTS.md` is the normative engineering contract, including tool routing and approvals.
  Skills explain repository-specific execution and link to maintained sources; they do not
  establish a second baseline or project roadmap.
- `DEVELOPMENT.md` owns reproducible setup, migration procedure and the verification matrix.
  Manifests/lockfile own executable commands and exact package versions. `HANDOFF.md` records
  the latest revision, checks, blockers and next action, rather than permanent rules or history.
- ADRs record durable decisions, alternatives and consequences. Routine changes spanning
  packages/sessions do not automatically require an ADR. Accepted records retain their body;
  changed decisions use a superseding record. Status, links and implementation evidence can
  be appended without rewriting the historical decision.
- States are `proposed`, `accepted`, `rejected`, `superseded`. Acceptance is a design decision,
  not proof of implementation. Record implementation evidence separately. Sensitive decisions
  require the approval described in AGENTS.md before acceptance/implementation.
- Explicit authorization for the corrections described in the repository review covers local
  implementation of this change, including auth concurrency and migration tooling. Merge and
  deployment remain separate approvals; this record does not authorize production operations.
- Every check reports revision, dirty scope, date, environment and outcome. A blocked check
  remains outstanding. Manual browser inspection does not count as automated browser E2E.

## Consequences

Local setup and CI must exercise the same migration runner. CI must smoke-test the final image
with the restricted runtime role and authenticated tenant operations. An ADR may be accepted
before its feature lands, but the architecture and handoff must make that distinction explicit.
The historical index claim in ADR 0005 is corrected in ADR 0011 without editing its accepted body.

Alternatives rejected: keep multiple independent setup documents, or require ADRs for every
multi-session edit. Both increase drift and review work without documenting an actual decision.
