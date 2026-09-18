# MarIA CRM product roadmap

**Status:** living product direction · **Updated:** 2026-09-18

This roadmap records the current development sequence. It is not a fixed feature promise.
Each implementation slice ends with a product and architecture review before the next slice is
selected. Accepted ADRs and the repository engineering contract take precedence when details
conflict.

## Product direction

MarIA evolves first as a secure and useful CRM for human operators. Future AI agents will use the
same workspace-scoped contracts, but machine autonomy is the final development movement, after the
human workflows and Execution Plane foundations are proven.

External CRM projects provide product and UX evidence, not replacement architecture. MarIA adapts
the strongest ideas to its React/Vite/TanStack frontend, Fastify API, PostgreSQL/RLS tenancy,
durable effects and Docker-first deployment model. Authentication, authorization, tenant scoping,
migrations, retries and provider semantics remain governed by local contracts and ADRs.

## Slice lifecycle

Every non-trivial slice follows the same decision loop:

1. **Define the human problem.** Identify the operator, the task to complete and the friction to
   remove.
2. **Inspect local contracts first.** Reuse existing domain, API, UI and test patterns before adding
   abstractions or dependencies.
3. **Research narrowly.** Compare a small maintained shortlist and classify each pattern as
   `adapt`, `UX only` or `reject`; verify license and provenance.
4. **Translate to MarIA.** Preserve workspace authorization, RLS, PostgreSQL durability, Fastify
   validation and the established web contracts.
5. **Specify the smallest vertical slice.** Define behavior, authorization, persistence, API, UI,
   empty/error/loading states, accessibility, tests and visual acceptance criteria.
6. **Implement and verify.** Test critical rules and tenant isolation, inspect browser behavior,
   simplify the scoped diff and record evidence in the PR.
7. **Reassess.** Decide whether the result needs refinement or whether another candidate now has
   higher product value. The next numbered slice is selected only at this checkpoint.

## Phase 1 — Access foundation and onboarding

Goal: a fresh installation can securely create its master administrator, first workspace and human
team before entering the CRM.

1. **Centralize workspace RBAC.** Add the ranked `viewer < agent < manager < admin` model, migrate
   `member` to `agent`, introduce `ROLE_RANK` and `requireWorkspaceRole`, and remove inline role
   comparisons. Preserve the rule that the platform administrator administers but does not operate
   without workspace membership.
2. **Add visual first-run setup.** Detect an empty installation, gate the application behind
   `/setup`, and atomically create the master administrator, default organization and first
   workspace using the ADR 0015 setup-token and advisory-lock invariants.
3. **Add invitation links without SMTP.** Create expiring, hashed, workspace-scoped invitations;
   show the plaintext link once; and atomically create or attach the accepting user.
4. **Delegate membership administration.** Add member listing, invitation, role change, suspension
   or removal under rank and last-admin invariants.
5. **Add workspace onboarding.** Drive business basics, WhatsApp connection, team invitation and
   review from one persisted step registry, hiding steps that do not apply.

The next implementation slice is Phase 1.1, central workspace RBAC. ADR 0015 is its accepted design
boundary; the implementation PR must settle the exact route capability table and migration/test
surface before editing production code.

## Phase 2 — Human operator workflow

Goal: make the inbox and CRM a coherent daily workspace instead of disconnected records.

Candidate sequence, reassessed after every slice:

1. Conversation ownership and queues: assigned, unassigned and "mine", with assignment history and
   the first practical application of `all | own_and_unassigned | own` scope.
2. Conversation collaboration: internal notes, quick replies and clear responsibility/state
   indicators.
3. Conversation-to-CRM links: create or attach contacts, companies, deals and tasks without
   duplicating business data.
4. Operator work center: one actionable queue for unassigned conversations, overdue tasks,
   unanswered messages, deals without a next action and failed or blocked sends.
5. Next action and follow-up: explicit owner/date, reminders, silence/risk state and manual
   reactivation before generic automation.

## Phase 3 — CRM maturity

Goal: expand proven human workflows according to observed product value.

The candidate backlog includes saved views, import/export, products and services, generated
proposals, scheduling and availability, targeted automations, inbound/outbound webhooks, operational
metrics, LGPD export/anonymization and additional communication channels. Inclusion and order are
not commitments; each capability requires its own research and slice decision.

## Phase 4 — AI agents

Goal: introduce governed machine assistance only after human workflows and the Execution Plane are
ready.

The intended progression is:

1. AI prepares drafts or recommendations for a human.
2. A human approves effects before execution.
3. AI executes narrowly scoped, policy-checked and audited tools.
4. Durable runs, effect receipts, costs, alerts and anti-stale human takeover protect operation.
5. Autonomy increases only through explicit product and security decisions.

AI-specific onboarding, `/setup-mariacrm`, machine identities, agent tools and autonomous workflows
remain out of scope until this phase. Earlier phases should expose reusable workspace-scoped domain
contracts, not speculative AI abstractions.

## Decision criteria

At every reassessment, prefer the candidate that best combines:

- direct value and reduced friction for the human operator;
- prerequisite value for later workflows;
- a small, reversible and testable vertical scope;
- preservation of tenant, authorization and durability invariants;
- reuse of existing MarIA contracts without premature infrastructure;
- observable behavior and clear acceptance criteria;
- future tool reuse without granting AI special privilege paths.
