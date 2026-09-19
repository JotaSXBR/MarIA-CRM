# 0018 — AI output carries rationale

**Status:** proposed (2026-09-19)

Direction set from Selliq's Score Duplo (screenshot analysis, local
`research/` notes). Implementation rides with the observer (ADR 0016) and
any later scoring surface.

## Context

AI scores and suggestions that arrive as bare numbers or text earn no trust:
a manager cannot tell why a lead scored 72 or whether an attendant's 80 is
fair. Selliq's implementation shows the correction — each score ships with a
written justification citing concrete evidence ("initial response took 24h;
most replies within 5–15 min").

This is also an internal-consistency requirement: AGENTS.md §4.3 already
forbids persisting hidden chain-of-thought. A bounded, human-readable
rationale is the auditable middle ground between a bare number and private
reasoning.

## Decision

1. **Every AI-produced score or suggestion persists a `rationale` text**
   written for the human reviewer, citing the evidence that drove it. No
   score without rationale reaches the UI.
2. **Dual score as the monitoring output:** lead qualification score and
   human service-quality score, each with its own rationale — the observer's
   per-conversation report (ADR 0016 `observe` mode) is built from these.
3. **Rationale is data, not prose-in-prompt:** stored alongside the
   suggestion/score row, shown verbatim in the review UI, and preserved in
   the audit trail when a human accepts/rejects.
4. **No chain-of-thought.** Rationale summarizes conclusions and evidence;
   private reasoning stays out of durable state (§4.3 unchanged).

## Consequences

- `agent_suggestions` (or equivalent schema) needs a `rationale` field from
  day one — retrofitting explanation is harder than building it in.
- The review UI renders rationale first, score second; acceptance metrics
  can then correlate rationale quality with human trust.
- Eval/golden-candidate pipelines (deskcomm `flywheel/`) can grade
  rationales, not just outcomes.

## Evidence

- Selliq Score Duplo screenshot: two scored bars, each followed by a
  multi-sentence written justification citing response-time evidence.
- AGENTS.md §4.3: durable state holds "safe summaries", never hidden
  chain-of-thought.
