# 0004 — Pipeline ordering, soft delete and drag-and-drop

**Status:** accepted (implemented in PR #25, extended in #27)

## Context

Kanban boards need cheap reordering. Alternatives: integer gaps (need renumbering),
floats (precision exhaustion), fractional indexing (orderable strings, Linear/Figma
pattern). Delete semantics needed to stay consistent with contacts/companies.

## Decision

- `position` columns are `fractional-indexing` keys; `POST /deals/:id/move` takes the
  `prevDealId`/`nextDealId` neighbors and the server generates the key between them.
- Soft delete (`deleted_at`) on pipelines, stages, deals — consistent with least
  privilege (`maria_runtime` has no `DELETE` grant).
- Deleting a stage or pipeline with active deals returns `409`, never cascades.
- **FK references are validated by scoped reads inside `withWorkspace`** — RLS does not
  validate cross-tenant references on writes, so stage/contact/company are read under the
  tenant context before insert/update/move.
- `@dnd-kit` for drag-and-drop (community standard for React Kanban).

## Consequences

- `updateDeal` validates only contact/company refs (pipeline/stage are immutable there) —
  split into `contactCompanyRefsValid` in PR #29.
- PATCH bodies declare `minProperties: 1` so empty updates are 400, not a Drizzle
  `.set({})` error.
- Stage rename/reorder UI remains deferred (HANDOFF).
