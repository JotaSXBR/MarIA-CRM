---
description: Finalize a MarIA CRM change before opening or updating a PR. Use when implementation is believed complete.
---

# Pre-PR gate

1. `git status` — identify every changed/untracked file.
2. Read `git diff` and remove unrelated/generated/debug changes.
3. Confirm docs/contracts/migrations agree.
4. Run relevant focused tests.
5. Run `pnpm fmt:check`.
6. Run `pnpm lint`.
7. Run `pnpm typecheck`.
8. Run `pnpm test`.
9. Run integration/RLS, build and E2E when scope requires them.
10. Check no secret, private fixture, bypass, `latest` production image or destructive SQL slipped in.
11. Summarize:
    - what changed;
    - why;
    - tests/gates with results;
    - migration/security/dependency impact;
    - manual checks;
    - known limitations/follow-up.
12. Do not say "all tests pass" unless they were actually run.
