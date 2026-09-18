# 0015 — Workspace roles and onboarding

**Status:** accepted (2026-09-18; merged in PR #73)

Supersedes part of [ADR 0011](0011-admin-invariant-concurrency.md): the
"workspace admin does not manage memberships" restriction. The lock protocol
and last-admin invariants of ADR 0011 are retained and extended.

## Context

Today the installed instance bootstraps a global admin via `ADMIN_EMAIL` /
`ADMIN_PASSWORD` env vars, with no first-run UI, no invites and no onboarding.
Membership roles are `admin | member`, and only the global admin manages
users, organizations, workspaces and memberships (`/admin/*`, ADR 0005/0011).

Product direction: an installed instance has **one master user** (platform
administrator) who creates workspaces; **each workspace administers itself** —
its own admin and its own members — with four roles: Admin, Manager, Agente
(agent attendant), Viewer.

Research evidence (2026-09-18, `research/` local notes): DeskcommCRM runs the
same ranked model (`viewer < agent < manager < admin` + transversal platform
admin + DB-resolved `requireRole(min)` + `onboarding_state` jsonb wizard);
fazer-ai/agents runs `/setup` first-run with a boot-logged single-use token,
advisory-lock bootstrap and hashed-token invitations; erxes/ever-gauzy confirm
that a per-user `isOnboarded` flag and an owner-only extra step suffice —
granular permission matrices are unnecessary at this scale.

## Decision

1. **Two orthogonal axes, kept.** `users.is_admin` remains the platform
   administrator (creates organizations, workspaces and users; grants no
   workspace membership by itself). The platform administrator **administers
   without operating**: `is_admin` confers no implicit read or write access
   to workspace data — RLS and membership remain the only paths in. An
   audited support/impersonation mode may revisit this later; it is out of
   scope here. `memberships.role` becomes an ordered rank:
   `viewer(1) < agent(2) < manager(3) < admin(4)`. Existing `member` rows
   migrate to `agent`.
2. **Single authorization guard.** `ROLE_RANK` in `@maria/auth` and a
   `requireWorkspaceRole(min)` guard in `apps/api` replace every inline
   `membership.role !== "admin"` comparison. Roles are resolved from the
   database per request; UI visibility is never authorization.
3. **First-run `/setup` — visual entrance now, agent entrance later.** The
   product ships a visual first-run experience _before_ the app loads: when
   `users` is empty the API reports `setupRequired` and the web app routes
   anonymous traffic to `/setup` (create the master account, then the first
   workspace). `SETUP_TOKEN_REQUIRED` (default on) logs a single-use setup
   URL at boot; `POST /setup` creates the master user as `is_admin` inside a
   transaction with a global advisory lock plus a user-count re-check, so
   concurrent setups cannot mint two masters. `ADMIN_EMAIL`/`ADMIN_PASSWORD`
   env seeding stays as the non-interactive alternative (install scripts);
   whichever path runs first wins. A `/setup-mariacrm` agent skill — an
   operator agent conducting the same bootstrap over MCP — is a planned
   second entrance to the _same_ invariant (MCP server not yet implemented);
   it reuses `POST /setup` semantics and never a separate privilege path.
4. **Delegated membership administration.** A workspace `admin` manages the
   memberships of _their own_ workspace: list, invite, change role, remove —
   subject to the ADR 0011 per-workspace advisory lock and last-admin guard.
   A grant never exceeds the grantor's rank: `admin` may grant `admin`;
   `manager` may invite/manage `agent` and `viewer` only; `viewer`/`agent`
   manage nothing. The global admin retains `/admin/*` over everything.
5. **Workspace invitations.** New `invitations` table scoped by
   `workspace_id`: `email`, `role` (CHECK excludes nothing below `admin` —
   platform admin is never invitable), `token_hash`, `expires_at`,
   `consumed_at`, `invited_by`; one live invite per `(workspace_id, email)`.
   The plaintext link is shown once and is copyable — self-hosted installs
   have no guaranteed SMTP. Accepting at `/invite/:token` creates the user
   (name + password) or attaches an already-authenticated user, consumes the
   invite atomically and lands them in the workspace.
6. **Workspace onboarding.** `workspaces` gains `onboarding_state` (jsonb)
   and `onboarded_at`. A single step registry drives routing, progress and
   the final summary: each step declares whether it exists in this install,
   whether it is done and whether it was skipped (skipped ≠ done). Initial
   steps: workspace basics (name, business niche) → connect WhatsApp →
   invite team → review. A member whose workspace is not onboarded is routed
   to the wizard; finishing lands them in the app with the workspace
   selected.
7. **Organizations stay implicit.** Onboarding creates the default
   organization plus the first workspace in one step; the extra hierarchy
   level is not exposed to the operator.
8. **Capability matrix (initial, refinable per route).**
   `viewer`: read-only CRM. `agent`: + create/edit contacts, companies,
   deals, notes, tasks; reply in inbox; tag entities; move deals inside the
   pipeline when the configured scope permits (item 9). `manager`: + entity
   deletes, pipeline/stage/tag/attribute management, channel configuration.
   `admin`: + membership management and workspace settings. Exact route
   gates land in the implementation PRs; changes to this matrix are review
   items, not architecture.
9. **Configurable per-membership scope is a designed possibility.**
   Deskcomm's `VisibilityMode` (`all | own_and_unassigned | own`, restricting
   `agent` only) shows that one rank can carry a configurable scope set per
   membership by an admin: which conversations an agent sees, and which
   pipelines they may act on. MarIA adopts the same seam — optional scope
   fields on `memberships` may _narrow_ what `agent` sees and which pipelines
   they may move, never widen the rank. The v1 matrix ships the default
   scope; configurable scopes land with the members UI.

## Out of scope (recorded, not decided)

- **AI agents are the last development movement.** The onboarding wizard
  ships without agent-setup steps; machine autonomy (deskcomm's
  `ai_operator` token scope, never a `memberships` row), the
  `/setup-mariacrm` MCP skill and any agent-facing wizard steps join only
  when the Execution Plane exists.
- Audited support/impersonation mode for the platform admin.
- SMTP-delivered invites (needs a `MailPort`); SSO/external identity.
- Collapsing the `organizations → workspaces` hierarchy.

## Consequences

- ADR 0011's delegation restriction is superseded; its concurrency protocol
  (advisory lock before condition read, held through commit; `last-admin` → 409) now also covers workspace-admin-driven membership mutations and must
  be tested with independent connections.
- Every route that branches on role moves to `requireWorkspaceRole(min)`;
  the scattered role checks are removed in the same slice.
- `GET /setup/status`-style capability reporting lets the SPA gate routes
  without a failed-request round trip; tokens and flags remain server-side.
- Invite plaintext is shown once; the table stores only `token_hash`, so
  database reads cannot leak usable links.
- Onboarding state is tenant data: it lives on `workspaces`, is covered by
  RLS/workspace scoping like every tenant row, and is reset only by
  workspace deletion.
- Migration maps `member → agent`; the `(user_id, workspace_id)` uniqueness
  and RLS posture are unchanged.
