# 0014 — Custom attributes: typed definitions + EAV values

**Status:** accepted (implemented in PR #71)

## Context

Contacts, companies and deals need workspace-defined attributes beyond the fixed
columns (e.g. "segment", "contract value", "renewal date"). Two candidate models:

- **JSONB blob on each entity** (Chatwoot-style: `contacts.custom_attributes`
  key→value map + a definitions table). One read, no joins — but values are
  opaque to relational constraints, per-attribute filtering requires JSONB
  operators, and a polymorphic shape drifts silently.
- **Typed definitions + EAV value rows**: `attribute_definitions` describes
  workspace attributes (`entity_type`, stable `key`, `label`, `type`,
  `options`); `entity_attribute_values` stores one row per
  (attribute, entity). Consistent with the tags model (PR #69) and the repo
  convention that cross-references are validated by scoped reads inside
  `withWorkspace`, not by FKs alone — `entity_id` is intentionally
  polymorphic and has no FK.

## Decision

- `attribute_definitions`: `entity_type` ∈ contact|company|deal; `key` is a
  slug derived from the label (or an optional client-supplied slug), immutable
  after creation; `type` ∈ text|number|date|boolean|select; `options` holds
  select choices. Partial unique `(workspace_id, entity_type, key)` on active
  rows; soft delete.
- `entity_attribute_values`: one row per `(attribute_id, entity_id)`;
  `entity_type` is denormalized onto the row so wipe-and-rewrite can target a
  single entity. `value` is JSONB scalar validated per definition type in the
  scoped transaction.
- `PUT /{contacts,companies,deals}/:id/attributes` replaces the whole value
  set atomically (same wipe-and-rewrite semantics as entity tags): every
  referenced attribute must be an active definition of the workspace and the
  matching `entity_type`; `entity_type`/`key`/`type` are immutable after
  creation so existing values cannot be silently reinterpreted.
- Definition delete is soft + admin-gated, consistent with tags; orphaned
  value rows stay invisible because list queries join only active
  definitions.

## Consequences

- Agents/API consumers can filter entities by attribute via
  `attribute_id`/`value` predicates; a JSONB blob would need GIN indexes and
  untyped paths.
- No per-attribute DB-level type check exists — validation lives in the
  scoped transaction (unknown attribute or wrong-typed value → `undefined` →
  404), consistent with the tags precedent. Richer error codes are deferred.
- `entity_id` polymorphism is validated in-transaction per `entity_type`;
  adding attributes to new entity kinds extends the enum, not the schema.
