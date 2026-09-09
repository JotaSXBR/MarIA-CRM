# Agent Behavioral Evals

The goal is **small, useful regression protection**, not an eval platform project.

## What is mandatory in MVP

Each published agent can reference a versioned critical eval suite. Critical behaviors include:
- required handoff;
- refusal to use a forbidden tool;
- correct tool selection for high-value flows;
- no cross-tenant data request;
- epoch/takeover behavior at runtime;
- schema-valid structured output;
- known production regression cases.

A failing **critical** eval blocks `AgentVersion` publish.

## Where

`packages/evals` should own:
- synthetic fixtures;
- expected invariants;
- deterministic validators;
- optional LLM judge adapters where rule-based checking is insufficient;
- runner and report schema.

Agent version links to `eval_suite_version`/hash.

## Test types

Prefer deterministic first:
- exact tool name;
- no forbidden tool call;
- required field present;
- output matches schema;
- expected state transition;
- cost/tool-count ceiling.

Use an LLM-as-judge only for genuinely semantic criteria and require:
- fixed rubric;
- bounded output schema;
- repeated/threshold strategy when nondeterminism matters;
- provider/model recorded;
- judge is not the only validator for security authorization.

## CI vs publish

Normal PR CI:
- eval framework unit tests;
- deterministic fixture tests without expensive provider calls.

Agent publish/rehearsal:
- run the agent's critical online eval suite with provider credentials;
- report tokens/cost/latency;
- block publish on critical failure.

## Production-derived regressions

A real conversation becomes an eval only after:
- explicit curation;
- PII/secrets removal or synthetic reconstruction;
- minimal necessary context;
- expected behavior is reviewed.

Do not dump raw production conversations into a public repository.

## Growth path

Only add a dedicated eval service/UI when the number of agents/datasets/runs makes repository-based
fixtures operationally painful.
