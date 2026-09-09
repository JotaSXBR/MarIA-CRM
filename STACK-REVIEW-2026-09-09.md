# MarIA CRM — Stack & Agent-Assisted Engineering Review

**Research date:** 2026-09-09  
**Scope:** update the original `AGENTS.md` stack and engineering contract for a public GitHub,
Coolify/VPS, PostgreSQL-first, Dev Senior + autonomous coding-agent workflow.

## Executive summary

The original architecture is unusually strong in the areas that matter for an agent-native CRM:
RLS, immutable agent versions, durable DB-backed runs, transactional outbox/effect receipts and
conversation `epoch` are worth preserving.

The biggest changes are:

1. **Turn `AGENTS.md` into a map, not a manual.** Detailed engineering knowledge moves to
   `docs/engineering/`, with execution plans under `docs/exec-plans/`. This follows the current
   agent-first repository pattern documented by OpenAI and keeps Claude's startup context concise.
2. **Update runtime/toolchain:** Node 24 LTS, TypeScript 7, PostgreSQL 18.6, pgvector 0.8.6,
   React 19.2, Vite 8.2, Tailwind 4.3, Zod 4.5, AI SDK 7, MCP 2026-07-28 / TS SDK v2.
3. **Do not chase very fresh majors:** pnpm remains 11.26.0 initially because pnpm 12 is only two
   weeks old; Drizzle stays 0.45.2 because 1.0 is RC; Prettier remains because Oxfmt is beta.
4. **Replace ESLint with Oxlint type-aware**, while keeping a separate TypeScript gate initially.
5. **Keep Fastify and React+Vite.** There is no architectural reason to adopt Next.js for an
   authenticated SPA with a separate API.
6. **AI SDK 7 stays, but only behind an AI gateway.** MarIA's PostgreSQL state machine remains the
   source of truth; do not hand durability to a framework-owned `WorkflowAgent`.
7. **MVP auth: WorkOS AuthKit**, because its current pricing includes the first 1M active users and
   its organization model fits B2B. Keep local user/org/workspace/membership records canonical so
   a future self-hosted auth adapter is feasible.
8. **WhatsApp becomes provider-port based:** WAHA first, official Meta Cloud API supported from day
   one through a second adapter.
9. **Realtime defaults to HTTP + SSE**, reserving WebSocket for actual full-duplex needs.
10. **Remove Redis from MVP infrastructure.** PostgreSQL handles durable queue/outbox; add Redis only
    when a measured workload requires it.
11. **Harden public agent-assisted development:** CodeQL, dependency/security automation, build-script
    restrictions, prompt-injection boundaries, MCP/tool poisoning defenses and protected deployment.
12. **Add minimal behavioral evals:** only critical behavior/regressions block AgentVersion publish.

---

## Original document: what was preserved

Preserved as first-class invariants:
- Control Plane vs Execution Plane.
- PostgreSQL RLS as the real tenant boundary.
- transactional outbox and durable DB-backed execution.
- `effect_receipts` / deterministic idempotency.
- conversation `epoch` + CAS for human takeover.
- host execution forbidden for customer runtime tools.
- contract-first development.
- PostgreSQL-first and Temporal only when justified by scale.

## Original document: conceptual corrections

### 1. `workspace_id + org_id` on every business row
The original required both columns on every business table. The revised contract uses ownership
semantics: workspace-owned rows carry `workspace_id`; org-owned rows carry `org_id`; rows that carry
both need an invariant preventing mismatches. This avoids duplicated tenant identity becoming a
data-integrity risk.

### 2. Tenant context on pooled connections
A generic "set session variable when opening the session" is risky with connection pools. The
revised rule requires a transaction-local setting (`set_config(..., true)` / `SET LOCAL`) inside a
scoped transaction and hardens DB roles/`FORCE ROW LEVEL SECURITY`.

### 3. Persisting `AgentStep (Thinking)`
A runtime should not persist hidden model chain-of-thought. Persist state transitions, tool
calls/results, usage, safe summaries and errors—never private reasoning.

### 4. WebSocket as default
Most dashboard traffic is server→browser updates. HTTP mutations + SSE reduce moving parts, while
durable cursors handle reconnect. WebSocket remains available for true full-duplex features.

### 5. Redis by default
At the stated initial scale it adds a failure/ops surface without owning any irreplaceable state.
PostgreSQL outbox + row leases are sufficient initially.

---

## Stack decision table

