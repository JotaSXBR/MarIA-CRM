# Quality Gates & Definition of Done

## Root gate contract

Phase 0 creates stable scripts:

```bash
pnpm fmt:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
pnpm verify
```

`verify` should run all cheap/required local gates and fail fast with useful diagnostics. CI can
parallelize tasks through Turborepo.

## Test matrix

### Domain/unit — Vitest
Required for:
- pure policies/state machines;
- validation edge cases;
- permission/effect-key functions;
- message status transitions;
- epoch semantics.

### Integration — Vitest + Testcontainers
Use real PostgreSQL for:
- RLS;
- migrations;
- transactional outbox;
- `SKIP LOCKED` claims;
- idempotency/effect receipts;
- webhook dedup;
- DB constraints.

Never mock away the database behavior whose correctness is the test.

### Contract tests
Fixtures per adapter:
- WAHA inbound/status;
- Meta inbound/status/template;
- AI provider normalized response/tool call;
- MCP schemas.

Fixtures must be synthetic or sanitized.

### E2E — Playwright
Critical flows:
- login/workspace selection;
- create/find contact;
- deal movement;
- inbox receive/reply;
- human takeover blocks stale AI reply;
- agent draft → rehearsal → publish where UI exists.

Do not require every visual tweak to run the full E2E matrix locally; CI scopes intelligently.

## RLS mandatory negative cases

For each tenant resource, prove:
- workspace A can access its row;
- workspace B cannot read it;
- B cannot update/delete it;
- insert with another tenant scope fails;
- missing tenant context does not expose data.

## Migration gate

- migrate empty DB to head;
- verify schema/policies;
- where supported, upgrade from previous released schema;
- destructive SQL detector flags operations for human approval.

## PR evidence

Every PR description includes:
- intent;
- files/subsystems touched;
- tests/gates run and result;
- migration impact;
- security/tenancy impact;
- dependency changes;
- manual checks;
- known follow-up.

An agent may not report "done" when required gates were skipped. It must state what could not run
and why.

## Performance

Do not micro-optimize by instinct. Add a budget/test when a hot path matters:
- inbox event latency;
- webhook acknowledgment time;
- DB query/index behavior;
- agent run step latency/cost;
- frontend interaction regressions.

Measure before introducing cache/Redis or service splitting.
