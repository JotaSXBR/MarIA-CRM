# MarIA CRM

MarIA CRM is an independent, multi-tenant, agent-native CRM where AI agents and human operators
share the same workspace, inbox, contacts, companies, pipelines, tasks and knowledge.

## Status

Phase 0 has started with a pnpm/Turborepo workspace and a Fastify API. `GET /health`
returns `{"status":"ok"}` as a process liveness check, not database readiness.
CRM features, persistence, authentication, web UI and workers are not implemented yet.

## Development

Use Node.js **24.21.0 LTS** (`.nvmrc`) and pnpm **11.26.0**.

```bash
pnpm install
pnpm dev
```

The API listens on `http://127.0.0.1:3000`. Set `HOST` and `PORT` to override;
`PORT=0` selects an available port. SIGINT and SIGTERM close the server gracefully.

```bash
pnpm verify
```

This checks formatting, type-aware lint, strict TypeScript, unit tests, Fastify
integration tests, the built server over HTTP (including shutdown), and compilation.
Each gate is also available separately: `fmt:check`, `lint`, `typecheck`, `test`,
`test:integration`, `test:e2e`, and `build`. `pnpm fmt` applies formatting.
The initial end-to-end test covers the API process; browser and database suites
will arrive with the web and persistence slices.

Dependencies are pinned in manifests and the lockfile. Fastify (MIT) supplies HTTP
routing, schemas and Pino logging; the Node HTTP module was considered, but Fastify
is the repository baseline. Tooling uses MIT licenses except TypeScript (Apache-2.0).
Dependency lifecycle scripts are not approved in this slice.
CI must install with `pnpm install --frozen-lockfile`.

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

The official Node 24.21.0 Docker tags were not available during implementation.
The Dockerfile temporarily upgrades a digest-pinned 24.20.0 base using the official
24.21.0 archive and pinned SHA-256 checksums. Both build and runtime use 24.21.0;
the upgrade supports amd64 and arm64, with local verification on amd64.
Replace this bootstrap when the official 24.21.0 image is published.

## Continuous integration

Pull requests and pushes to `main` run the verification gates, production dependency
audit, Docker build, and an HTTP smoke test of the non-root, read-only container.
CodeQL analyzes JavaScript/TypeScript separately. Actions are pinned to commit SHAs;
Dependabot checks npm, Docker and Actions updates weekly.

GitHub workflows take effect after these files are pushed. Repository administrators
still need to require `CI / verify` and `CodeQL / analyze` in branch protection and
enable secret scanning/push protection. GHCR publication and staging/production
deployment are not configured yet; production must promote the tested image digest.

Next Phase 0 slices: web and PostgreSQL foundations, followed by deployment wiring.
Tenant-owned endpoints require authentication, RLS and cross-tenant tests before exposure.

## Start here

1. [`AGENTS.md`](AGENTS.md) — essential engineering and security contract.
2. [`ARCHITECTURE.md`](ARCHITECTURE.md) — product boundaries and target repository topology.

## License

Licensed under the [GNU Affero General Public License v3.0](LICENSE).
