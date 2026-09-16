# MarIA CRM

MarIA CRM is an independent, multi-tenant, agent-native CRM where AI agents and human operators
share the same workspace, inbox, contacts, companies, pipelines, tasks and knowledge.

## Status

Phase 0 has started with a pnpm/Turborepo workspace and a Fastify API. `GET /health`
returns `{"status":"ok"}` as a process liveness check, not database readiness.
Local email/password authentication with workspace membership authorization is
implemented; contacts, companies and pipelines/stages/deals expose
workspace-scoped list, create, read, update and soft-delete endpoints, and
`/admin/*` covers user, organization, workspace and membership management for
global admins. Workers are not implemented yet. The web app has a login flow,
workspace selection, a drag-and-drop Kanban board, contacts/companies CRUD
screens, and an admin panel backed by the API.

## Development

Use the Node.js version in `.nvmrc` and pnpm from `package.json#packageManager`.
Follow [DEVELOPMENT.md](DEVELOPMENT.md) for the complete Windows/WSL setup: database,
migrations, restricted runtime credentials and initial administrator. The commands below
assume that preparation is complete.

```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm dev
```

The API listens on `http://127.0.0.1:3000` and the web app on `http://localhost:5173`.
Set `HOST` and `PORT` to override the API;
`PORT=0` selects an available port. SIGINT and SIGTERM close the server gracefully.

```bash
pnpm verify
```

This checks formatting, type-aware lint, strict TypeScript, unit tests, Fastify
integration tests, the built server over HTTP (including shutdown), and compilation.
Each gate is also available separately: `fmt:check`, `lint`, `typecheck`, `test`,
`test:integration`, `test:e2e`, and `build`. `pnpm fmt` applies formatting.
The initial end-to-end test covers the API process. Database integration tests use
Testcontainers and require a running Docker engine; they fail if Docker is unavailable.
Automated browser E2E is not implemented; interactive flows currently have component tests.
The required browser checks and remaining automation gap are documented in DEVELOPMENT.md.

Resolved dependencies are pinned in the lockfile; manifests contain exact versions or declared
compatible ranges. Fastify (MIT) supplies HTTP
routing, schemas and Pino logging; the Node HTTP module was considered, but Fastify
is the repository baseline. The web app uses React, TanStack Router and
TanStack Query, Tailwind CSS v4 and Vite (all MIT) for the SPA; the Vite dev
server proxies API paths to `localhost:3000`, so no CORS setup is needed. Tooling uses MIT licenses except TypeScript (Apache-2.0).
Dependency lifecycle scripts are not approved in this slice.
CI must install with `pnpm install --frozen-lockfile`.

## PostgreSQL foundation

`@maria/database` provides a Drizzle connection and workspace-scoped transactions.
The caller must authorize the workspace before entering a transaction. This helper
sets transaction-local context; PostgreSQL RLS policies remain the isolation boundary.
Workspace-scoped contact and company endpoints (`GET`/`POST /contacts`,
`GET`/`PATCH`/`DELETE /contacts/:id`, and the same set under `/companies`)
require a valid session token and an active membership in the requested
workspace. `DELETE` requires the workspace `admin` role and performs a soft
delete (`deleted_at`) through `UPDATE`, so the runtime role keeps least
privilege without a `DELETE` grant. `/health` remains a liveness check.

Pipelines, stages and deals follow the same contract (`/pipelines`,
`/pipelines/:id/stages`, `/deals`, `/deals/:id/move`). Cards and columns are
ordered by fractional-indexing position strings; deal references to contacts,
companies, pipelines and stages are validated by scoped reads inside the
workspace transaction rather than relying on foreign keys for tenancy. A
pipeline or stage with active deals cannot be deleted (409).

Global-admin routes under `/admin` (`GET`/`PATCH /admin/users`,
`GET`/`POST /admin/organizations`, `GET`/`POST /admin/workspaces`,
`GET /admin/workspaces/:id/members` and `POST`/`PATCH`/`DELETE
/admin/memberships`) require a session whose user has `is_admin`. Membership
writes run inside workspace-scoped transactions and refuse to remove or demote
a workspace's last admin; user deactivation likewise refuses the last active
global admin (409). `GET /me/workspaces` lists the caller's own memberships;
the memberships RLS policy additionally allows rows matching the
transaction-local `app.user_id` context, while writes still require the
workspace scope.

