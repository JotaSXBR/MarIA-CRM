# Stack Baseline — 2026-09-09

This document records the **production baseline**, not a mandate to chase every new release.

## Version policy

Use:
- current LTS runtime rather than Current;
- current stable library majors after a reasonable adoption window;
- no RC/beta in the production baseline unless an ADR proves the need;
- exact pins for toolchain/formatter and container image digests;
- lockfile for all JS dependencies.

New releases are evaluated by Renovate PRs and CI, not adopted directly from `latest`.

## Selected stack

| Layer | Decision | Policy |
|---|---|---|
| Runtime | Node.js 24 LTS (`24.21.x`) | Do not base production on Node 26 Current |
| Language | TypeScript 7.0.x | strict; ESM |
| Packages | pnpm 11.26.0 | intentionally hold pnpm 12 until adoption window closes |
| Monorepo | Turborepo 2.10.x | remote cache optional |
| DB | PostgreSQL 18.6 | current supported minor; upgrade minors promptly |
| Vector | pgvector 0.8.6 | same Postgres, tenant RLS applies |
| ORM | Drizzle ORM 0.45.2 stable | do not adopt Drizzle 1.0 RC in baseline |
| Validation | Zod 4.5.x | canonical runtime schemas |
| API | Fastify 5.x | REST/OpenAPI, webhooks, SSE |
| AI | AI SDK 7 | adapter/provider layer, not durable state owner |
| UI | React 19.2.x | SPA |
| Build | Vite 8.2.x | current supported Vite 8 line |
| CSS | Tailwind 4.3.x | |
| Components | shadcn/ui + Base UI | Base UI is shadcn default for new projects |
| Data fetch/cache | TanStack Query v5 | server state |
| Auth MVP | WorkOS AuthKit | through AuthPort; local DB owns tenancy |
| MCP | spec 2026-07-28 + TypeScript SDK v2 | remote HTTP; stdio only trusted local dev |
| Unit tests | Vitest 5 | |
| Integration | Testcontainers | real PostgreSQL |
| E2E | Playwright | critical browser flows |
| Lint | Oxlint type-aware | TS7-aligned |
| Format | Prettier 3.9.0 | exact pin |
| Deploy | OCI/Docker + GHCR + Coolify | immutable tags/digests |

## Decisions not to take yet

### Node 26
Current, not the recommended LTS baseline on 2026-09-09. Revisit when it reaches LTS and ecosystem
support is established.

### pnpm 12
pnpm 12.0.0 shipped 2026-08-26 and 12.4.0 shipped 2026-09-08. The project deliberately starts on
11.26.0 to avoid putting the package manager's two-week-old major on the critical path. Revisit
after 30–60 days of ecosystem stabilization.

### Drizzle 1.0 RC
`v1.0.0-rc.*` is pre-release. Use 0.45.2 stable, which includes the relevant SQL identifier escaping
security fix. Upgrade after 1.0 stable + migration rehearsal.

### Oxfmt
Oxfmt is fast and highly Prettier-compatible, but its own roadmap still labels it beta. Use
Prettier 3.9.0; migration can be reconsidered once Oxfmt is stable.

### Next.js
The CRM is an authenticated, highly interactive app with a deliberately separate Fastify backend
and no material SEO/SSR requirement. React + Vite keeps runtime/deployment boundaries simpler.

### Temporal
The MVP already has PostgreSQL durable state, outbox and effect ledger semantics. Temporal adds
operational infrastructure before the expected scale needs it. Preserve migration-friendly
activity/state boundaries and revisit from evidence.

### Redis
Do not carry Redis as decorative infrastructure. PostgreSQL is enough for durable outbox/jobs and
the initial scale. Add Redis when a measured cache, ephemeral pub/sub or rate-limit workload earns it.

## Package-boundary decisions

### `@maria/ai-gateway`
Wrap AI SDK/provider SDKs. Domain code calls MarIA-owned interfaces. Model IDs and provider-specific
options are configuration, never domain constants.

### `@maria/auth`
Wrap WorkOS. Persist local identities/memberships and map external subjects to local users. A future
self-hosted auth implementation replaces the adapter, not the domain.

### Messaging adapters
`@maria/messaging` defines the normalized contracts. `channel-waha` and `channel-meta` implement
them. Neither provider payload becomes the internal message schema.

### Storage
S3-compatible port for attachments. Local development can use MinIO; production can use a
self-hosted or external S3-compatible service without changing domain code.
