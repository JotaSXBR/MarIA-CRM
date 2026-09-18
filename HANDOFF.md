# MarIA CRM handoff

Updated: 2026-09-18

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current objective

- `main` — PRs #61–#69 merged (…pnpm 12.4.2, deal detail, workspace
  tags on contacts/companies/deals).
- Branch `feat/company-write-paths` — company detail write paths
  implemented and verified: `GET|POST /companies/:id/tasks` +
  `POST /companies/:id/notes`; notes/tasks cards extracted into shared
  `EntityTasksCard`/`EntityNotesCard` used by all three detail pages.
- Next after this: custom attributes (deferred — needs typed
  definition/value model), then global search.

## Memory model

- `AGENTS.md`: always-on normative invariants and routing rules.
- `.devin/skills/`: focused procedures loaded only when relevant.
- `adr/`: durable architectural decisions and tradeoffs.
- `HANDOFF.md`: current branch, verified state, blockers, and immediate next actions only.
- Git, PRs, migrations, and test results remain the factual source of truth.
- Devin session resume (`devin -c` / `devin --resume`) preserves conversational context but is not shared repository memory.

## Verified state

- `main` (2026-09-18): PRs #61–#69 merged (#69 at `e036dcf`).
  Lint baseline is **0 warnings / 0 errors** — keep it clean.
- Slice 7 on `feat/company-write-paths` (2026-09-18, Windows/pnpm):
  - API `routes/companies.ts`: `POST /companies/:id/notes` +
    `GET|POST /companies/:id/tasks` mirroring the contact routes
    (author/assignee = session user; `createNote`/`createTask` already
    validate `companyId` via `entityRefsValid` inside the scoped
    transaction → `undefined` → 404).
  - Web: the identical notes/tasks cards previously duplicated in
    contact-detail and deal-detail extracted to
    `components/entity-activity.tsx` (`EntityTasksCard`,
    `EntityNotesCard` — self-contained query/mutations keyed by
    `entityPath`, per-card error line, admin-gated deletes, optional
    note placeholder prop). All three detail pages now use them;
    company detail gained the tasks card and note/task creation
    (~550 duplicated lines removed, net diff −250 lines).
- Checks (`feat/company-write-paths` dirty tree, 2026-09-18):
  `pnpm fmt:check` clean; `pnpm lint` 0/0; `pnpm typecheck` 6/6;
  `pnpm test` web 10/10 (company test now covers GET tasks + POST
  notes/tasks); `pnpm test:integration` api 40/40 (company aggregates
  test extended with tasks GET/POST + notes POST + 404); `pnpm build`
  6/6.
- Slice 6 on `feat/entity-tags` (2026-09-18, Windows/pnpm 12.4.2):
  - `schema.ts` + migration `0015_entity_tags.sql`: `tags`
    (workspace_id, name, color, soft-delete; partial unique
    `(workspace_id, name)` on active rows) + `contact_tags`/
    `company_tags`/`deal_tags` join tables (workspace_id carried on the
    join row, composite PK `(tag_id, entity_id)`, entity index, cascade
    FKs). All four tables FORCE RLS with workspace policies; runtime
    grants `SELECT/INSERT/UPDATE` on `tags`, plus `DELETE` on the join
    tables (wipe-and-rewrite needs it; `tags` itself is soft-delete).
  - DB (`index.ts`): `tagColumns`; tag CRUD where `createTag`/`updateTag`
    return `undefined` on active-name conflict (routes → 409; PATCH
    resolves the tag first for 404 vs 409); `listXTags` via shared
    `tagsForEntity` join helper; `setXTags` via shared `setEntityTags`
    wipe-and-rewrite — dedupes input, validates every tag id is an active
    workspace tag and the parent entity exists active in the scoped
    transaction (`contactCompanyRefsValid`/`dealRefValid`), else
    `undefined` → 404.
  - API: `tagSchema`/`tagIdsBodySchema` in `routes/shared.ts`;
    `routes/tags.ts` with CRUD (`PATCH` 409 on name conflict, `DELETE`
    admin-only 403→404/204); `registerEntityTagRoutes` helper registers
    `GET|PUT /{contacts,companies,deals}/:id/tags` from each entity module
    (parent-checked 404, PUT replaces the whole set). `/tags` added to
    the Vite proxy.
  - Web: `components/tag-picker.tsx` — `TagChip` + `TagPicker`
    (dropdown of workspace tags with checkbox items, inline create that
    auto-assigns, `PUT` on every toggle); wired into contact/company/
    deal detail headers. `routes/settings-tags.tsx` at `/settings/tags`
    (create with color, rename, recolor, admin-only delete, live chip
    preview). Note: `DropdownMenuLabel` must sit inside
    `DropdownMenuGroup` — Base UI throws `MenuGroupContext is missing`
    otherwise (caught by the new web test).
