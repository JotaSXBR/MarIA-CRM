---
name: task-observer
description: Captures high-signal, generalizable corrections to MarIA CRM agent workflows and repository skills. Use only when the user explicitly asks to record or review skill observations, corrects a recurring working method, a loaded skill causes a reusable process failure, or the same methodological friction recurs in the session. Do not invoke for routine coding, ordinary bugs, one-off product decisions, or at every task or session.
permissions:
  deny:
    - exec
    - Write(.devin/skills/**)
---

# Task observer

A deliberately low-overhead adaptation of Eoghan Henn's Task Observer methodology for MarIA CRM. `AGENTS.md` and explicit user instructions always take precedence.

## Activation boundary

Invoke only for a strong signal named in the description. Do not run a session-start protocol, scan on every skill load, create empty checkpoints, count completed todos, schedule reviews, or add hooks. Never delay the user's task merely to observe it.

Record an observation only when all are true:

1. The lesson would improve another task using the same skill or workflow.
2. There is evidence it may recur: a user correction, a loaded skill's process failure, or repeated friction.
3. The lesson suggests a concrete instruction, trigger, boundary, or workflow change.

Do not record routine implementation defects, temporary environment failures, preferences already documented, isolated style choices, product decisions, or speculative improvements without evidence.

## Safety and confidentiality

Write only a sanitized methodology summary. Never record secrets, credentials, personal data, customer content, production values, private prompts, raw payloads, vulnerability details, or hidden reasoning. Remove names, domains, identifiers, and business data. If the lesson cannot remain useful after sanitization, do not log it.

Observations are advisory. Never modify `AGENTS.md`, `HANDOFF.md`, product files, existing skills, permissions, or hooks from this skill. Never publish an observation externally.

## Storage

On the first real observation only, create `.devin/task-observer/observations/`. This local directory is gitignored. Do not create it when there is nothing to record.

Before writing, search only that directory for a substantively equivalent open observation. Update the existing record when appropriate; otherwise create `YYYY-MM-DD-HHMM-short-slug.md` with:

```markdown
---
status: open
date: YYYY-MM-DD
skills:
  - affected-skill
---

# Concise title

## Evidence

- Sanitized, concrete evidence of recurring workflow friction.

## Recommendation

A small, testable change to the affected skill or workflow.
```

Keep each record under 250 words. Do not maintain counters, aggregate indexes, principles files, checkpoints, archives, or staging trees.

## Review and application

Review observations only when the user explicitly asks. Read open records, group duplicates, and present concise proposed dispositions: apply, decline, or needs input. Do not edit a skill until the user approves that specific change.

After approval, use `skill-creator` to modify and evaluate the affected skill through the repository's normal branch, review, verification, and PR workflow. Then set the observation status to `actioned` or `declined` and add a one-line resolution. There is no autonomous or scheduled review mode.

## Communication

When an observation is written, mention its title once in the next natural progress update. If none is written, say nothing about observation bookkeeping.
