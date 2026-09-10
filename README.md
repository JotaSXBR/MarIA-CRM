# MarIA CRM

MarIA CRM is an independent, multi-tenant, agent-native CRM where AI agents and human operators
share the same workspace, inbox, contacts, companies, pipelines, tasks and knowledge.

## Status

Phase 0 has started with a pnpm/Turborepo workspace and a Fastify API. `GET /health`
returns `{"status":"ok"}` as a process liveness check, not database readiness.
CRM features, persistent product tables, authentication and workers are not implemented yet. The web app currently
shows an accessible initial development screen; it has no CRM data or actions.

## Development

Use Node.js **24.21.0 LTS** (`.nvmrc`) and pnpm **11.26.0**.

```bash
pnpm install
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
Browser tests will arrive with interactive CRM flows.

Dependencies are pinned in manifests and the lockfile. Fastify (MIT) supplies HTTP
routing, schemas and Pino logging; the Node HTTP module was considered, but Fastify
is the repository baseline. The web app uses React, React DOM, Vite and its React plugin
(all MIT) for the required SPA build and rendering. Tooling uses MIT licenses except TypeScript (Apache-2.0).
Dependency lifecycle scripts are not approved in this slice.
CI must install with `pnpm install --frozen-lockfile`.

## PostgreSQL foundation

`@maria/database` provides a Drizzle connection and workspace-scoped transactions.
The caller must authorize the workspace before entering a transaction. This helper
sets transaction-local context; PostgreSQL RLS policies remain the isolation boundary.
The API is not connected to the database yet, and `/health` remains a liveness check.

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
Runtime roles must be non-superusers without `BYPASSRLS` or ownership of protected tables.

The integration suite starts its own disposable database, separate from this local
volume. A synthetic RLS table proves cross-workspace isolation and transaction cleanup;
it is not a product schema or migration. Product schemas, reviewed migrations, runtime
role provisioning and pgvector are deferred until their first consuming feature.
Drizzle ORM (Apache-2.0), node-postgres (MIT), and Testcontainers (MIT, test-only) use
the established stack; an in-memory substitute cannot verify PostgreSQL RLS behavior.
New dependencies are pinned and installed without approving lifecycle scripts.

## Docker

Build and run the API from the repository root:

```bash
docker build -f docker/api.Dockerfile -t maria-api:local .
docker run --rm --read-only --cap-drop ALL --security-opt no-new-privileges \
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
audit, Docker build, and an HTTP smoke test of the non-root, read-only container.
CodeQL analyzes JavaScript/TypeScript separately. Actions are pinned to commit SHAs;
Dependabot checks npm, Docker and Actions updates weekly.

GitHub workflows take effect after these files are pushed. Repository administrators
still need to require `CI / verify` and `CodeQL / analyze` in branch protection and
enable secret scanning/push protection. GHCR publication and staging/production
deployment are not configured yet; production must promote the tested image digest.

Next Phase 0 slices: PostgreSQL foundations and web CRM flows, followed by deployment wiring.
Tenant-owned endpoints require authentication, RLS and cross-tenant tests before exposure.

## Start here

1. [`AGENTS.md`](AGENTS.md) — essential engineering and security contract.
2. [`ARCHITECTURE.md`](ARCHITECTURE.md) — product boundaries and target repository topology.
3. [`HANDOFF.md`](HANDOFF.md) — latest development checkpoint; verify it against Git and PR status.

## License

Licensed under the [GNU Affero General Public License v3.0](LICENSE).