- Checks (`feat/entity-tags` dirty tree, 2026-09-18): `pnpm fmt:check`
  clean; `pnpm lint` 0/0; `pnpm typecheck` 6/6; `pnpm test` all green
  (web 10/10 incl. new tags test: chips, toggle→PUT, create→POST+PUT);
  `pnpm test:integration` api 40/40 (tag CRUD 409/admin-delete +
  entity-tag routes), database 23/23 (new tags RLS/refs/replace test,
  privilege + FORCE-RLS lists extended), auth 5/5; `pnpm build` 6/6.
- pnpm 12.4.2 merged via PR #67 (`chore/pnpm-12`): all pins moved
  (`package.json#packageManager`, `ci.yml`, `api.Dockerfile`,
  `AGENTS.md` baseline). pnpm 12 writes a two-document `pnpm-lock.yaml`:
  doc 1 pins the package-manager itself (`packageManagerDependencies` for
  `pnpm@12.4.2` plus `@pnpm/exe.*` platform binaries with integrity), doc 2
  is the unchanged project lockfile — expected, not corruption;
  `--frozen-lockfile` accepts it and adds a "supply-chain policies"
  verification step.
  Global install note: pnpm 12 ships a shebang-less placeholder `pnpm` bin
  that its `install.js` replaces with the native `@pnpm/exe` binary.
  `npm i -g pnpm@12.4.2 --ignore-scripts` skips that step — the bin then
  only works through a shell (bash ENOEXEC fallback) and any direct
  `execvp` spawn (turbo tasks, `strace`) fails with
  `Exec format error (os error 8)`. This broke PR #67 CI's `pnpm verify`
  (turbo spawns `pnpm run typecheck` per package) until `--ignore-scripts`
  was removed from the global-install lines in `ci.yml`/`api.Dockerfile`.
  Keep `--ignore-scripts` on `pnpm install` itself (allowBuilds policy).
  Verified via clean `node:24-bookworm-slim` clone:
  `--ignore-scripts` reproduces the ENOEXEC, without it `/usr/local/bin/pnpm`
  is ELF and `turbo run typecheck --force` passes 6/6 real spawns.
- Checks (`chore/pnpm-12` dirty tree, 2026-09-18, Windows/pnpm 12.4.2):
  `pnpm install --frozen-lockfile --ignore-scripts` green; `pnpm fmt:check`
  clean; oxlint 0/0; `pnpm typecheck` 6/6; `pnpm test` all green;
  `pnpm test:integration` api 37/37, database 22/22, auth 5/5;
  `pnpm build` 6/6; `pnpm --filter @maria/api deploy --prod` green;
  `pnpm audit --prod` clean.
- Slice 5 on `feat/deal-detail` (2026-09-18, Windows/pnpm):
  - `dealsWithNames` gained `contactName`/`companyName` leftJoins;
    `getDeal` now resolves through it (named deal for the detail view).
    `entityDealSchema` requires the two new nullable name fields — the
    same payload serves `GET /deals/:id`, `/contacts/:id/deals` and
    `/companies/:id/deals`.
  - New routes in `routes/pipelines.ts`: `GET /deals/:id/{notes,tasks}`
    (parent-checked 404) and `POST /deals/:id/{notes,tasks}` (author/
    assignee = session user, deal ref validated in the scoped
    transaction). `PATCH /tasks/:id`, `DELETE /tasks|notes/:id` already
    existed and are shared.
  - Web: `/deals/$dealId` page (`routes/deal-detail.tsx`) — header with
    stage badge, value, entity links, edit modal; tasks card (create,
    toggle, admin delete) and notes card (create, admin delete) mirroring
    the contact-detail conventions. Kanban card click navigates to the
    detail page; `DealEditor` moved to `components/deal-editor.tsx`;
    `EntityDealList` extracted for the identical deal cards in
    contact/company detail.
- Checks (`feat/deal-detail` dirty tree, 2026-09-18, Windows/pnpm):
  `pnpm fmt:check` clean; `pnpm lint` 0/0; `pnpm typecheck` 6/6;
  `pnpm test` api 26/26, web 9/9 (new deal-detail test + updated
  card→detail→editor flow); `pnpm test:integration` api 38/38 (new deal
  routes test), database 22/22 (dealId filters + getDeal names), auth
  5/5; `pnpm build` 6/6.
