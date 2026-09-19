# 0017 — Agent tool catalog: domains, risk levels, packages

**Status:** proposed (2026-09-19)

Direction set from the deskcomm-crm MCP catalog (62 tools, 9 domains — code
inspected) and Helena's "Ações disponíveis" panel (screenshot analysis). The
catalog itself lands with the Execution Plane (Phase 4); this ADR fixes the
shape so earlier slices do not paint us into a corner.

## Context

An agent is only as good as its tools, but raw tool lists do not scale:
~60 checkboxes overwhelm the human configuring the agent, and ~60 tool
descriptions in the prompt degrade model performance. Both independent
references converge on the same answer — group tools by domain and gate
dangerous ones behind explicit opt-in.

## Decision

1. **Catalog metadata per tool:** `domain` (atendimento, funil, agenda,
   retenção, operação, …), `risk` ∈ `safe | attention | critical`, and
   `packages` (journey bundles such as `atender`, `vender`, `reter`,
   `escalar`, `organizar`, `evoluir`).
   - `safe` = read-only under RLS.
   - `attention` = mutates data but is reversible.
   - `critical` = irreversible or customer-facing (e.g., sending a message).
2. **Critical tools are never enabled by a package** — each requires
   individual explicit opt-in by a workspace admin.
3. **Per-agent tool ceiling** (~20–25): a performance limit for the model,
   not an arbitrary cap. Packages exist so a non-technical admin reaches a
   working set without touching 60 toggles.
4. **Propose-then-confirm writes.** Tools that would write customer data can
   ship a `propose_*` variant (e.g., `propose_contact_field`) that lands in
   the human review queue instead of the record — same surface as ADR 0016
   suggestions.
5. **Improvement proposals are read-only for the agent.** The agent may list
   and draft proposals; only humans approve them.
6. **Two text surfaces per tool:** human-facing label/explanation for the
   admin UI vs. a single model-facing `description` authored at the handler.
   Divergent copies are a documented failure mode (deskcomm removed a
   duplicated copy after 48/51 drifted).

## Consequences

- The catalog is data, not code: a `tools` registry table drives both the
  admin UI (grouped checkboxes, risk badges) and the agent's toolset.
- Policy enforcement keying on `risk` gives the PolicyEngine (§4.6) a
  natural authorization boundary.
- The packages model maps to the workspace UI Helena and Synthor users
  already know — no flow-builder canvas required (rejected: implementation
  cost vs. our declarative model).

## Evidence

- deskcomm `lib/mcp/tools/catalogo/`: 62 tools, 9 domains, `risco`
  3-level enum, `pacotes` bundles, `critico` excluded from packages,
  per-agent ceiling raised 20→25 with rationale comments.
- Helena flow builder: right-hand panel "Ações disponíveis" groups the same
  domains (Mensagem, Contato, Atendimento, CRM, Tempo, Fluxo) — convergent
  market validation.
