# MarIA CRM handoff

Updated: 2026-09-17

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current objective

- Branch: `feat/app-shell` on `main` (`007b581`), open as PR #57.
- Scope: app shell redesign — vendored shadcn/Base UI primitives, sidebar with
  workspace switcher + main nav + user footer, inbox-first landing.
- Direction set with the operator: next product slices are CRM surface, not agents —
  settings/user area (`/me` is read-only today), channel-management UI, then
  tasks/notes and detail pages.

## Memory model

- `AGENTS.md`: always-on normative invariants and routing rules.
- `.devin/skills/`: focused procedures loaded only when relevant.
- `adr/`: durable architectural decisions and tradeoffs.
- `HANDOFF.md`: current branch, verified state, blockers, and immediate next actions only.
- Git, PRs, migrations, and test results remain the factual source of truth.
- Devin session resume (`devin -c` / `devin --resume`) preserves conversational context but is not shared repository memory.

## Verified state

- `main` at `007b581` (PR #56 squash-merged: docs drift + UI skills); PR #57 open
  with the app-shell slice.
- `feat/app-shell`: shadcn init done in `apps/web` (Base UI registry, `components.json`,
  `@/*` alias in tsconfig + vite + vitest). Vendored: button, sidebar, dropdown-menu,
  avatar, input, separator, sheet, skeleton, tooltip + `use-mobile` hook.
- New `src/components/app-sidebar.tsx`; `shell.tsx` rewritten on `SidebarProvider` +
  `SidebarInset`; `/` and login now land on `/inbox`.
- Deps added: `@base-ui/react`, `class-variance-authority`, `cn` (MIT), `lucide-react`,
  `tw-animate-css`, `@fontsource-variable/geist`; `shadcn` pinned as devDependency.
- Checks on this branch: `pnpm typecheck` clean, `pnpm test` 5/5, `pnpm build` ok,
  `pnpm fmt:check` ok, `pnpm lint` 0 errors (9 pre-existing warnings in app.test.tsx).
- Local smoke: API + Vite running; workspace "Operacao" seeded for admin@example.test.

## Blockers and risks

- None blocking. `feat/media-messages` merged; `chore/docs-drift-fixes` awaits PR #56 merge.
- `components.json` reports `"style": "base-nova"` (generated value; CLI presets list
  differed) — works, but revisit if the CLI complains on future `add` runs.
- Old route pages still use raw `slate-*` classes; token migration is incremental.
- CRM domain gaps remain open work: no tasks/notes/tags/custom attributes, `/me` is
  GET-only, `channel-instances` has no UI, no detail pages, no global search.

## Next actions

1. Wait for PR #57 checks and merge.
2. Slice 2: settings/user area — `PATCH /me` in `@maria/auth`, profile and channel
   management UI over the existing `channel-instances` API.
3. Slice 3: tasks/notes domain (RLS tables + API + UI), then contact/deal detail pages.
