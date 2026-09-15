# 0002 — Local authentication over WorkOS

**Status:** accepted (implemented in PR #18; supersedes the `Auth MVP` baseline row in
AGENTS.md §5)

## Context

The original baseline assumed WorkOS AuthKit behind `@maria/auth`. For a self-hosted,
operator-administered CRM, hosted identity was judged overkill: the admin creates users in
the control panel and invitations via Resend are paused indefinitely.

## Decision

- Local email+password identity with opaque session tokens, inside `@maria/auth`.
- Local org/workspace/membership authorization remains canonical (AGENTS.md §6 already
  required this regardless of the identity provider).
- External providers may be added later behind the same port; nothing in the domain or API
  depends on local password auth specifically.

## Consequences

- `@maria/auth` owns `users`, `sessions`, `memberships` and admin management operations.
- `GET /me` exposes `{userId, email, name, isAdmin}` for session-aware UI.
- The `Auth MVP` row in AGENTS.md §5 was updated to match; WorkOS is no longer baseline.
