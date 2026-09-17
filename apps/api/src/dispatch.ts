import type { MessagingProvider } from "@maria/messaging";

export const DISPATCH_LEASE_MS = 60_000;

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
  /** Claim + send + settle a single intent. */
  dispatchIntent(workspaceId: string, intentId: string): Promise<void>;
  /** Claim + send every still-pending intent of the workspace. */
  dispatchPending(workspaceId: string): Promise<void>;
  /**
   * Workspace-scoped maintenance: expired leases become `unknown` and any
   * still-pending intents are claimed and sent. Safe to call lazily from
   * request handlers; never retries `unknown`/`dispatching` work.
   */
  maintainWorkspace(workspaceId: string): Promise<void>;
};

export function createDispatcher(deps: {
  database: DispatchDatabase;
  provider: MessagingProvider;
  leaseMs?: number;
  onError?: (error: unknown) => void;
}): Dispatcher {
  const leaseMs = deps.leaseMs ?? DISPATCH_LEASE_MS;
  const report = deps.onError ?? (() => {});

  async function dispatchIntent(workspaceId: string, intentId: string) {
    const claim = await deps.database
      .claimDispatchIntent(workspaceId, intentId, { leaseMs })
      .catch((error: unknown) => {
        report(error);
        return { kind: "missing" as const };
      });
    if (claim.kind !== "claimed") return;

    const result = await deps.provider
      .send({
        session: claim.session,
        to: claim.to,
        content: { type: "text", text: claim.body },
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
        attemptId: claim.attemptId,
        fencingToken: claim.fencingToken,
        outcome,
        ...(result.kind === "sent"
          ? { providerMessageId: result.providerMessageId }
          : {}),
        ...("reason" in result ? { error: result.reason } : {}),
      })
      .catch(report);
  }

  async function dispatchPending(workspaceId: string) {
    const pending = await deps.database
      .listPendingIntents(workspaceId)
      .catch((error: unknown) => {
        report(error);
        return [] as { id: string }[];
      });
    for (const intent of pending) {
      await dispatchIntent(workspaceId, intent.id);
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
