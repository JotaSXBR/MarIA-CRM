import type { MessagingProvider } from "@maria/messaging";

export const DISPATCH_LEASE_MS = 60_000;

/**
 * ADR 0013 humanization windows (ms), aligned to WAHA's official "How to
 * Avoid Blocking" sequence: seen → typing (random wait proportional to the
 * message) → stop-typing (`paused`) → send, with `offline` once at the end
 * of the burst. Each value is drawn from U(min, max); `rng` is injectable.
 */
export const CHOREOGRAPHY = {
  /** Typing duration per character, clamped to [min,max] ms. */
  typingPerCharMs: 70,
  typingMinMs: 1500,
  typingMaxMs: 8000,
  /** Jitter applied to the computed typing duration. */
  typingJitter: { min: 0.9, max: 1.1 },
  /** Beat between `paused` and the send, mirroring real client latency. */
  pausedToSend: { min: 200, max: 600 },
  /** Gap between consecutive sends in a burst. */
  betweenSends: { min: 1000, max: 3000 },
} as const;

type DispatchDatabase = {
  claimDispatchIntent(
    workspaceId: string,
    intentId: string,
    options: { leaseMs: number },
  ): Promise<
    | { kind: "missing" }
    | { kind: "notPending"; status: string }
    | { kind: "stale" }
    | { kind: "failed"; reason: string }
    | {
        kind: "claimed";
        attemptId: string;
        fencingToken: string;
        messageId: string;
        body: string;
        to: string;
        session: string;
      }
  >;
  settleDispatch(
    workspaceId: string,
    input: {
      intentId: string;
      attemptId: string;
      fencingToken: string;
      outcome: "succeeded" | "unknown" | "failed";
      providerMessageId?: string;
      error?: string;
    },
  ): Promise<{ kind: "missing" } | { kind: "stale" } | { kind: "settled" }>;
  reapExpiredDispatches(workspaceId: string): Promise<{ reaped: number }>;
  listPendingIntents(
    workspaceId: string,
    limit?: number,
  ): Promise<{ id: string }[]>;
};

export type Dispatcher = {
  /**
   * Full single-send flow: claim → online → chat choreography → send →
   * settle → offline. `dispatchPending` is preferred for bursts.
   */
  dispatchIntent(workspaceId: string, intentId: string): Promise<void>;
  /**
   * Drain every still-pending intent of the workspace as one presence burst:
   * online once, per-message chat choreography, offline at the end. Re-lists
   * until the queue is empty; concurrent calls for the same workspace join
   * the already-running drain instead of racing it.
   */
  dispatchPending(workspaceId: string): Promise<void>;
  /**
   * Workspace-scoped maintenance: expired leases become `unknown` and any
   * still-pending intents are claimed and sent. Safe to call lazily from
   * request handlers; never retries `unknown`/`dispatching` work.
   */
  maintainWorkspace(workspaceId: string): Promise<void>;
};

const MAX_DRAIN_ROUNDS = 10;