| Original | 2026-09-09 decision | Why |
|---|---|---|
| Node 22 LTS | **Node 24 LTS 24.21.x** | Recommended LTS; Node 26 is Current |
| TypeScript 5.6+ | **TypeScript 7.0.x** | Native Go compiler, production-ready, ~order-of-magnitude faster checks |
| pnpm 9+ | **pnpm 11.26.0** | secure modern baseline; pnpm 12 major is only ~2 weeks old |
| Turborepo | **2.10.x** | keep; fits monorepo/agent workflows |
| PostgreSQL 16/17 | **18.6** | current supported major/minor |
| pgvector unspecified | **0.8.6** | current released stable line in research |
| Drizzle | **0.45.2 stable** | 1.0 remains RC |
| Fastify v5 | **Fastify 5.x** | keep; no objective replacement benefit |
| Vercel AI SDK | **AI SDK 7 behind ai-gateway** | provider breadth + modern tools; runtime state remains MarIA-owned |
| React 19 + Vite | **React 19.2 + Vite 8.2** | keep SPA; Vite 8 uses Rolldown |
| Tailwind v4 | **Tailwind 4.3** | current line |
| Radix/shadcn | **shadcn + Base UI** | Base UI became shadcn default for new projects July 2026 |
| TanStack Query v5 | **keep v5** | current latest major |
| WAHA only | **WAHA + Meta adapter** | preserves current stability and official migration/onboarding path |
| MCP generic | **spec 2026-07-28 + TS SDK v2** | major protocol changes in 2026 |
| Vitest | **Vitest 5** | stable major released Sep 3; greenfield project |
| Testcontainers | **keep** | real DB integration remains correct |
| ESLint + Prettier | **Oxlint type-aware + Prettier 3.9.0** | faster TS7-aware lint; formatter remains mature |
| no browser E2E | **Playwright** | critical CRM flows need real browser regression coverage |
| auth unspecified | **WorkOS AuthKit MVP** | free first 1M active users, B2B org model |
| Redis in Compose | **omit from MVP** | add only on measured need |

---

## Why WorkOS AuthKit for MVP

WorkOS currently advertises:
- first **1 million active users free**;
- AuthKit at $0 for that tier;
- users + organizations/memberships;
- RBAC/permissions and organization-scoped capabilities.

Clerk is also good, but its current free B2B organization allowance is more constraining for this
use case (notably member limits in the included B2B tier). For an early B2B CRM, WorkOS provides
more headroom.

Important architecture choice: MarIA does **not** make WorkOS objects the canonical domain model.
`@maria/auth` maps external subjects to local users, and PostgreSQL owns org/workspace/membership
authorization. That gives a future self-hosted auth phase a clean seam.

For the free MVP baseline, use hosted AuthKit with password/social login and MFA as needed. WorkOS
supports WebAuthn/passkeys, but its docs recommend configuring a custom auth domain before enabling
production passkeys; custom domains are currently a paid add-on. Therefore passkeys are deliberately
a later enhancement rather than a hidden MVP cost. WorkOS also requires billing information to unlock
the production environment even when AuthKit usage itself remains inside the free allowance.

---

## AI SDK 7 decision

AI SDK 7 now includes provider-neutral agent/tool features, approvals, telemetry, durability helpers
and harness integrations. Those features are useful, but the MarIA architecture already needs a
domain-specific durable engine with:
- `AgentRun`/`AgentStep`;
- effect receipts;
- conversation epoch;
- CRM transaction boundaries;
- tenant RLS.

Therefore:
- use AI SDK for provider calls, streaming, structured outputs and provider-native options;
- keep provider types inside `@maria/ai-gateway`;
- do not make `WorkflowAgent` the authoritative persistence/state machine;
- permit OpenAI-specific capabilities through the OpenAI adapter when materially better.

---

## MCP 2026 impact

The 2026-07-28 MCP spec moved to a stateless core and added/changed important semantics around:
- self-describing/routable requests;
- headers for method/name routing;
- cacheable list results;
- multi-round-trip interaction;
- formal extension framework;
- authorization hardening.

The revised MCP document therefore:
- targets TypeScript SDK v2;
- prefers remote HTTP-native/stateless behavior;
- uses stdio only for trusted local authoring;
- distinguishes tools/resources/prompts;
- requires OAuth-style authorization for remote access;
- adds tool-definition hashing and re-approval to resist MCP/tool poisoning.

---

## Agent-assisted repository design

OpenAI's published harness-engineering guidance says a giant `AGENTS.md` becomes stale, consumes
context and is difficult to verify; their pattern is a short `AGENTS.md` plus structured `docs/` as
the system of record.

Claude Code documentation independently recommends a concise `CLAUDE.md` (target under 200 lines),
supports importing `@AGENTS.md`, and recommends moving multi-step procedures into Skills.

The delivered structure follows both:
- `AGENTS.md`: invariant/map;
- `ARCHITECTURE.md`: system shape;
- `docs/engineering/*`: source of truth by subsystem;
- `docs/exec-plans/*`: living plans for large work;
- `CLAUDE.md`: imports `AGENTS.md`;
- `.claude/skills/*`: reusable procedures loaded on demand.

This is more robust than duplicating 300+ lines into every coding-agent instruction file.

---

## CI/CD and Coolify

Recommended path:
- PR → GitHub Actions quality/security gates;
- merge `main` → build once, push immutable image to GHCR;
- deploy that digest to staging through Coolify;
- run staging smoke/critical E2E;
- production workflow uses protected GitHub environment/human approval;
- promote the **same digest**, not a rebuild.

Coolify's own docs support Git-based Compose/application deployment and advise versioned
image/digest use rather than mutable `latest` in production.

The initial deployment can remain on one VPS, but DB, WAHA, app processes and storage use separate
containers/resources and private networking so they can be moved later without changing domain code.

---

