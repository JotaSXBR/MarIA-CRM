# 0005 — Global admin model

**Status:** accepted (implemented in PR #23, UI in #28)

**Superseded:** 2026-09-16 by [ADR 0011](0011-admin-invariant-concurrency.md), including
the concurrency guarantee and correction of the historical index claim below.

## Context

Two role axes exist: `users.is_admin` (platform-level) and `memberships.role`
(`admin`/`member` per workspace). The open question was whether workspace admins manage
their own workspace's memberships or only the global admin does.

## Decision

- Global `is_admin` manages users, organizations, workspaces and memberships via
  `/admin/*`; enforcement is server-side (`session.isAdmin`), the UI link is cosmetic.
- Workspace `admin` role manages workspace data (deleting contacts/companies, pipeline
  admin) but **not** memberships — matches the product model of an operator-run instance.
- Anti-lockout guards: cannot demote/remove the last workspace admin, cannot deactivate
  the last active global admin (409).

## Consequences

- Delegated org-level administration is deliberately unsupported; revisit only when a
  real multi-operator deployment needs it.
- `memberships` gained a unique index on `(user_id, workspace_id)` — the declared schema
  index never existed before migration 0005.