For a persistent local PostgreSQL 18.6 instance, set `POSTGRES_PASSWORD` in your shell
to a local development password, then run:

```bash
docker compose -f docker/compose.yaml up -d --wait
docker compose -f docker/compose.yaml exec postgres psql -U maria_admin -d maria
docker compose -f docker/compose.yaml down
```

The database listens only on `127.0.0.1:5432`. Its named volume survives `down`;
the password initializes a new volume and does not rotate an existing database password.
The `maria_admin` account is for local administration, never application runtime.
The runtime-role migration provisions `maria_runtime` without a password, privileged role
attributes or table ownership. Subsequent migrations grant the operations used by auth and CRM.
Use the shared migration runner and provisioning procedure in DEVELOPMENT.md; existing unmanaged
databases require an explicit adoption plan. Deployment credentials belong in the secret manager.

The integration suite starts its own disposable database, separate from this local
volume. It applies the checked-in migrations through the shared runner and tests runtime-role
restrictions, cross-workspace isolation, transaction cleanup and admin concurrency. Remaining
product schemas and pgvector are deferred until their first consuming feature.
Drizzle ORM (Apache-2.0), node-postgres (MIT), and Testcontainers (MIT, test-only) use
the established stack; an in-memory substitute cannot verify PostgreSQL RLS behavior.
New dependencies are pinned and installed without approving lifecycle scripts.

## Docker

After preparing the local DB and exporting DATABASE_URL/ADMIN_EMAIL/ADMIN_PASSWORD as described
in DEVELOPMENT.md, build and run the API from the repository root. A DB bound to host loopback
requires appropriate container networking; the example uses Docker Desktop's host gateway:

```bash
docker build -f docker/api.Dockerfile -t maria-api:local .
docker run --rm --read-only --cap-drop ALL --security-opt no-new-privileges \
  -e DATABASE_URL=postgres://maria_runtime:local-runtime-change-me@host.docker.internal:5432/maria \
  -e ADMIN_EMAIL -e ADMIN_PASSWORD \
  -p 127.0.0.1:3000:3000 maria-api:local
```

The image runs as the `node` user with production dependencies only. Its health
check calls `/health`; `docker stop` sends SIGTERM for graceful shutdown. Build
inputs are allowlisted in `.dockerignore`, excluding local research and secrets.

The Dockerfile temporarily overlays Node 24.21.0 from the official archive onto a
digest-pinned Node 26.8.1 base. Both build and runtime use 24.21.0; the overlay supports
amd64 and arm64, with local verification on amd64. Replace this bootstrap when an official
Node 24.21.0 image is published.

## Continuous integration

Pull requests and pushes to `main` run the verification gates, production dependency
audit, Docker build, and a smoke test of the non-root, read-only container using the restricted
database role, login, scoped CRUD and a denied cross-tenant request.
CodeQL analyzes JavaScript/TypeScript separately. Actions are pinned to commit SHAs;
Dependabot checks npm, Docker and Actions updates weekly.

GitHub workflows take effect after these files are pushed. Repository administrators
still need to require `CI / verify` and `CodeQL / analyze` in branch protection and
enable secret scanning/push protection. GHCR publication and staging/production
deployment are not configured yet; production must promote the tested image digest.

Messaging and deployment wiring remain future slices; see HANDOFF.md for current priority.
Tenant-owned endpoints require authentication, RLS and cross-tenant tests before exposure.

## Start here

1. [`AGENTS.md`](AGENTS.md) — essential engineering and security contract.
2. [`ARCHITECTURE.md`](ARCHITECTURE.md) — product boundaries and target repository topology.
3. [`HANDOFF.md`](HANDOFF.md) — latest development checkpoint; verify it against Git and PR status.
4. [`DEVELOPMENT.md`](DEVELOPMENT.md) — reproducible setup, migrations and verification coverage.

## License

Licensed under the [GNU Affero General Public License v3.0](LICENSE).
