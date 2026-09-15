# 0006 — pnpm override for transitive uuid

**Status:** accepted (implemented in PR #26)

## Context

Dependabot flagged `uuid < 14.0.0` (missing buffer bounds check) and could not open a fix:
`uuid` is transitive via `dockerode → testcontainers` (devDependencies only), resolved at
10.x, and Dependabot has no mechanism to bump it.

## Decision

Workspace-level `overrides: uuid: "14.0.2"` in `pnpm-workspace.yaml` — pnpm 11 no longer
reads `pnpm.overrides` from `package.json`.

## Consequences

- `pnpm why uuid` resolves 14.0.2; Testcontainers verified working with uuid 14.
- The override should be removed once dockerode bumps its own uuid range.
- If Dependabot alerts for another transitive-only dependency, an override is the
  established fix path.
