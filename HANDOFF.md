# MarIA CRM handoff

Updated: 2026-09-17

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current objective

- Branch: `chore/docs-drift-fixes` off `main` (`b4f2b11`).
- Scope: correct documentation drift found in the ADR audit and the `/messages` Vite
  proxy omission — a recurrence of the ADR 0003 proxy footgun that breaks inbox media,
  retry and resolve calls under `pnpm dev`.
- Direction set with the operator: next product slices are CRM surface, not agents —
  app shell + vendored shadcn primitives, settings/user area (`/me` is read-only today),
  channel-management UI, then tasks/notes and detail pages.

## Memory model

- `AGENTS.md`: always-on normative invariants and routing rules.
- `.devin/skills/`: focused procedures loaded only when relevant.
- `adr/`: durable architectural decisions and tradeoffs.
- `HANDOFF.md`: current branch, verified state, blockers, and immediate next actions only.
- Git, PRs, migrations, and test results remain the factual source of truth.
- Devin session resume (`devin -c` / `devin --resume`) preserves conversational context but is not shared repository memory.

## Verified state

- `main` at `b4f2b11`: media messages merged via PR #54 with all checks green.
- Full ADR audit (0001–0013) on 2026-09-17: no architectural deviation; drift items were
  stale implementation statuses (ADRs 0010, 0013), the stale `ARCHITECTURE.md` inventory,
  and the missing `/messages` dev-proxy entry — all corrected on this branch.
- UX research pass (`maria-pattern-research`): Twenty and Chatwoot classified UX-only
  (mixed licenses), atomic-crm and shadcn/ui classified adapt (MIT); Refine CRM rejected.

## Blockers and risks

- None blocking. Local branch `feat/media-messages` is merged and can be deleted.
- CRM domain gaps remain open work, not regressions: no tasks/notes/tags/custom
  attributes, `/me` is GET-only (no profile/password endpoints), `channel-instances`
  has no UI, no detail pages, no global search.

## Next actions

1. Run `pnpm fmt` + `pnpm lint`, commit and push this branch, open the PR.
2. Slice 1 (next feature branch): app shell restructure + vendored shadcn/ui sidebar,
   dropdown and dialog primitives.
3. Slice 2: settings/user area — `PATCH /me` in `@maria/auth`, profile and channel
   management UI over the existing `channel-instances` API.
4. Slice 3: tasks/notes domain (RLS tables + API + UI), then contact/deal detail pages.
