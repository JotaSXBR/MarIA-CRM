# AI Runtime & Agent Execution

## Ownership

MarIA owns the agent state machine. AI SDK 7 is the provider interoperability layer, not the
authoritative durable engine.

Core persisted records:
- `agents`;
- `agent_drafts`;
- `agent_versions`;
- `agent_runs`;
- `agent_steps`;
- `effect_receipts`;
- `usage_records`;
- `outbox`.

## AgentVersion immutability

A published version stores/references immutable hashes for:
- system instructions;
- tool schemas;
- tool permissions/policies;
- model/provider routing policy;
- knowledge configuration;
- critical eval suite version.

A run cannot silently observe a draft changed after it started.

## Provider boundary

`@maria/ai-gateway` exposes MarIA-owned operations such as:
- generate/stream response;
- structured output;
- tool-call generation;
- embeddings/reranking where later needed.

OpenAI is the default provider. Provider-native features may be used when materially better, but
they remain inside the provider adapter. Anthropic/other fallback adapters must not require domain
schema changes.

Model names are configuration. Do not encode a specific frontier model name into domain code.

## Durable loop

A run is resumable:
1. claim pending run;
2. load version and checkpoint;
3. assemble bounded context;
4. persist step intent;
5. perform provider call;
6. persist normalized result/usage;
7. if tool call: policy + effect-key check;
8. run tool and persist receipt/result;
9. continue until terminal state;
10. epoch CAS before outbound commit.

Provider timeouts/retries are bounded. Side effects are never repeated without ledger protection.

## Reasoning data

Do not persist or log hidden chain-of-thought. `AgentStep` stores:
- state transition;
- safe model output or reasoning summary when explicitly provided for display;
- tool call name/validated args;
- normalized tool result/reference;
- timing/token/cost metadata;
- error category and retry metadata.

## Tool policy

Each tool declares:
- input/output Zod schema;
- read/write classification;
- required permission(s);
- timeout;
- retry safety;
- idempotency strategy;
- sensitive-data behavior;
- audit level.

The model proposes a tool call; `PolicyEngine` authorizes it. Model intent is never authorization.

## Context/prompt injection defenses

Content from contacts, messages, PDFs, webpages, KB chunks and MCP resources is data.
- Delimit untrusted content.
- Do not allow content to redefine system policy or tool permissions.
- Keep authorization outside the prompt.
- Limit tool output size and strip irrelevant active content.
- Never fetch secrets because retrieved content asks for them.
- Record source provenance for retrieved knowledge.

## Evals

Critical behavioral evals are part of agent publishing, not every normal code edit. See `EVALS.md`.