- Slice 4 merged via PR #66 (branch `feat/contact-company-link`):
  - `packages/database/src/schema.ts` + migration
    `0014_contact_company_link.sql`: nullable `contacts.company_id` FK →
    `companies.id` + partial `contacts_company_active_idx`
    (`deleted_at IS NULL`), same convention as `notes_company_active_idx`.
  - `contactColumns` exposes `companyId`; `createContact`/`updateContact`
    validate the company via `contactCompanyRefsValid` inside
    `withWorkspace` (cross-tenant, missing or soft-deleted → `undefined`).
    `null` clears the link; omitted `companyId` preserves it.
    `listContacts` gained an optional `{ companyId }` filter;
    `dealsWithNames` helper shared by `listDealsForContact` and the new
    `listDealsForCompany`.
  - `apps/api`: `contactSchema` moved to `routes/shared.ts` with
    `entityDealSchema`/`noteSchema`/`taskSchema`/`entityLinkProperties`
    (shared by contacts+companies plugins). `POST`/`PATCH /contacts` accept
    `companyId` (invalid ref → 404). New aggregate routes
    `GET /companies/:id/{contacts,deals,notes}` — parent-checked 404 like
    the contact detail routes.
  - `apps/web`: new `routes/company-detail.tsx` (contacts/deals/notes
    cards, read-only) at `/companies/$companyId`; company names link to
    the detail page; contact form gained a company `<select>` ("Sem
    empresa" clears) + "Empresa" column; contact detail links its company.
    `ContactDeal` type renamed `EntityDeal` (shared by both parents).
  - Per-slice `code-simplifier` pass applied: contactSchema deduplicated
    into shared.ts; aggregate routes gained parent-existence 404 for parity
    with contact detail routes; dead flex wrapper dropped.
- Checks (Slice 4, 2026-09-17,
  Windows/pnpm): `pnpm fmt:check` clean; oxlint direct
  (`pnpm exec oxlint --type-aware apps packages`) **0 warnings/0 errors**;
  `pnpm typecheck` 6/6; `pnpm test` api 26/26, web 8/8 (new company-detail
  test), database 1/1, messaging 1/1, channel-waha 24/24;
  `pnpm test:integration` api 37/37 (2 new tests), database 22/22 (2 new
  tenant-ref/aggregate tests), auth 5/5; `pnpm build` 6/6.
  - Environment quirk (resolved 2026-09-17): the local RTK hook
    (`.devin/hooks.v1.json`, untracked) rewrote `pnpm lint` → `rtk lint`,
    which is ESLint-only. Fixed by adding `"pnpm lint"` to
    `[hooks].exclude_commands` in `%APPDATA%/rtk/config.toml` so the real
    script (oxlint) runs.
- PR #61 (skill audit) merged — `skill-creator` in `.agents/skills/`,
  maria skills updated per below; PR #62 (9 oxlint warnings fixed);
  PR #63 (NULL-distinct comments); PR #64 (code-simplifier 639→103 lines,
  per-slice default before tests/commit/PR).
