# 0001 — Record decisions as ADRs

**Status:** accepted (2026-09-16, retrospective)

**Superseded:** 2026-09-16 by [ADR 0009](0009-development-contract-and-verification.md).

## Context

Decisions were being recorded only in PR descriptions and chat history. PRs are hard to
search and chat is ephemeral, so the rationale behind the stack and the security model was
invisible to anyone (or any agent) reading the repository cold.

## Decision

Keep a versioned `adr/` directory at the repository root. One file per decision, numbered
and immutable once accepted; corrections happen via a superseding ADR. `AGENTS.md` remains
the normative contract — ADRs explain _why_, AGENTS.md states _what must hold_.

## Consequences

- `AGENTS.md` §7 lists `adr/` as an essential contract.
- Stale decisions are expected to be caught by comparing ADRs with the code during review.
