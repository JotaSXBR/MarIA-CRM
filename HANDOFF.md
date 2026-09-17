# MarIA CRM handoff

Updated: 2026-09-17

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current objective

- Branch: `feat/settings-area` on `main` (`3c8d114`, PR #57 merged).
- Scope: settings/user area — `PATCH /me` (name + password change revoking other
  sessions), `/settings` route with sub-nav (Perfil, Canais), profile form,
  channel-instances list/create UI, Configurações entry in the shell footer.
- Direction confirmed with the operator: Companies stays — B2B model where multiple
  contacts belong to one company (detail pages will give it substance).
- Next after this: tasks/notes domain, then contact/company/deal detail pages.

## Memory model

- `AGENTS.md`: always-on normative invariants and routing rules.
- `.devin/skills/`: focused procedures loaded only when relevant.
- `adr/`: durable architectural decisions and tradeoffs.
- `HANDOFF.md`: current branch, verified state, blockers, and immediate next actions only.
- Git, PRs, migrations, and test results remain the factual source of truth.
- Devin session resume (`devin -c` / `devin --resume`) preserves conversational context but is not shared repository memory.

## Verified state

- `main` at `3c8d114` (PR #57 merged: app shell + vendored primitives).
- `feat/settings-area`: `auth.changePassword` (verifies current password, updates
  hash, deletes other sessions except the caller's token); `PATCH /me` route;
  settings UI (profile + channels) under `/settings`; new vendored `card`/`label`.
- Checks: `pnpm fmt`, `pnpm lint` (0 errors, 9 pre-existing warnings),
  `pnpm typecheck` all packages, `pnpm test` web 6/6, api integration 31/31,
  auth integration 5/5 (incl. new changePassword test), `pnpm build` all.
- Local smoke: PATCH /me verified end-to-end against the dev DB; preview up.
- Dev DB note: local `maria_runtime` password is `local-runtime-change-me`;
  workspace "Operacao" seeded for admin@example.test.

## Blockers and risks

- None blocking.
- API gap noted: `POST /channel-instances` accepts any workspace member; the UI
  only shows the create form to workspace admins (visibility ≠ authorization).
  Consider tightening server-side if channel config should be admin-only.
- `components.json` reports `"style": "base-nova"` — works; revisit if the CLI
  complains on future `add` runs.
- Old route pages still use raw `slate-*` classes; token migration is incremental.
- CRM domain gaps remain open work: no tasks/notes/tags/custom attributes,
  no detail pages, no global search.

## Next actions

1. Commit `feat/settings-area`, push, open PR, wait for checks and merge.
2. Slice 3: tasks/notes domain (RLS tables + API + UI), then contact/company/deal
   detail pages (which give Companies its substance: contacts grouped per company).