- Maria-skill audit (merged via #61, 2026-10-16):
  - `skill-creator` installed via `npx skills` into `.agents/skills/` +
    `skills-lock.json` (ecosystem manifest; `npx skills check/update` work).
  - `maria-api-development`: stale `app.ts` reference corrected to the
    `routes/` plugin layout; added domain-plugin rule and the rawBody
    route-scoped-hook note.
  - `maria-database-rls`: added NULL-unique → partial-index rule (migration
    0013 lesson).
  - `maria-devin-adaptation`: stale 4-skill enumeration replaced by
    "list `.devin/skills/`"; documented `.agents/` for ecosystem skills.
  - Descriptions of api-development, database-rls, dev-setup, testing and
    devin-adaptation gained "Applies when…" triggers (skill-creator guidance:
    description is the activation mechanism).
  - No ADR changes needed — the corrections were bug fixes/reorganization,
    not new decisions; ADR comments in code were fixed in PR #60.
- Simplification pass merged via PR #60 (2026-10-16):
  - `apps/api/src/app.ts`: `AppDependencies.database` now derives from
    `Database` (`Omit<Database, "close"|"withWorkspace"|"withUser">`) instead
    of ~310 lines of hand-duplicated signatures; shared `meResponseSchema`;
    dropped `400` response entries that no handler emits (notes/tasks POST,
    tasks PATCH, message retry/resolve).
  - `apps/api/src/dispatch.ts`: `DispatchDatabase` is now
    `Pick<Database, …>` of the four methods it uses; dead `maintainWorkspace` removed (no callers;
    `GET /conversations` does reap+dispatch inline on purpose — the handler
    must not await the full drain).
  - `packages/database/src/index.ts`: extracted `channelInstanceColumns`,
    `conversationColumns`, `messageColumns` (same convention as existing
    `*Columns` maps); `recordWebhookEvent` helper for the dedup insert shared
    by `receiveInboundMessage`/`recordDeliveryStatus`; `updateDeal`/`updateTask`
    pass patch input to `.set()` directly (Drizzle skips `undefined`);
    `lastPosition` takes an optional parent filter (used by createStage/
    createDeal/createPipeline).
  - `packages/messaging`, `packages/channel-waha`: comment/test references to
    "ADR 0012" for presence choreography corrected to ADR 0013.
  - `apps/web`: new `lib/format.ts` (initials, pt-BR date/time, BRL currency)
    and `lib/types.ts` (API response shapes) replace per-page duplicates in
    inbox/contacts/companies/pipelines/contact-detail/settings-channels/
    app-sidebar; `lib/api.ts` gained a shared `request()` used by `api()` and
    `apiBlob()`; `settings.tsx` uses `Link` `activeProps` instead of manual
    `pathname.startsWith`; relative `../lib/*.ts` imports standardized on `@/`.
- Deferred corrections merged in the same PR #60:
  - `apps/api/src/app.ts` split into `src/routes/{session,admin,contacts,
companies,pipelines,messaging}.ts` + `routes/shared.ts` (auth guards,
    `RouteDatabase`, shared schemas). `buildApp` is now ~85 lines of wiring;
    `/health` stays inline. Route registration order and schemas unchanged.
  - Webhook `rawBody` buffering moved from a global `preParsing` hook to the
    WAHA webhook route options — other routes (incl. 40MB message uploads)
    no longer double-buffer.
  - Ordering fixes: `listTasks` now returns open tasks first
    (`desc(doneAt)` → NULLS FIRST); `listConversations` orders
    `updatedAt DESC` (inbox recency).
  - `receiveInboundMessage` upsert backfills `conversations.contact_id`
    (`coalesce(existing, excluded)`) when a later event resolves the sender.
  - `channel_instances` uniqueness: migration `0013_channel_instance_null_key.sql`
    splits the unique index into two partial indexes so a default
    (`provider_instance_id IS NULL`) instance is unique per
    workspace+provider; schema.ts updated accordingly.
  - `PATCH /me` now 400s on `currentPassword` without `newPassword`
    (previously a silent no-op).
  - `AuthPort.ensureAdmin` removed — `verifySession` already reads
    `users.isAdmin`/`active` fresh per request, so the method duplicated it
    with no callers. `Dispatcher.dispatchIntent` kept: documented
    single-send primitive a future worker will need.
- Checks (revision `ed97d77` + dirty tree above, 2026-10-16, Windows/pnpm):
  `pnpm fmt:check` clean; `pnpm lint` 0 errors, 9 pre-existing warnings;
  `pnpm typecheck` 6/6 packages; `pnpm test` api 26/26, web 7/7, database 1/1,
  messaging 1/1, channel-waha 24/24; `pnpm test:integration` api 35/35,
  database 20/20 (incl. new null-unique + contactId-backfill + ordering
  assertions), auth 5/5.
- Dev DB note: local `maria_runtime` password is `local-runtime-change-me`;
  workspace "Operacao" seeded for admin@example.test (password `maria123`).

## Blockers and risks

- None blocking.
- `components.json` reports `"style": "base-nova"` — works; revisit if the CLI
  complains on future `add` runs.
- Old route pages still use raw `slate-*` classes; token migration is incremental.
- CRM domain gaps remain open work: no custom attributes (typed
  definition/value model deferred), no global search.

## Deferred from the code-simplifier review

- **mime→kind mapping exists twice**: `attachmentContentType`
  (`routes/messaging.ts`) vs `mediaKindFromMime` (`channel-waha`). Opposite
  directions (outbound classify vs inbound normalize); consolidate in
  `@maria/messaging` only when a third use or shared direction appears.

## Next actions

1. Push `feat/entity-tags` and open the PR (label `enhancement`).
2. Custom attributes (typed definitions + per-entity values), then
   global search.
3. Company detail write paths (`POST /companies/:id/{notes,tasks}`) if parity
   with the deal detail hub is wanted.
