# ARCHITECTURE.md — MarIA CRM

> System architecture source of truth. Baseline: 2026-09-09.

## Product boundary

MarIA CRM is a multi-tenant CRM + omnichannel messaging platform in which AI agents and human
operators act on the same durable domain state. It is not a thin UI over another CRM.

Core product domains:
- identity, organizations, workspaces and memberships;
- contacts, companies, tags and custom attributes;
- pipelines, stages, deals, tasks and notes;
- channels, conversations, messages, attachments and delivery receipts;
- agent definitions/versions, tools, policies, runs, steps, effects and evals;
- knowledge sources/chunks and memory facts.

## Architectural style

Use a modular monolith in a TypeScript monorepo first. Separate deployable processes exist for
runtime characteristics, not because each package is a microservice.

```text
maria-crm/
├── AGENTS.md
├── ARCHITECTURE.md
├── apps/
│   ├── api/              # Fastify REST, webhooks, SSE, auth boundary
│   ├── worker/           # durable outbox/jobs/AgentRun execution
│   └── web/              # React + Vite SPA
├── packages/
│   ├── auth/             # AuthPort + WorkOS adapter; local identity mapping
│   ├── contracts/        # Zod/JSON Schema/OpenAPI/event contracts
│   ├── database/         # Drizzle schema, SQL migrations, RLS, scoped transactions
│   ├── domain/           # pure domain types/policies/state machines
│   ├── ai-gateway/       # provider-neutral LLM port; AI SDK 7/OpenAI adapter
│   ├── agent-runtime/    # durable orchestration, tool dispatch, effect ledger
│   ├── messaging/        # provider-normalized messaging contracts
│   ├── channel-waha/     # WAHA adapter
│   ├── channel-meta/     # Meta WhatsApp Cloud API adapter
│   ├── mcp-server/       # Control Plane MCP 2026-07-28 server
│   ├── storage/          # S3-compatible object storage port/adapters
│   ├── evals/            # behavioral eval fixtures/runners
│   └── telemetry/        # logging, usage, later OpenTelemetry
├── docs/
│   ├── engineering/
│   ├── exec-plans/
│   ├── product-specs/
│   ├── design-docs/
│   └── generated/
├── docker/
└── .github/
```

## Dependency direction

Allowed direction:

```text
apps/* ───────┐
adapters/*    ├──> application/runtime packages ──> domain + contracts
database -----┘

domain -> contracts/types that are infrastructure-free only
```

Rules:
- `@maria/domain` imports no Fastify, Drizzle, AI SDK, WorkOS, WAHA or Meta SDK.
- provider SDK types never leak into domain entities or persisted domain contracts.
- API handlers are adapters; they do not contain business policy.
- database rows are mapped to domain/application structures; UI never imports DB schema.
- cross-package dependency cycles fail CI.

## Control Plane

Owns authoring:
- `AgentDraft`;
- immutable `AgentVersion`;
- prompts/instructions;
- tool definitions + permissions;
- knowledge configuration;
- behavioral eval datasets;
- rehearsal/dry-run;
- publish/deploy of an agent version.

MCP is an administrative interface into this plane, not a shortcut around policy. Published
versions include hashes of prompt, tool schemas/policies and relevant configuration.

## Execution Plane

Owns customer runtime:
1. receive normalized event;
2. persist message + transactional outbox event;
3. worker claims durable work;
4. create/resume `AgentRun`;
5. load immutable `AgentVersion`;
6. build authorized context;
7. call provider through `@maria/ai-gateway`;
8. validate tool request;
9. enforce policy + effect receipt;
10. execute tool;
11. checkpoint;
12. validate conversation epoch;
13. persist outbound message + outbox;
14. provider adapter dispatches it.

AI SDK is an interoperability/provider layer. Its `WorkflowAgent` does **not** become the system of
record for MarIA's durable runtime unless a future ADR deliberately replaces the DB-backed engine.

## Transaction boundary

Any command that changes domain state and schedules follow-up work commits both in one PostgreSQL
transaction:
- business row changes;
- audit/effect state when applicable;
- outbox event.

External network calls occur outside the DB transaction. Their intent/result is represented by
durable outbox/effect state.

## Media

Metadata belongs in PostgreSQL; binary media belongs behind `StoragePort` in S3-compatible object
storage. Never store large WhatsApp media blobs directly in business tables.

## Scalability path

Initial target: one VPS, <= roughly 100 workspaces / tens of thousands of messages per day.

Scale by evidence:
1. increase worker concurrency with PostgreSQL leases;
2. separate DB/WAHA/media from app VPS;
3. add read/cache infrastructure only when measured;
4. add Redis only for a proven ephemeral workload;
5. evaluate Temporal when operational complexity/throughput makes the custom durable engine costly;
6. split services only when deployment/ownership/scaling boundaries justify it.
