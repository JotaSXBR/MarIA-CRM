# MarIA CRM handoff

Updated: 2026-09-19

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current objective

- `main` at `4dfbe5a` — PRs #61–#91 merged. **Phase 1 (access foundation + onboarding) is
  complete** per ROADMAP.md / ADR 0015. Phase 2 (human operator workflow) slices 2.1, 2.2 and
  2.3 are merged (#83, #90, #91).
- Open: PR #92 `feat/operator-work-center` — slice 2.4, checks passing, awaiting merge review.
- Open: branch `chore/agent-workflow-audit` — HANDOFF trimmed, skill frontmatter/permission fixes,
  durable lessons moved into skills, `task-observer` skill added, project `permissions.deny`,
  gitignore for local agent config.
- Product decisions (2026-09-19): AI direction interleaves observer-mode primitives as human
  features during Phase 2, autonomous execution waits for Phase 4; UI strategy is hybrid — correct
  design per feature, one density/empty-state pass closes Phase 2; role capability matrix stays
  as-is until more Phase 2 workflows exist.

## Memory model

- `AGENTS.md`: always-on normative invariants and delegation policy.
- `.devin/skills/`: focused procedures loaded only when relevant; durable lessons land here.
- `adr/`: durable architectural decisions and tradeoffs.
- `HANDOFF.md`: current branch, verified state, blockers and immediate next actions only.
- Git, PRs, migrations and test results remain the factual source of truth.

## Verified state

- `feat/operator-work-center` (PR #92, 2026-09-19, Windows/pnpm): `listWorkQueue` assembles
  five groups in one scoped read (`unassigned`, `awaitingReply`, `sendIssues`, `overdueTasks`,
  `idleDeals`); `GET /work-queue` (viewer+); `/` is the Central do operador. Full `pnpm verify`
  green on the branch; CI checks passing.
- `chore/agent-workflow-audit` (2026-09-19, Windows/pnpm): docs/config only; `pnpm fmt:check`
  is the required gate. No product code changed.

## Blockers and risks

- None blocking.
- Known CI flakes and their fixes are recorded in `maria-testing` (testTimeout, pool error
  silencing, lease clock skew, transient audit 503s).

## Deferred

- mime→kind mapping exists twice (`attachmentContentType` in `routes/messaging.ts` vs
  `mediaKindFromMime` in `channel-waha`, opposite directions). Consolidate in `@maria/messaging`
  only when a third use appears.
- Deal creation inside the conversation context panel (needs pipeline/stage pickers).
- Consolidated permission-matrix review after enough Phase 2 functionality exists.
- Attribute-based filtering in list views.

## Next actions

1. Merge #92, then pick the next Phase 2 slice at the ROADMAP checkpoint — candidates: next
   action/follow-up on deals, deal creation inside the conversation panel, then the Phase 2
   density/empty-state pass. Proposed ADRs 0016–0018 (observer modes, tool catalog, rationale)
   frame the later AI work.
2. Open a PR for `chore/agent-workflow-audit` with the audit findings as evidence.
