# 0003 — Web stack: TanStack Router/Query + Vite proxy

**Status:** accepted (implemented in PR #24)

## Context

The SPA needed routing, server-state and an auth/session model. Evaluated against
open-source boilerplates matching our baseline (`React-Vite-Tanstack-Starter-Template`,
`viniarruda/react-boilerplate`) and CRM UX references (Synthor evidence, atomic-crm).

## Decision

- **TanStack Router** (code-based route tree, `beforeLoad` auth guard) over React Router —
  type-safe search params and first-party pairing with TanStack Query.
- **Vite dev proxy** forwards `/auth`, `/me`, `/admin`, `/contacts`, `/companies`,
  `/pipelines`, `/stages`, `/deals`, `/health` to the API — no CORS surface in dev;
  production is expected behind a same-origin reverse proxy.
- **`GET /me/workspaces`** resolves the membership-RLS bootstrapping problem with a
  declarative policy: `memberships` is readable when `workspace_id` matches the tenant
  context **or** `user_id` matches `app.user_id` (set via `withUser`); `WITH CHECK` stays
  workspace-scoped.
- shadcn/ui vendoring deferred until richer primitives are needed.

## Consequences

- Login → workspace selection → shell is fully client-side; the token lives in
  `localStorage` (acceptable for the current threat model; revisit if we add SSO).
- Any new API prefix needs a matching line in `apps/web/vite.config.ts` proxy config —
  a known footgun already hit once (pipelines routes missing).
