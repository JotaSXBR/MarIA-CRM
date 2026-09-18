# MarIA CRM handoff

Updated: 2026-10-16

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current objective

- `main` at `99c7a36` — PRs #61–#64 merged (skill audit, lint warnings → 0,
  NULL-distinct comments, code-simplifier refocused to per-slice).
- PR #65 open (`chore/pr-label-rule`): AGENTS.md now requires labels on
  every PR; `chore`/`refactor` labels created, PRs #62–#65 tagged.
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

- `main` at `99c7a36` (2026-10-16): PRs #61–#64 merged. Lint baseline is
  now **0 warnings / 0 errors** — keep it clean.
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
- Notes/tasks are only reachable via the contact detail UI so far; entity-level
  list/create routes for companies/deals exist in the DB layer but have no
  API surface yet (deferred to those detail pages).
- CRM domain gaps remain open work: no `contacts.companyId`, no company/deal
  detail pages, no tags/custom attributes, no global search.

## Deferred from the code-simplifier review

- **mime→kind mapping exists twice**: `attachmentContentType`
  (`routes/messaging.ts`) vs `mediaKindFromMime` (`channel-waha`). Opposite
  directions (outbound classify vs inbound normalize); consolidate in
  `@maria/messaging` only when a third use or shared direction appears.

## Next actions

1. Merge PR #65 when `verify` passes (CodeQL/analyze/dependency-review already green).
2. Slice 4: `contacts.companyId` + company detail page (contacts, deals,
   notes aggregated), then deal detail page.
