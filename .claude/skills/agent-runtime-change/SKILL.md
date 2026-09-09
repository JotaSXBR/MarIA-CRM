---
description: Change durable AgentRun orchestration, tools, effects, provider integration or human takeover behavior without weakening MarIA runtime invariants.
---

# Agent runtime change

1. Read `docs/engineering/AI-RUNTIME.md`, `DATABASE-TENANCY.md`, `EVALS.md`.
2. Identify the durable state transition before writing provider code.
3. Keep provider SDK/AI SDK types behind `@maria/ai-gateway`.
4. Never persist hidden chain-of-thought.
5. For every write/external effect define deterministic idempotency/effect semantics.
6. Tool authorization is PolicyEngine code, not prompt text.
7. Validate tool args/output with contracts and bound size/timeout.
8. Check crash/retry behavior at each network boundary.
9. Preserve epoch CAS immediately before outbound AI commit.
10. Add tests for retry/idempotency/stale takeover and security failure modes.
11. If agent behavior changed, update/add a critical behavioral eval when appropriate.
