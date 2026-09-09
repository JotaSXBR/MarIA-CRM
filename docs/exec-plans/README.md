# Execution Plans

Use an execution plan when work is cross-cutting, architectural, migration-heavy, expected to span
multiple sessions, or difficult to verify in one small diff.

Active plans: `docs/exec-plans/active/`
Completed plans: `docs/exec-plans/completed/`

## Template

```markdown
# <Outcome>

## Context
Why this exists; link issue/spec/ADR.

## Goal
Observable end state.

## Non-goals
Explicit boundaries.

## Constraints / invariants
RLS, compatibility, security, deployment, etc.

## Current-state evidence
Files/contracts/tests inspected.

## Design
Chosen approach and alternatives rejected.

## Milestones
- [ ] vertical slice 1
- [ ] vertical slice 2
- [ ] tests/docs
- [ ] rollout

## Verification
Exact commands and manual/e2e checks.

## Risks / rollback
What can fail and how to recover.

## Decisions / discoveries
Append dated decisions as implementation proceeds.
```

Keep the plan live. Move it to `completed/` when the shipped state matches the goal.