export function createDispatcher(deps: {
  database: DispatchDatabase;
  provider: MessagingProvider;
  leaseMs?: number;
  /** Injectable delay — tests pass a no-op to keep choreography instant. */
  sleep?: (ms: number) => Promise<void>;
  /** Injectable randomness for humanization jitter (default Math.random). */
  rng?: () => number;
  onError?: (error: unknown) => void;
}): Dispatcher {
  const leaseMs = deps.leaseMs ?? DISPATCH_LEASE_MS;
  const report = deps.onError ?? (() => {});
  const sleep =
    deps.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));
  const rng = deps.rng ?? Math.random;
  const running = new Set<string>();

  const jitter = (range: { min: number; max: number }) =>
    Math.round(range.min + rng() * (range.max - range.min));

  function typingDurationMs(text: string): number {
    const base = Math.min(
      Math.max(
        text.length * CHOREOGRAPHY.typingPerCharMs,
        CHOREOGRAPHY.typingMinMs,
      ),
      CHOREOGRAPHY.typingMaxMs,
    );
    return Math.round(
      base *
        (CHOREOGRAPHY.typingJitter.min +
          rng() *
            (CHOREOGRAPHY.typingJitter.max - CHOREOGRAPHY.typingJitter.min)),
    );
  }

  // Presence/seen are best-effort UX signals (ADR 0013): failures are
  // reported but never fail or block the send itself.
  async function presence(
    session: string,
    state: "online" | "offline" | "typing" | "recording" | "paused",
    chatId?: string,
  ): Promise<void> {
    if (!deps.provider.capabilities.presenceSignals) return;
    if (!deps.provider.setPresence) return;
    await deps.provider
      .setPresence({
        session,
        presence: state,
        ...(chatId ? { chatId } : {}),
      })
      .catch(report);
  }

  async function sendSeen(session: string, chatId: string): Promise<void> {
    if (!deps.provider.capabilities.readReceipts) return;
    if (!deps.provider.sendSeen) return;
    await deps.provider.sendSeen({ session, chatId }).catch(report);
  }

  type Claimed = Extract<
    Awaited<ReturnType<DispatchDatabase["claimDispatchIntent"]>>,
    { kind: "claimed" }
  >;

  async function claim(
    workspaceId: string,
    intentId: string,
  ): Promise<Claimed | undefined> {
    const result = await deps.database
      .claimDispatchIntent(workspaceId, intentId, { leaseMs })
      .catch((error: unknown) => {
        report(error);
        return { kind: "missing" as const };
      });
    return result.kind === "claimed" ? result : undefined;
  }

  /**
   * Chat-scoped choreography around the send (ADR 0013): seen → typing for a
   * duration proportional to the text → paused → send → settle. Global
   * online/offline belongs to the burst caller.
   */
  async function sendClaimed(
    workspaceId: string,
    intentId: string,
    c: Claimed,
  ) {
    const humanize = deps.provider.capabilities.presenceSignals;
    if (humanize) {
      await sendSeen(c.session, c.to);
      await presence(c.session, "typing", c.to);
      await sleep(typingDurationMs(c.body));
      await presence(c.session, "paused", c.to);
      await sleep(jitter(CHOREOGRAPHY.pausedToSend));
    }

    const result = await deps.provider
      .send({
        session: c.session,
        to: c.to,
        content: { type: "text", text: c.body },
      })
      .catch((error: unknown) => ({
        kind: "unknown" as const,
        reason: error instanceof Error ? error.message : String(error),
      }));

    const outcome =
      result.kind === "sent"
        ? "succeeded"
        : result.kind === "rejected" || result.kind === "blocked"
          ? "failed"
          : "unknown";
    await deps.database
      .settleDispatch(workspaceId, {
        intentId,
        attemptId: c.attemptId,
        fencingToken: c.fencingToken,
        outcome,
        ...(result.kind === "sent"
          ? { providerMessageId: result.providerMessageId }
          : {}),
        ...("reason" in result ? { error: result.reason } : {}),
      })
      .catch(report);
  }

  async function dispatchIntent(workspaceId: string, intentId: string) {
    const claimed = await claim(workspaceId, intentId);
    if (!claimed) return;
    await presence(claimed.session, "online");
    await sendClaimed(workspaceId, intentId, claimed);
    await presence(claimed.session, "offline");
  }

  async function dispatchPending(workspaceId: string) {
    // Concurrent drains for the same workspace would interleave online/offline
    // presence — join the running one; it re-lists until the queue is empty.
    if (running.has(workspaceId)) return;
    running.add(workspaceId);
    const sessionsTouched = new Set<string>();
    try {
      for (let round = 0; round < MAX_DRAIN_ROUNDS; round++) {
        const pending = await deps.database
          .listPendingIntents(workspaceId)
          .catch((error: unknown) => {
            report(error);
            return [] as { id: string }[];
          });
        if (pending.length === 0) return;
        for (const intent of pending) {
          const claimed = await claim(workspaceId, intent.id);
          if (!claimed) continue;
          if (!sessionsTouched.has(claimed.session)) {
            sessionsTouched.add(claimed.session);
            await presence(claimed.session, "online");
          }
          await sendClaimed(workspaceId, intent.id, claimed);
          await sleep(jitter(CHOREOGRAPHY.betweenSends));
        }
      }
    } finally {
      // `offline` at the end of the burst — WhatsApp suppresses push
      // notifications on the handset while a web client is online (ADR 0013).
      for (const session of sessionsTouched) {
        await presence(session, "offline");
      }
      running.delete(workspaceId);
    }
  }

  return {
    dispatchIntent,
    dispatchPending,
    async maintainWorkspace(workspaceId: string) {
      await deps.database.reapExpiredDispatches(workspaceId).catch(report);
      await dispatchPending(workspaceId);
    },
  };
}
