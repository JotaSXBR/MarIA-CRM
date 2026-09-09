# Authentication & Authorization

## Decision

For the MVP, use **WorkOS AuthKit** behind the `@maria/auth` port. WorkOS authenticates the
external identity; MarIA PostgreSQL remains the authority for product tenancy and authorization.

This is an adapter decision, not a domain dependency. A future self-hosted provider MUST be
replaceable without changing CRM-owned IDs, RLS policies or business records.

## MVP authentication

Baseline:
- AuthKit hosted authentication;
- email/password and selected social OAuth providers;
- MFA/TOTP available and recommended for privileged users;
- secure server-managed session/cookie flow;
- local account linking from external subject to `users`;
- explicit organization/workspace selection after authentication where applicable.

Passkeys are **not an MVP requirement**. WorkOS supports WebAuthn/passkeys, but production passkeys
should be enabled only after the project is ready to configure the required stable/custom auth
domain and accepts any associated provider cost. Do not compromise portability to add them early.

## Canonical local model

At minimum keep local records equivalent to:
- `users` — MarIA user ID and profile fields owned by the product;
- `auth_identities` — provider + external subject -> MarIA user;
- `orgs`;
- `workspaces`;
- `memberships` — user access to org/workspace and local authorization state;
- `service_principals` / equivalent — non-human first-party identities when needed.

External provider IDs MUST NOT be primary/foreign keys throughout business tables.

## Request authentication flow

1. Browser authenticates with the configured identity provider.
2. API validates the session/token using the provider-supported server flow.
3. Resolve the external subject to the local MarIA user.
4. Resolve the requested workspace and active local membership.
5. Build an internal `AuthContext` with local IDs and permissions.
6. Start the database transaction and set transaction-local tenant context.
7. RLS + application policy enforce data access independently of the provider.

Never set RLS tenant context from an unvalidated browser-provided workspace ID alone.

## Authorization

Separate authentication from authorization:
- WorkOS/provider claims may be useful input, but MarIA policy is authoritative for CRM actions;
- coarse roles may be synchronized/mapped, but permissions used by domain tools must resolve to
  stable internal permission slugs;
- `PolicyEngine` authorizes privileged actions and AI tools;
- RLS is an independent lower-level boundary, not a replacement for action authorization;
- agent prompts/models never decide authorization.

Start with a small role model (for example owner/admin/member/agent operator) and granular internal
permissions for sensitive actions. Avoid role explosion.

## API, MCP and machine identities

Do not reuse end-user session cookies as generic machine credentials.

For programmatic access:
- use revocable scoped API credentials or OAuth/M2M-style tokens;
- store only hashes/identifiers for locally managed long-lived secrets;
- prefer short-lived tokens where the provider/protocol supports them;
- bind credentials to an org/workspace and permission ceiling;
- log credential creation/revocation and privileged use without logging secret values.

Remote MCP follows the current MCP authorization model. MCP identity authenticates the caller but
still passes through MarIA membership/PolicyEngine checks before mutations.

First-party runtime agents should have explicit local principals/permission ceilings. Do not make a
new external "agent auth" service a hard dependency of the Execution Plane in the MVP.

## Sessions and security

- cookies: `Secure`, `HttpOnly`, appropriate `SameSite`, narrow domain/path;
- validate access/session state server-side on every protected request;
- rotate/revoke sessions after credential/security events where supported;
- CSRF-protect cookie-authenticated state-changing endpoints when browser behavior requires it;
- rate-limit auth-sensitive endpoints;
- never log access tokens, refresh tokens, authorization codes or provider secrets;
- privileged accounts SHOULD use MFA;
- impersonation/support access, if ever added, requires audit log, visible banner and strict policy.

## Environment separation

Use distinct provider environments/credentials for local/staging/production where supported.
Production credentials never enter preview/local environments.

The app's local IDs must remain stable within each environment; do not copy real production PII to
staging merely to reproduce auth behavior.

## Future self-hosted auth phase

A self-hosted/internal provider can replace AuthKit when product economics, compliance or control
justify it. Migration should only require a new `AuthPort` adapter and identity-link migration,
not rewrites of CRM tenant-owned data.

Before switching providers, rehearse:
- account linking and duplicate-email cases;
- session invalidation;
- OAuth redirect/domain changes;
- MFA/passkey migration limitations;
- rollback window;
- auditability and tenant isolation.
