# 0016 — AI observation modes (monitoring mode)

**Status:** proposed (2026-09-19)

Direction set from competitive research (local `research/` notes, 2026-09-19:
Selliq "Modo Monitoramento", Synthor inbox, Helena flows) and the existing
"humans first, AI last" sequencing. Implementation is planned for Phase 4;
Phase 2 slices only prepare the surfaces it consumes.

## Context

The roadmap defers autonomous AI until the Execution Plane exists. Research
shows the market's lowest-risk entry point is not autonomy but **passive
observation**: the CRM operates with AI agents switched off while an observer
learns from conversations and proposes improvements a human accepts or
rejects (Selliq ships this as its entry product). This delivers value without
requiring durable runs, tool policies or outbound effects.

Our current state already provides the substrate: workspace RLS makes a
read-only observer safe by construction; conversation ownership and
assignment history (Phase 2.1) supply the telemetry the observer scores.

## Decision

1. **Per-workspace AI mode ladder:** `off → observe → suggest → auto`.
   `observe` is read-only: it consumes conversation/CRM events and produces
   `agent_suggestions` (knowledge-base entries, quick replies, field
   proposals) that humans accept or reject with feedback. `suggest` surfaces
   drafts inline (composer copilot). `auto` remains gated by ADR-level
   policy, effect ledger and epoch checks (AGENTS.md §4.3–4.5).
2. **No silent writes.** The observer never mutates business data; every
   output is a proposal in a review queue. Accept/reject outcomes are
   recorded as feedback and become training/eval signal.
3. **Inbox queue extension.** The conversation queue filter (`all | mine |
unassigned`, Phase 2.1) extends with `ai` for conversations currently held
   by an agent, and the conversation header gains an explicit
   "return to AI" handback action — mirroring the human-takeover epoch bump
   in the opposite direction.
4. **Sequencing.** Human-facing slices land first and are independently
   useful: pendings/telemetry dashboard, editable knowledge base, quick
   replies. The observer then reuses the same tables and review UI.

## Consequences

- Phase 4 gains a shippable first step that needs no Execution Plane: the
  observer can start batch/nightly and read through RLS-scoped queries.
- `agent_suggestions` (or equivalent) becomes the contract between passive
  analysis and human approval; the same review surface later approves
  `suggest`-mode drafts.
- The `ai` queue value is reserved in the queue-filter contract so the enum
  extension stays backward compatible.
- Nothing here authorizes autonomous outbound effects; `auto` still requires
  the invariants of §4.3–4.5 and a separate implementation ADR.

## Evidence

- Selliq ships "IA configurada mas desligada" as the entry product, with a
  per-assistant analytics page as the monitoring report.
- Synthor implements the ladder in UX: composer tab `Copilot Sugestão`,
  queue tab `AI`, and a `Devolver à AI` handback button.
- deskcomm-crm ships `crm_list_improvement_proposals` as a read-only tool —
  "the AI does not approve its own improvement".
