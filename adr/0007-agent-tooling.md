# 0007 — Agent tooling policy

**Status:** accepted (2026-09-16)

**Superseded:** 2026-09-16 by [ADR 0009](0009-development-contract-and-verification.md).

## Context

Coding agents on this repo have several overlapping tool surfaces: repository skills
(`maria-*`, `code-simplifier`), the context7 docs MCP, a local git shell, the GitHub MCP
server and the `gh` CLI. Without a stated policy, usage is inconsistent and review cannot
tell whether a step was skipped deliberately.

## Decision

- **Invoke the matching `maria-*` skill at the start of every slice** — they encode
  project conventions (RLS, API DI, testing strategy) that take precedence over generic
  habits.
- **context7 for any newly introduced library** or when API details are uncertain;
  `web_search` for ecosystem research (boilerplates, comparisons).
- **Local git via shell for all working-tree operations** — checkout, stash recovery,
  cherry-pick, commit, push. The git MCP adds indirection without covering interactive
  recovery flows.
- **`gh` CLI for routine GitHub ops** (PRs, checks, runs); the github-mcp-server for
  richer queries (cross-repo search, issue triage, line-level PR review comments).
- **`/code-simplifier`** runs read-only review passes on demand; findings are applied
  only after explicit approval.

## Consequences

- Tooling choices become auditable: a slice that skipped its skill invocation is visible
  in the transcript and can be challenged in review.
- This ADR is the tie-breaker when two tools overlap; prefer the one listed first.
