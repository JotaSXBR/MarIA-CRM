# MarIA CRM handoff

Updated: 2026-09-17

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current objective

- Branch: `feat/notes-tasks-contact-detail` on `main` (`300fef9`, PR #58 merged).
- Scope: notes/tasks domain + first detail page — `notes`/`tasks` tables with
  forced RLS (migration `0012_notes_tasks.sql`), scoped persistence with
  cross-workspace ref validation, API routes nested under contacts plus
  item-level `PATCH /tasks/:id`, `DELETE /tasks/:id`, `DELETE /notes/:id`,
  and `/contacts/$contactId` UI (deals, tasks with completion toggle, notes
  timeline) linked from the contacts list.
- Also fixed: `POST /channel-instances` now requires workspace admin
  (previously any member; UI already hid the form).
- Direction confirmed: Companies stays — B2B model where multiple contacts
  belong to one company (detail pages will give it substance).
- Next after this: `contacts.companyId` link, company/deal detail pages,
  then tags/custom attributes and global search.

## Memory model

- `AGENTS.md`: always-on normative invariants and routing rules.
- `.devin/skills/`: focused procedures loaded only when relevant.
- `adr/`: durable architectural decisions and tradeoffs.
- `HANDOFF.md`: current branch, verified state, blockers, and immediate next actions only.
- Git, PRs, migrations, and test results remain the factual source of truth.
- Devin session resume (`devin -c` / `devin --resume`) preserves conversational context but is not shared repository memory.

## Verified state

- `main` at `300fef9` (PR #58 merged: settings/profile/channel management).
- Slice implemented: schema + migration `0012` (notes/tasks, indexes, forced
  RLS, `GRANT SELECT, INSERT, UPDATE` to `maria_runtime`), database methods
  (`listDealsForContact`, `listNotes`/`createNote`/`deleteNote`,
  `listTasks`/`createTask`/`updateTask`/`deleteTask`), API routes, contact
  detail page, vendored `field`/`textarea`/`checkbox`/`badge`/`empty`.
- Checks: `pnpm fmt:check`, `pnpm lint` (0 errors, 9 pre-existing warnings),
  `pnpm typecheck` all packages, `pnpm test` web 7/7,
  `pnpm test:integration` api 35/35, database 19/19 (incl. new notes/tasks
  RLS test), auth 5/5, `pnpm build` all.
- Dev DB note: local `maria_runtime` password is `local-runtime-change-me`;
  workspace "Operacao" seeded for admin@example.test (password `maria123`).

## Blockers and risks

- None blocking.
- `components.json` reports `"style": "base-nova"` — works; revisit if the CLI
  complains on future `add` runs.
- Old route pages still use raw `slate-*` classes; token migration is incremental.
- Notes/tasks are only reachable via the contact detail UI so far; entity-level
  list/create routes for companies/deals exist in the DB layer but have no
  API surface yet (deferred to those detail pages).
- CRM domain gaps remain open work: no `contacts.companyId`, no company/deal
  detail pages, no tags/custom attributes, no global search.

## Next actions

1. Commit `feat/notes-tasks-contact-detail`, push, open PR, wait for checks
   and merge.
2. Slice 4: `contacts.companyId` + company detail page (contacts, deals,
   notes aggregated), then deal detail page.
