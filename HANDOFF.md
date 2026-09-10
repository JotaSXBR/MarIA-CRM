# MarIA CRM handoff

Updated: 2026-09-10

## Verify first

```bash
rtk git status --short --branch
rtk git branch --show-current
rtk gh pr status
```

The base web PR (#9) is merged and the user approved the visual result. Its prior
`pnpm verify` (10 tests) plus CI/CodeQL evidence applies to the web slice only.

## Current work

PR [#10](https://github.com/JotaSXBR/MarIA-CRM/pull/10) was approved by the user and
squash-merged into `main` as `6af5f93`. The PostgreSQL foundation is complete.

The database slice has Drizzle 0.45.2, a transaction-local workspace helper that rejects
superuser/BYPASSRLS roles, and synthetic real-Postgres RLS tests with a shared one-connection
pool. No product schema, API integration, auth, or migration is introduced.
Local formatting, lint, typecheck, nine unit tests, API integration/E2E and all builds passed;
production dependency audit found no known vulnerabilities. CI and CodeQL passed for
implementation commit `4ae275c`, including real PostgreSQL RLS tests, all 12 tests,
Docker build and container smoke. Confirm the latest PR head checks before merge.

The current slice adds `packages/database/src/schema.ts` and
`packages/database/drizzle/0000_product_foundation.sql` for organizations, workspaces, contacts
and companies. Contacts and companies use forced RLS keyed by `app.workspace_id`. Direct
TypeScript checking passed; the full local gates are blocked by the WSL `rtk` socket failure and
pnpm's unavailable store. The changes are published in PR [#12](https://github.com/JotaSXBR/MarIA-CRM/pull/12);
the PR is open and no checks have started yet.

Repository Codex routing is versioned in `.codex/` and documented in `AGENTS.md`.

## Environment

WSL Docker integration is unavailable locally; CI is the real Testcontainers gate, with
no tests skipped. Chromium automated browser runs lack `libnspr4`; the web result was
manually approved by the user.

Use `nvm use` to select Node 24.21.0 and Corepack for pnpm 11.26.0. In WSL, confirm
`node` and `pnpm` resolve to Linux binaries rather than Windows shims before running gates.

## Next actions

Choose the next small consuming slice. Runtime roles, auth, API integration and remaining product
domains remain pending; preserve RLS and transaction cleanup.

Update this file in place as status changes. Replace stale facts; do not add transcript,
secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
