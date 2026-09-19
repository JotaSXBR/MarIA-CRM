# MarIA CRM handoff

Updated: 2026-09-19

## Verify first

```bash
git status --short --branch
git branch --show-current
gh pr status
```

## Current objective

- `main` at `057f250` — PRs #61–#90 merged (…global search, accepted ADR 0015,
  phased product `ROADMAP.md`, centralized workspace RBAC, first-run
  `/setup`, Ajv `allowUnionTypes` fix closing issue #76, workspace
  invitations, delegated member management, workspace onboarding
  wizard, conversation ownership/queues, ADRs 0016–0018, Devin-only
  agent contract, testcontainer flake fixes, web token pass).
  **Phase 1 (access foundation + onboarding) is complete** per
  ROADMAP.md / ADR 0015.
- Product track: **Phase 2 — human operator workflow** per
  `ROADMAP.md`. Slices proceed one at a time; the next is chosen
  after each merge (see Next actions).
- AI direction (user decision, 2026-09-19): interleave — build
  observer-mode primitives as human features during Phase 2 (queues/
  ownership → telemetry, editable knowledge base → later agent reads),
  keep autonomous execution for Phase 4 once the Execution Plane
  exists.
- UI strategy (user decision, 2026-09-19): hybrid — each new feature
  lands with correct design; a dedicated density/empty-state pass
  closes Phase 2 rather than waiting for project end. The raw
  `slate-*` → semantic-token migration is done (#88).
- Agent-tooling side change (local branch, 2026-09-19): added a lean, project-local
  `task-observer` skill under `.devin/skills/`. It activates only on explicit/high-signal
  reusable workflow corrections; no session-start scan, checkpoints, hooks, scheduler,
  scripts, autonomous skill edits, or product-suite gate. Sanitized observations are stored
  only when needed under gitignored `.devin/task-observer/`; skill changes still require
  explicit approval and the normal `skill-creator`/PR workflow. Based on upstream v3.2.0
  (`e72b1dc`) under CC BY 4.0 with attribution retained.
- Gitignore audit (local branch, 2026-09-19): expanded shared rules for private-key
  stores, data exports/backups, Node/Vite caches and diagnostics, runtime sidecars,
  and Windows/editor residue; removed the blanket `docs/` rule so future shared
  documentation remains trackable. Env examples, lockfiles, migrations, `.npmrc`,
  and shared `.devin` config remain intentionally trackable. A path-only history
  audit found only `docker/.env.example` among env/private-key patterns. GitHub
  currently reports secret scanning and push protection enabled on the public repo;
  switching to private later does not retract existing public clones or forks.
- Slice 2.1 (merged in #83) — **conversation ownership and queues**
  (ROADMAP Phase 2.1):
  - Migration `0020_conversation_ownership.sql`: `conversations` gains
    `assigned_user_id` (FK users, SET NULL) + `assigned_at`; new
    append-only `conversation_assignments` audit table (FORCE RLS,
    runtime holds SELECT/INSERT only); index `(workspace_id,
assigned_user_id)`.
  - `@maria/database`: `listConversations` takes `{filter:
all|mine|unassigned, userId}`; `assignConversation` runs `FOR
UPDATE` on the conversation row — `canDelegate` (route passes
    manager+) sets any assignee, others may only claim an unassigned
    conversation for self or release their own; assignee must hold a
    membership with role >= agent (`viewer` cannot own) → result union
    `ok|not-found|forbidden|not-member`; every change inserts an audit
    row. `listConversationAssignments` joins both user sides (assignee
    - actor names), newest first, cap 50.
  - API `routes/messaging.ts`: `GET /conversations?queue=` (enum
    all|mine|unassigned, forwards session userId), `PATCH
/conversations/:id/assignment {assigneeId|null}` (agent+; 403
    forbidden, 404 not-found, 409 not-member), `GET
/conversations/:id/assignments` (viewer+, 404 missing). Schema
    gains `assignedUserId/assignedUserName/assignedAt`.
  - Web inbox: queue tabs (Todas/Minhas/Sem responsável), assignee line
    per conversation, header control — manager+ gets a member `<select>`
    (viewers excluded), agent gets Assumir/Liberar, viewer reads a
    label; "Histórico de atribuição" toggle lists the audit rows.
- Slice 2.4 (branch `feat/operator-work-center`, in flight) —
  **operator work center** (ROADMAP Phase 2.4):
  - `listWorkQueue` — one scoped read assembling five groups, oldest
    first: `unassigned` (no assignee), `awaitingReply` (latest inbound
    without a _delivered_ outbound after it — `sent`/`delivered`/`read`
    only; failed/unknown/pending sends still count as waiting),
    `sendIssues` (outbound `failed`/`unknown`, ADR 0010 resolution
    path), `overdueTasks` (`dueAt < now`, open), `idleDeals` (active
    deals with no open task — the next-action proxy until Phase 2.5).
  - API `GET /work-queue` (viewer+) in `routes/work-queue.ts`.
  - Web: `/` is now the Central do operador (was a redirect to
    `/inbox`); sidebar gains "Central". Each section counts items and
    links rows to the owning surface (`/inbox`, `/contacts/:id`,
    `/deals/:id`).
  - Flake fix: `leaseMs: -1` raced `now()` across the Node/Postgres
    clock boundary (~1ms) — expired-lease assertions now use
    `-60_000` so clock skew cannot flake them (surfaced under parallel
    load in this branch's verify).
- Slice 2.3 (merged in #91) —
  **conversation → CRM context panel** (ROADMAP Phase 2.3):
  - `setConversationContact` validates the contact inside the scoped tx
    (`contactCompanyRefsValid`) and clears/links via one UPDATE — missing
    conversation or out-of-workspace contact → undefined → 404.
  - API `PATCH /conversations/:id/contact {contactId|null}` (agent+) returns
    the conversation projection; entity reads reuse existing
    `GET /contacts/:id{,/deals,/tasks}` and `GET /companies/:id`.
  - Web `components/conversation-context.tsx`: right-side `w-80` panel
    (`hidden lg:flex`, container `max-w-7xl`) with Contato (info, company
    link, attach/detach picker, create-and-link mini form), Negócios
    (`EntityDealList`) and Tarefas (compact add/toggle over the contacts
    routes). UI visibility is cosmetic — the route enforces agent+.
  - Deferred from the roadmap item: deal creation inside the panel (needs
    pipeline/stage pickers — operators still create deals from
    `/pipelines`); entity notes stay on the contact page (internal notes
    already cover the thread).
- Slice 2.2 (merged in #90) —
  **conversation collaboration: internal notes + quick replies**
  (ROADMAP Phase 2.2):
  - Migration `0021_conversation_collaboration.sql`: `messages` gains
    `kind` (`message`|`note`, default `message`) + `author_user_id`
    (FK users, SET NULL); new `quick_replies` table (workspace-scoped,
    soft-delete, unique active `shortcut` per workspace, FORCE RLS,
    runtime SELECT/INSERT/UPDATE — delete is `deleted_at`).
  - Internal notes are `messages` rows (`kind=note`,
    `direction=internal`): they share the unified timeline, never
    create a dispatch intent and never reach the provider. Outbound
    replies now persist `author_user_id` from the session.
  - `@maria/database`: `messageColumns` gains `kind/authorUserId`;
    both message reads join `users` for `authorName`;
    `createConversationNote` validates the conversation inside the
    scoped transaction; quick-reply CRUD normalizes `shortcut`
    (lowercase, no leading `/`) and maps active duplicates to a
    `duplicate` result (route → 409).
  - API: `POST /conversations/:id/notes` (agent+, 404 missing
    conversation, max body length enforced); new `quick-replies.ts`
    plugin — `GET /quick-replies` (viewer+), `POST`/`PATCH` (agent+,
    empty PATCH → 400), `DELETE` (manager+); message response schemas
    expose `kind/authorUserId/authorName`.
  - Web inbox: composer tabs `Responder | Nota interna` (Synthor model;
    the third `✨Sugestão` tab stays deferred to ADR 0016); quick-reply
    picker inserts into the reply draft without sending; attachment
    actions hidden in note mode; notes render as warm full-width cards
    via new `--note` tokens (light + dark) — never as channel bubbles.
  - New settings page `/settings/replies` (list/create/edit/delete
    quick replies; delete gated to manager+ in UI — server enforces).
- Role-model note (user decision, 2026-09-19): keep the current
  capability matrix as-is for now; refine per-role specifics later,
  after more Phase 2 workflows exist. Route minimums are still chosen
  per slice.
- Slice 1.5 detail (merged in #81, merge commit `e0225a6`) —
  workspace onboarding wizard (ADR 0015 item 6):
  - Migration `0019_workspace_onboarding.sql`: `workspaces` gains
    `onboarding_state` jsonb (default `'{}'`) + `onboarded_at`.
    `workspaces` is an identity table (no RLS; runtime holds
    SELECT/INSERT/UPDATE) — access gated by membership at route level.
  - `@maria/auth`: `ONBOARDING_STEPS` registry (`basics → channel → team
→ review`), `getOnboarding` (stored status wins; else auto-resolve —
    `channel` done when a channel instance exists, `team` when members
    > 1), `updateOnboardingStep` (manager-facing write; `review` is
    > `invalid-step`; frozen after `onboarded_at`), `completeOnboarding`
    > (requires every non-review step done|skipped; sets `onboarded_at` +
    > marks `review` done; idempotent). Both mutations take `FOR UPDATE`
    > on the workspace row — read-modify-write merge, no lost updates.
    > `listUserWorkspaces` now returns `onboarded: boolean`.
  - API `routes/onboarding.ts`: `GET /onboarding` (viewer+),
    `PATCH /onboarding/steps/:step` (manager+; `review` excluded from
    the params enum → 400), `POST /onboarding/complete` (manager+; 409
    incomplete). `/me/workspaces` items gain `onboarded`.
  - Web: standalone `/onboarding` wizard (numbered checklist — niche
    form, WhatsApp step linking to `/settings/channels`, inline invite
    link generator, review summary + "Concluir e entrar"). `appRoute`
    `beforeLoad` redirects members of a non-onboarded workspace to
    `/onboarding` — except `/settings/channels` (the wizard links
    there). `< manager` members see read-only progress. Vite proxies
    `/onboarding` with a GET bypass when `workspaceId` is absent (SPA
    page vs API, same pattern as `/setup`).
  - Tests: auth integration 7 (default state, persist/skip, auto-resolve
    facts, rejection matrix, complete+freeze, concurrent complete via
    independent pools, `onboarded` flag); API 4 (read matrix, PATCH
    roles/statuses, complete 409/200); web 3 (gate redirect, wizard
    save+complete, viewer read-only); migrate 0019 (prefix upgrade,
    defaults).
  - Gotcha recorded: `jsonb_set` does NOT create intermediate path keys
    — onboarding writes use FOR UPDATE + whole-object merge instead.
- Slice 1.4 detail (merged in #80) — delegated membership administration:
  - `@maria/auth`: new `canManageRole(actor, target)` — `admin` manages
    any role incl. `admin`; `manager` manages `agent`/`viewer` only;
    `viewer`/`agent` manage nothing. `updateMembershipRole` and
    `removeMembership` take a required `actorRole` and return
    `"forbidden"` when the actor cannot manage the target's current (or
    new) role — the check runs **inside** the per-workspace advisory
    lock, so a racing promotion cannot slip an unmanageable target past
    the actor. `/admin/*` routes pass `"admin"` (platform admin keeps
    full reach; `forbidden` is unreachable there but mapped to 403).
  - API (`routes/invitations.ts`, the workspace team surface):
    `PATCH /members/:id` `{role}` and `DELETE /members/:id` — manager+
    minimum via `requireWorkspaceRole`, actor rank forwarded from the
    session membership; 403 forbidden, 404 not-found, 409 last-admin.
    Unlike invitations (schema-excluded), `admin` IS grantable via PATCH.
  - Web Settings → **Equipe**: member rows render a role `<select>`
    (options limited to grantable ranks) + remove button when the actor
    can manage that member's current role — manager sees controls only
    on `agent`/`viewer` rows; admin sees them on every row (self-edit
    guarded by last-admin). New `canManageWorkspaceRole` +
    `WORKSPACE_ROLES` in `lib/workspace.tsx`.
  - Slice 1.3 detail (for reference — merged in #79):
    - Migration `0018_workspace_invitations.sql`: `token`→`token_hash`,
      `used_at`→`consumed_at`, new `invited_by`, partial unique index on
      `(workspace_id, email) WHERE consumed_at IS NULL` (one live invite),
      and `invitations_scope` policy adds an `app.invite_token_hash` OR
      clause — the token itself authorizes reading exactly its own row
      (mirrors `memberships_scope`); `database.withInvitation(tokenHash)`
      is the new scoping helper (`RouteDatabase` omits it).
    - `@maria/auth`: `createInvitation` (revokes predecessors + partial
      unique race → `conflict`; member → `already-member`; 24-byte
      base64url token, sha256 hash stored, plaintext returned once;
      7-day TTL), `listInvitations` (live only), `revokeInvitation`
      (consume without membership), `previewInvitation` (token-scoped
      read), `acceptInvitation` — identity checks first (leave invite
      live), then workspace ctx + atomic consume inside the token-scoped
      tx (row lock serializes racing acceptors), then user create or
      attach + membership.
    - `routes/invitations.ts`: `GET /members` (viewer+);
      `POST|GET|DELETE /invitations` (manager+; grant must stay strictly
      below inviter rank → 403; `admin` excluded in schema → 400);
      public `GET /invitations/:token` (200 | 404 invalid | 410
      consumed/expired) and `POST /invitations/:token/accept` (Bearer →
      attach, else name+password → create + auto-login; 400 missing
      fields, 403 email-mismatch, 409 user-exists).
    - Web: public `/invite/$token` (preview, mismatch state with
      switch-account, create-account form, lands on the invited
      workspace); Settings → **Equipe** lists members (all roles) and
      manages invites (manager+): create form, one-time copyable link,
      revoke. Vite proxies `/members` + `/invitations`.
    - Tests: auth integration 8 (hash-only storage, preview/accept/
      replay, attach + mismatch, already-member, live-unique reissue,
      scoped list/revoke, expiry, concurrent accept via independent
      pools); API 6 (matrix, grant limits, statuses); migrate 0018 test
      (prefix upgrade, renames, index, policy); web 3 (accept→inbox,
      invalid/expired states, Equipe page).

## Memory model

- `AGENTS.md`: always-on normative invariants and delegation policy.
- `.devin/skills/`: focused procedures loaded only when relevant.
- `adr/`: durable architectural decisions and tradeoffs.
- `HANDOFF.md`: current branch, verified state, blockers, and immediate next actions only.
- Git, PRs, migrations, and test results remain the factual source of truth.
- Devin session resume (`devin -c` / `devin --resume`) preserves conversational context but is not shared repository memory.

## Verified state

- `feat/conversation-ownership` (2026-09-19, Windows/pnpm):
  - Ownership rules: `canDelegate` (manager+) → any transition;
    otherwise only claim-unassigned-for-self or release-own; assignee
    must be a member with role >= agent. All inside `FOR UPDATE` on the
    conversation row + audit insert per change.
  - Gates: fmt clean, lint 0/0, typecheck 6/6, unit web 23 + api 26 +
    auth 9; integration api 62, auth 25, database 34 (ownership 5 incl.
    concurrent claim → exactly one winner; migration 0020 prefix
    upgrade + RLS/grants); e2e 2/2; build 6/6.
- `feat/workspace-onboarding` (2026-09-19, Windows/pnpm):
  - Step status precedence: stored record > auto-resolve from facts
    (`channel`←channel_instances exist, `team`←members>1) > pending.
  - `updateOnboardingStep`/`completeOnboarding` serialize via
    `SELECT ... FOR UPDATE` on the workspace row inside `withWorkspace`;
    step writes merge `{...state.steps, [step]: record}` (jsonb_set does
    not create intermediate keys — don't regress to it).
  - Gates: typecheck 6/6, lint 0/0, fmt clean, unit web 22/22 + api 26 +
    auth 9; integration api 61, auth 25 (incl. concurrent complete),
    database 28 (incl. 0019 prefix upgrade); e2e 2/2; build 6/6.
- `feat/member-management` (2026-09-19, Windows/pnpm):
  - `canManageRole` rule: `admin` → any; `manager` → `{agent, viewer}`
    only (requires ≥ manager — the rank-only variant wrongly let
    `agent` manage `viewer`, caught by the new integration test);
    `viewer`/`agent` → nothing.
  - Rank check + last-admin guard both inside `lockWorkspaceMemberships`
    (advisory `pg_advisory_xact_lock`); race test proves a promote/remove
    pair serializes to `{updated, forbidden}` or `{removed, not-found}`.
  - Gates: typecheck 6/6, lint 0/0, fmt clean, unit web 19/19, api
    invitations 9/9; integration api 57, auth 18 (incl. grant-rank
    matrix + serialized race), database 27; e2e 2/2; build 6/6.
- `feat/workspace-invitations` (2026-09-18, Windows/pnpm):
  - `@maria/auth` `AuthPort` +5 methods; token hash = sha256 over a
    24-byte base64url secret; accept order = token-scoped read → identity
    checks (failed checks leave the invite live) → workspace ctx → atomic
    `consumed_at IS NULL` consume → user create/attach → membership insert
    with `ON CONFLICT DO NOTHING`; result unions `"already-member"`,
    `"conflict"`, `"invalid"`, `"unusable"`, `"user-exists"`,
    `"email-mismatch"`, `"not-found"`, `"revoked"`.
  - RLS: `invitations_scope` policy = workspace ctx OR
    `app.invite_token_hash`; `withInvitation` sets only the hash.
  - `RouteDatabase` excludes `close`/`withWorkspace`/`withUser`/
    `withInvitation`; route deps accept the narrowed type.
  - Tests green: auth invitations 8/8 (incl. independent-pool concurrent
    accept → exactly one success), api invitations 6/6, migrate 0018
    (renames, partial unique, `policyname` assertion), web 18/18.
  - Post-`code-simplifier`: shared `hasWorkspaceRole` in settings,
    `ReactNode` type import, single `tokenHash` per op; typecheck 6/6,
    lint 0/0, fmt clean.
- `feat/first-run-setup` (2026-09-18, Windows/pnpm):
  - `packages/auth`: `setupRequired()` (users empty) +
    `completeSetup()` — bcrypt before the tx; one `withWorkspace` tx
    holding `maria_auth_global_admin` re-checks the user count, then
    inserts master `is_admin`, implicit org, first workspace and the
    `admin` membership. `"already-setup"` is the only failure mode.
  - `apps/api/src/routes/setup.ts`: `GET /setup/status` (30/min) and
    `POST /setup` (5/min, `password` minLength 8); `SetupConfig` dep
    injects `{tokenRequired, token}`; boot token compared via sha256 +
    `timingSafeEqual`, marked consumed in-process on success;
    403 invalid/consumed/missing token, 409 already-setup, 201 `{token}`
    after `auth.login`.
  - `server.ts`: seeds env admin, reads `setupRequired`, generates a
    base64url token only when the install is empty AND
    `SETUP_TOKEN_REQUIRED !== "false"`, logs the `/setup?token=…` URL
    after listen. `SETUP_TOKEN_REQUIRED` added to turbo `passThroughEnv`;
    env vars documented in `DEVELOPMENT.md`.
  - `apps/web`: `/setup` public route — status query gates (loading /
    API-down error / `Navigate` to `/login` when complete), form Nome +
    Email + Senha(≥8) + Nome do workspace + optional Token de
    instalação (hidden when `?token=` present); `/login` `beforeLoad`
    redirects to `/setup` when `setupRequired` (fetch failure falls
    through to the form). `vite.config.ts` bypasses `GET /setup*` page
    loads except `/setup/status`, so SPA and API share the prefix.
  - Tests: `apps/api/test/setup.test.ts` (3 — status, 201+consumed
    replay 403, 409+400); `packages/auth/test/setup.integration.test.ts`
    (3 — atomic bootstrap assertions, advisory-lock-gated concurrency →
    1 user/1 admin/1 membership, env seed wins); `apps/web` (3 —
    anonymous → /setup redirect, form → inbox with auto-login, complete
    → /login); `server.e2e.test.ts` second case parses the boot-logged
    token from real stdout and drives the whole HTTP flow.
- `feat/workspace-rbac` (2026-09-18, Windows/pnpm):
  - Capability matrix: reads = `viewer`; CRM/inbox writes (POST/PATCH/PUT,
    tag assignment, attribute values, message send/retry/resolve, deal
    move) = `agent`; deletes + management (contact/company/deal/stage/
    tag/attribute/channel-instance) = `manager`; `/admin/*` unchanged
    (`session.isAdmin`). `registerEntityTagRoutes`/
    `registerEntityAttributeRoutes` take `requireWorkspaceRole`.
  - `createUser`/membership default role `agent`; `AuthPort` types use
    `WorkspaceRole`; `workspaceRoleSchema` (4-role enum) shared by
    `/me/workspaces` and admin role bodies.
  - New tests: `packages/auth/test/roles.test.ts` (9, rank order),
    `apps/api/test/workspace-roles.test.ts` (2 — matrix across
    viewer/agent/manager + platform-admin-without-membership denied),
    migrate test `0017 upgrades legacy member roles to agent on a
prior-prefix database`.
- Checks (`feat/workspace-rbac` dirty tree, 2026-09-18):
  `pnpm fmt:check` clean; `pnpm lint` 0/0; `pnpm typecheck` 6/6;
  `pnpm test` all green (auth roles 9/9, web 12/12);
  `pnpm test:integration` api 45/45, database 26/26 (incl. 0017 upgrade),
  auth 5/5 (incl. concurrent last-admin); `pnpm test:e2e` 1/1;
  `pnpm build` green.
- `main` (2026-09-18): PRs #61–#72 merged (#72 at `33baf41` squash).
  Lint baseline is **0 warnings / 0 errors** — keep it clean.
- Onboarding/roles research (2026-09-18, `docs/onboarding-roles`):
  - Seven CRM/agent references cloned/updated under `research/sources/`
    (gitignored): deskcomm-crm `d86fcea`, fazer-ai/agents `4197ab4`,
    agents-skills `e54ccb5`, compai-crm `6d4793d`, macro `2b5304d3`,
    erxes `d2dade7`, ever-gauzy `24c6a4d`. Findings + per-repo verdicts in
    `research/onboarding-roles-2026-09-18.md` (local only).
  - Key transferable patterns: deskcomm's `ROLE_RANK` +
    `requireRole(min)` + `onboarding_state` jsonb + step registry;
    fazer-ai's `/setup` boot-token + advisory-lock bootstrap + hashed-token
    `Invitation`. Both map cleanly onto existing `is_admin` +
    `memberships.role` axes and the ADR 0011 lock protocol.
  - ADR 0015 **accepted**, merged via PR #73 (merge commit `a60bf67`,
    2026-09-18): role rank `viewer<agent<manager<admin>`
    (`member`→`agent`), `/setup` first-run, workspace invitations
    (copyable link, no SMTP), workspace admins managing their own
    memberships (supersedes ADR 0011 restriction),
    `workspaces.onboarding_state` + step-registry wizard, initial
    capability matrix.
  - `docs/development-phases` records the product phases and slice
    decision process in `ROADMAP.md`; docs-only, no code changed.
- Slice 9 on `feat/global-search` (2026-09-18, Windows/pnpm):
  - DB `searchEntities`: three ILIKE substring queries in one
    `withWorkspace` — contacts (name/email/phone), companies (name),
    deals (title); `notDeleted`, name-ordered, `LIMIT 10` per group.
    User input is escaped for LIKE's default backslash escape so
    `%`/`_`/`\` stay literal.
  - API `routes/search.ts`: `GET /search?q=` requires `workspaceId`
    and non-empty `q` (400 otherwise), forwards the term to the db
    after workspace authorization.
  - Web: `/search` page — `?q=` search param (`validateSearch`),
    input + submit navigates and refetches, results grouped in
    Contatos/Empresas/Negócios cards linking to detail pages;
    "Busca" added to the sidebar nav.
- Checks (`feat/global-search` dirty tree, 2026-09-18):
  `pnpm fmt:check` clean; `pnpm lint` 0/0; `pnpm typecheck` 6/6;
  `pnpm test` web 12/12; `pnpm test:integration` api 43/43,
  database RLS 10/10 (search scoping, matching, soft-delete,
  wildcard escaping); `pnpm build` 6/6.
- Slice 8 on `feat/custom-attributes` (2026-09-18, Windows/pnpm):
  - ADR 0014: typed `attribute_definitions` (`entity_type`, slug `key`,
    `label`, `type` ∈ text|number|date|boolean|select, `options`, soft
    delete, partial unique `(workspace_id, entity_type, key)`) + EAV
    `entity_attribute_values` (row per `(attribute_id, entity_id)`,
    denormalized `entity_type`, polymorphic `entity_id` validated
    in-transaction per ADR/repo convention). Migration
    `0016_custom_attributes.sql`; runtime has DELETE only on the values
    table (wipe-and-rewrite).
  - DB: `createAttribute` slugifies key from label (or optional `key`
    input) → `undefined` on active-key conflict → 409; `entityType`/
    `key`/`type` immutable via PATCH; `listEntityAttributes` LEFT JOINs
    active definitions with current values; `setEntityAttributes`
    dedupes by attribute, validates every id against active defs of the
    entity type, validates value per definition type, then deletes +
    inserts atomically → `undefined` → 404 for any invalid ref/value.
  - API `routes/attributes.ts`: GET/POST `/attributes` (+`entityType`
    filter), PATCH/DELETE `/attributes/:id` (delete admin-only);
    `registerEntityAttributeRoutes` adds `GET|PUT
/{contacts,companies,deals}/:id/attributes` next to each entity
    module (mirrors `registerEntityTagRoutes`).
  - Web: `EntityAttributesCard` renders all active definitions for the
    entity type with type-matched inputs (text/number/date/checkbox/
    native select), single save → PUT replace of the whole value set;
    hidden when no definitions exist. `settings/attributes` groups
    definitions by entity with create (entity+label+type+options) /
    rename / options edit / admin delete; slug `key` shown read-only
    for API/agent consumers.
  - Tests: API 42/42 (definition CRUD 409/404/admin, entity GET/PUT
    all three types, 404s); DB RLS 9/9 (privileges + FORCE lists,
    scoping/refs/types/replace/isolation); web 11/11 (card render,
    disabled save, PUT payload).
  - Bug caught by tests: `EntityAttributesCard` called `.some` on a
    non-array `data` before the empty-state early return — guarded
    with `Array.isArray`.
- Checks (`feat/custom-attributes` dirty tree, 2026-09-18):
  `pnpm fmt:check` clean; `pnpm lint` 0/0; `pnpm typecheck` 6/6;
  `pnpm test` api 26 + web 11; `pnpm test:integration` api 42/42,
  database 24 (RLS 9 + migrate 5 + messaging 10); `pnpm build` 6/6.
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
- Testcontainer flakes fixed at the root: `57P01` unhandled errors were
  idle-client `error` events re-emitted by `pg.Pool` on container stop —
  `silencePoolErrors()` in `@maria/database/testing` covers every test pool
  (#86). Separately, the Vitest default `testTimeout` of 5s was too tight
  under CI CPU contention (mock-only `setup.test.ts` timed out on #85) —
  `test:integration`/`test:e2e` scripts now pass `--testTimeout=30000`.
  Third flake type seen on #88: `invitations.integration.test.ts`
  concurrent-accept raced to zero winners once in CI (passes locally);
  transient `pnpm audit` 503s also occur — rerun first, investigate
  only on repeat.
- `components.json` reports `"style": "base-nova"` — works; revisit if the CLI
  complains on future `add` runs.
- Raw `slate-*` classes were fully migrated to design tokens (`border-input`,
  `border-border`, `text-muted-foreground`, `text-foreground`, `bg-muted`,
  `divide-border`, `bg-black/40` scrim) — zero raw palette classes remain in
  `apps/web/src`.

## Deferred from the code-simplifier review

- **mime→kind mapping exists twice**: `attachmentContentType`
  (`routes/messaging.ts`) vs `mediaKindFromMime` (`channel-waha`). Opposite
  directions (outbound classify vs inbound normalize); consolidate in
  `@maria/messaging` only when a third use or shared direction appears.

## Next actions

1. Pick the next Phase 2 slice — candidates in order: operator work
   center (one actionable queue: unassigned, overdue tasks, failed
   sends, deals without next action), next action/follow-up, deal
   creation inside the conversation panel. Quick replies from 2.2 and
   the context panel from 2.3 seed the surfaces the future observer
   (ADR 0016) will read and annotate.
   Research is reorganized by theme under `research/` (local-only,
   gitignored): `competitive/` (feature inventory + monitoring-mode/UI
   study), `product/` (onboarding/roles — implemented), `sources/`,
   `evidence/`, plus `INDEX.md`. Directions adopted from the monitoring
   research are recorded as proposed ADRs **0016** (AI observation modes:
   `off → observe → suggest → auto`, read-only observer producing
   human-reviewed suggestions, `ai` queue + handback UX), **0017** (agent
   tool catalog: domains, `safe|attention|critical` risk, journey
   packages, per-agent ceiling, propose-then-confirm writes) and **0018**
   (every AI score/suggestion persists a written `rationale`; dual
   lead+human score is the observer's report).
2. Consolidated permission-matrix review after enough Phase 2
   functionality exists (route minimums continue to be set per slice).
3. Deferred alternative: attribute-based filtering in list views.
