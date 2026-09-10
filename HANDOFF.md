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

Branch: `feat/phase-0-database`. Implementation is saved; the Terra worker reached its
usage limit and the coordinator completed integration. The security reviewer found no
additional actionable issues. Check the PR for final CI status before continuing.

The database slice has Drizzle 0.45.2, a transaction-local workspace helper that rejects
superuser/BYPASSRLS roles, and synthetic real-Postgres RLS tests with a shared one-connection
pool. No product schema, API integration, auth, or migration is introduced.
Local formatting, lint, typecheck, nine unit tests, API integration/E2E and all builds passed;
production dependency audit found no known vulnerabilities. PostgreSQL integration
still requires CI evidence because this WSL distro has no Docker runtime.

Existing local edits to `.gitignore`, `AGENTS.md` and `.codex/` belong to the user; keep
them and do not include unrelated edits in database work. `AGENTS.md` also contains a
root handoff reference hunk.

## Environment

WSL Docker integration is unavailable locally; CI is the real Testcontainers gate, with
no tests skipped. Chromium automated browser runs lack `libnspr4`; the web result was
manually approved by the user.

Use Node 24.21.0 from `/home/bkpdi/.nvm/versions/node/v24.21.0/bin`; the default is
24.16. Corepack provides pnpm 11.26.0. Windows pnpm is broken. A temporary
`/tmp/maria-tools/pnpm` symlink and `npm_config_store_dir=/tmp/maria-pnpm-store` fixed
nested pnpm scripts; verify they still exist before reuse. Do not add project config for
personal paths.

## Next actions

Finish/watch CI, fix any failing check, then obtain human RLS/security approval before merge. Keep
product schema, migrations, runtime roles and API/auth work at their consuming slices;
preserve RLS and transaction cleanup.

Update this file in place as status changes. Replace stale facts; do not add transcript,
secrets, or normative policy already covered by [`AGENTS.md`](AGENTS.md).
