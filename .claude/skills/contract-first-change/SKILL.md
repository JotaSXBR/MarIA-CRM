---
description: Implement a MarIA CRM feature contract-first across domain, database, API/worker and UI. Use for normal cross-layer feature work.
---

# Contract-first change

1. Read `AGENTS.md`, `ARCHITECTURE.md`, and the engineering doc for the subsystem.
2. Inspect existing contracts and tests before creating names/shapes.
3. State the observable outcome and non-goals.
4. Define/adjust Zod contracts and domain behavior first.
5. If persistence changes, use the `db-rls-migration` procedure.
6. Implement application/API/worker adapters after contracts.
7. Implement UI last against stable contracts.
8. Add focused unit + integration tests; E2E for critical user flow.
9. Run the smallest relevant gates, then `pnpm verify` before PR when feasible.
10. Review the diff for accidental scope, generated noise, secrets and architecture leakage.
11. Report evidence and assumptions. Never claim completion if required gates did not run.