## Security additions for a public GitHub + coding-agent project

Mandatory baseline:
- CodeQL for JS/TS and workflows;
- secret protection/scanning where available for the public repo;
- Dependabot security alerts/updates;
- Renovate for controlled routine updates;
- dependency review;
- frozen lockfile;
- pnpm dependency build-script restrictions;
- release-age delay for routine updates;
- protected production environment;
- no direct agent push to `main`;
- content from issues/web/KB/MCP treated as untrusted data;
- no execution of instructions embedded in untrusted content;
- no arbitrary external MCP catalog at runtime;
- privileged paths require human review.

---

## Minimal eval strategy

Do not build an eval platform before the CRM.

Implement a repository-based `packages/evals`:
- versioned synthetic/curated fixtures;
- deterministic checks first;
- LLM judges only where semantics require them;
- critical suite referenced by `AgentVersion`;
- online critical evals run on rehearsal/publish, not every normal PR;
- critical failure blocks publication.

Real production cases enter a public repo only after PII removal or synthetic reconstruction.

---

## Sources consulted (primary/official preferred)

### Runtime / toolchain
- Node.js download/LTS: https://nodejs.org/en/download
- TypeScript 7.0 announcement: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
- pnpm releases: https://github.com/pnpm/pnpm/releases
- pnpm security/build-script model: https://pnpm.io/
- Turborepo releases: https://github.com/vercel/turborepo/releases
- Oxlint type-aware stable: https://oxc.rs/blog/2026-07-22-type-aware-linting-stable.html
- Oxfmt beta: https://oxc.rs/blog/2026-02-24-oxfmt-beta
- Prettier 3.9: https://prettier.io/blog/

### Database / backend
- PostgreSQL releases: https://www.postgresql.org/support/versioning/
- pgvector changelog: https://github.com/pgvector/pgvector/blob/master/CHANGELOG.md
- Drizzle releases: https://github.com/drizzle-team/drizzle-orm/releases
- Drizzle RLS docs: https://orm.drizzle.team/docs/rls
- Fastify LTS/docs: https://fastify.dev/docs/latest/Reference/LTS/
- Zod: https://zod.dev/

### Frontend
- React versions: https://react.dev/versions
- Vite releases: https://vite.dev/releases
- Vite 8: https://vite.dev/blog/announcing-vite8
- Tailwind 4.3: https://tailwindcss.com/blog/tailwindcss-v4-3
- shadcn Base UI default: https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
- TanStack Query: https://tanstack.com/query/latest/docs/framework/react

### AI / MCP
- AI SDK 7: https://vercel.com/blog/ai-sdk-7
- MCP 2026-07-28 spec release: https://blog.modelcontextprotocol.io/posts/2026-07-28/
- MCP TypeScript SDK v2: https://ts.sdk.modelcontextprotocol.io/v2/
- MCP authorization extension/docs: https://apps.extensions.modelcontextprotocol.io/api/documents/authorization.html

### Auth / messaging / deploy
- WorkOS pricing: https://workos.com/pricing
- WorkOS users/organizations: https://workos.com/docs/authkit/users-organizations
- WorkOS AuthKit environments: https://workos.com/docs/authkit/environments
- WorkOS passkeys: https://workos.com/docs/authkit/passkeys/passkey-configuration/multi-factor-auth
- Clerk pricing comparison: https://clerk.com/pricing
- WAHA API 2026.8.1: https://waha.devlike.pro/swagger/
- WAHA events/webhook docs: https://github.com/devlikeapro/waha-docs/blob/main/content/docs/how-to/events/index.md
- Meta WhatsApp Cloud API (official Postman workspace): https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api
- Meta Embedded Signup: https://www.postman.com/meta/whatsapp-business-platform/documentation/du6gzjv/embedded-signup
- Coolify Docker Compose: https://next.coolify.io/docs/applications/builds/docker-compose
- Coolify deploy overview: https://next.coolify.io/docs/applications/deployments/overview
- Coolify Docker image: https://next.coolify.io/docs/applications/deployments/docker-image

### Agent-assisted engineering / GitHub
- OpenAI Harness Engineering: https://openai.com/index/harness-engineering/
- Claude Code project memory/CLAUDE.md: https://code.claude.com/docs/en/memory
- Claude Code Skills: https://code.claude.com/docs/en/slash-commands
- GitHub repository security quickstart: https://docs.github.com/en/code-security/getting-started/quickstart-for-securing-your-repository
- GitHub environments: https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments
- GitHub CodeQL: https://docs.github.com/en/code-security/concepts/code-scanning/codeql/codeql-cli
- Vitest 5: https://vitest.dev/blog/vitest-5

---

## Revisit dates

These are intentional review triggers, not automatic upgrades:
- **pnpm 12:** reassess after 2026-10-15 or when repository evidence shows it is low-risk.
- **Drizzle 1.0:** reassess when stable 1.0 exists and migration rehearsal passes.
- **Oxfmt:** reassess when the project declares stable/GA.
- **Node 26:** reassess when it becomes LTS and key dependencies officially support it.
- **Redis/Temporal:** reassess from measured operational need, not calendar date.
