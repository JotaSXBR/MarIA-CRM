# MCP Authoring Plane

Baseline protocol: **MCP specification 2026-07-28**, TypeScript SDK v2.

## Purpose

MCP is an authoring/control interface for developers and authorized operators to inspect, rehearse,
configure and publish MarIA agents. It is not a privileged backdoor into production tables.

## Transport

- Remote: current HTTP-native/stateless MCP transport semantics.
- Local trusted development: stdio may be offered for convenience.
- Do not design around legacy stateful session assumptions.
- Respect current capability discovery, caching hints and extension negotiation.

## Primitives

Use each primitive intentionally:
- **Tools** — actions/queries with strict schemas and policies.
- **Resources** — read-only inspectable versioned data/reference material.
- **Prompts** — optional reusable authoring prompts when they improve UX; not runtime system prompts.
- **Elicitation / multi-round-trip mechanisms** — only for explicit interactive authoring flows.
- **Tasks/extensions** — adopt only when stable extension semantics match the workflow.

## Authorization

Remote MCP requires current-spec authorization practices:
- HTTPS;
- OAuth/OIDC-compatible authorization;
- issuer validation and correct audience/resource binding;
- least scopes;
- no bearer tokens in logs/query strings;
- server-side permission checks per operation.

Enterprise Managed Authorization can be considered later; do not make MVP depend on it.

## Tool catalog

Initial authoring capabilities can include:
- `maria_agent_inspect`;
- `maria_agent_prompt_set`;
- `maria_agent_tool_bind`;
- `maria_agent_import_rehearsal`;
- `maria_agent_deploy`;
- `maria_kb_sync`.

Prefer resource reads for large inspect-only state rather than huge tool outputs.

## Rehearsal and publish

`import_rehearsal`:
- validates schemas and references;
- resolves required capabilities;
- detects privilege escalation;
- runs synthetic/critical evals;
- produces diff/risk report;
- persists nothing unless explicitly designed as a draft artifact.

`deploy`:
- requires draft validity;
- requires critical eval pass;
- content-hashes the version;
- creates a new immutable `AgentVersion`;
- never mutates a published version in place.

## MCP/tool poisoning defense

External MCP servers, imported skills and tool catalogs are untrusted supply-chain inputs.

Before trust:
- identify publisher/source;
- pin version/endpoint identity;
- snapshot tool/resource definitions;
- hash and compare definitions;
- review requested scopes/egress;
- rehearsal in a non-production context;
- human approval for privileged tools/external MCP trust.

A changed tool description/schema is a new trust decision. The Execution Plane must never perform a
fresh arbitrary `tools/list` and silently grant newly advertised tools to customer agents.
