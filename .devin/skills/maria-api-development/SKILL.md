---
name: maria-api-development
description: Change MarIA CRM Fastify routes while preserving validation, session authorization and tenant boundaries.
---

# MarIA CRM API development

Read root AGENTS.md and affected accepted ADRs. Use actual dependency injection and
authorization helpers in apps/api/src/app.ts rather than a separate example interface.

- Validate input and response schemas; PATCH rejects empty updates.
- Verify session and authorize membership before workspace transactions.
  A client-supplied workspace ID is not authorization.
- Global administration checks session.isAdmin server-side. Workspace admins do not
  manage memberships. Preserve ADR 0011's concurrent anti-lockout guards.
- Keep business invariants in the responsible package and map results to HTTP in routes.
- New route prefixes require consideration in apps/web/vite.config.ts and browser/proxy
  verification. A SPA fallback returning HTML is not a successful API call.
- Follow apps/api/test/auth.integration.test.ts for real auth/DB tests and server.e2e.test.ts
  for the built process. An unregistered route returning 404 is not an authorization test.
- /health is liveness only. The final image smoke also exercises authenticated tenant
  operations with the restricted DB role.
- Signal handling is implemented in src/server.ts; Fastify does not replace that code.
- The WAHA webhook route (`POST /webhooks/waha/:workspaceId/:channelInstanceId`) implements
  ADR 0010: raw-body HMAC verification before parsing, per-session filtering and
  provider-event dedup. New provider webhooks follow the same pattern — never acknowledge
  before persisting.

Use maria-testing for check selection and maria-database-rls for persistence changes.
