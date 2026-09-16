# 0010 — Recoverable messaging effects and webhook identity

**Status:** accepted (2026-09-16; supersedes ADR 0008)
**Implementation:** planned; no messaging worker, outbox or provider adapter is implemented yet.

## Context

ADR 0008 established the provider port, raw-body signature verification and message/conversation
model. A local receipt cannot prove a network request was not accepted before a process crashed.
Also, a message identifier is not an event identifier: one message can have multiple delivery
statuses. Deduplication alone does not resolve out-of-order status transitions.

## Decision

Retain ADR 0008's package boundaries, raw-byte authenticity verification before parsing, tenant
RLS, media port and normalized inbound flow, subject to these corrected reliability contracts:

1. Commit the outbound message, outbox intent and unique effect identity in one transaction.
   The identity includes channel instance and logical message ID and is stable across attempts.
2. Persist `pending -> dispatching` with a unique attempt ID and lease/fencing token before
   calling a provider. Claims are atomic; completion updates must match the current attempt.
   Network calls remain outside database transactions.
3. Confirmed success atomically persists provider message ID, message status and effect receipt
   as `succeeded`. A duplicate claimed/completed intent must not cause a second logical send.
4. A timeout, lost response or expired dispatch lease becomes `unknown`, not automatically
   `pending`. The remote provider may have accepted the message. Retry using the same key only
   when that provider's pinned contract proves deduplication for the applicable retention window.
5. Reconcile `unknown` through provider lookup or a correlated authenticated webhook when supported.
   A proven rejection before acceptance may become `retryable` (bounded attempts/backoff) or
   `failed`. Without reliable deduplication/reconciliation, block for operator resolution and audit
   it. Never promise exactly-once delivery from a local ledger alone or silently resend an unknown.
6. Adapter capabilities must describe send idempotency support/window, reconciliation and error
   classification. Verify these against the selected provider release and contract fixtures before
   enabling outbound sends; ADR 0008's provider details are historical assumptions, not certification.
7. Webhook event dedup uses a provider-specific stable event identity scoped by channel instance.
   Message ID identifies the message, not every status event. For providers without event IDs,
   define and test a canonical event fingerprint including event kind and provider status/version.
   Delivery-request IDs are not assumed stable across retries. A batch can contain multiple events.
8. Store event processing independently of message identity. Apply a defined delivery-status state
   machine using provider event time/version when available so late events cannot regress confirmed
   state; retain contradictory/unknown observations for reconciliation. Dedup uniques alone do not
   enforce ordering. Include `channel_instance_id` in messages if it participates in their unique key.
9. Atomically validate epoch when committing AI intent and when claiming dispatch. Human takeover
   increments epoch and cancels stale queued intents. In-flight/accepted external sends are audited
   as such; a later epoch change cannot revoke a provider-accepted request.

## Consequences and acceptance checks

Before outbound rollout, inject failures before dispatch, after acceptance/before receipt, during
receipt commit and on lease expiry. Run concurrent claimers, duplicate webhooks, out-of-order status
events and takeover-versus-dispatch tests. Prove completed work is not resent and unknown outcomes
stay blocked unless safe recovery is established. Test tenant isolation for all new tables.

Both WAHA and Meta adapters remain required by the baseline. Inbound slices may land first, but
outbound functionality must remain unavailable until each enabled adapter meets this contract.

The alternative of blindly retrying every expired lease is rejected because it duplicates external
effects. Holding a DB transaction open across network I/O does not solve the two-system commit gap.
