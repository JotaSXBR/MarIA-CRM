import { describe, expect, test, vi } from "vitest";
import type { MessagingProvider } from "@maria/messaging";
import {
  CHOREOGRAPHY,
  createDispatcher,
  DISPATCH_LEASE_MS,
} from "../src/dispatch.ts";

const workspaceId = "00000000-0000-4000-8000-000000000001";

function claimed(body: string, over: Record<string, unknown> = {}) {
  return {
    kind: "claimed" as const,
    attemptId: "attempt-1",
    fencingToken: "fence-1",
    messageId: "msg-1",
    body,
    to: "5511999999999@c.us",
    session: "sales",
    ...over,
  };
}

function createDb(over: Partial<Record<string, unknown>> = {}) {
  return {
    claimDispatchIntent: vi.fn(async () => claimed("hello")),
    settleDispatch: vi.fn(async () => ({ kind: "settled" as const })),
    reapExpiredDispatches: vi.fn(async () => ({ reaped: 0 })),
    listPendingIntents: vi.fn(async () => [] as { id: string }[]),
    ...over,
  };
}

function createProvider(over: Partial<MessagingProvider> = {}) {
  return {
    name: "waha",
    capabilities: {
      sendIdempotency: "none" as const,
      reconciliation: "webhook" as const,
      presenceSignals: true,
      readReceipts: true,
      lidResolution: true,
    },
    verifyWebhook: () => true,
    normalizeEvent: () => ({ kind: "unknown" as const }),
    send: vi.fn(async () => ({
      kind: "sent" as const,
      providerMessageId: "p-1",
    })),
    setPresence: vi.fn(async () => {}),
    sendSeen: vi.fn(async () => {}),
    ...over,
  } satisfies MessagingProvider;
}

const instant = async () => {};

describe("dispatch choreography (ADR 0013)", () => {
  test("runs seen → typing → paused → send in order", async () => {
    const order: string[] = [];
    const provider = createProvider({
      sendSeen: vi.fn(async () => {
        order.push("seen");
      }),
      setPresence: vi.fn(async (i) => {
        order.push(i.presence);
      }),
      send: vi.fn(async () => {
        order.push("send");
        return { kind: "sent" as const, providerMessageId: "p-1" };
      }),
    });
    const dispatcher = createDispatcher({
      database: createDb(),
      provider,
      sleep: instant,
      rng: () => 0.5,
    });
    await dispatcher.dispatchIntent(workspaceId, "intent-1");
    expect(order).toEqual([
      "online",
      "seen",
      "typing",
      "paused",
      "send",
      "offline",
    ]);
    expect(provider.setPresence).toHaveBeenCalledWith({
      session: "sales",
      chatId: "5511999999999@c.us",
      presence: "typing",
    });
    expect(provider.sendSeen).toHaveBeenCalledWith({
      session: "sales",
      chatId: "5511999999999@c.us",
    });
  });

  test("typing duration is proportional to text and clamped", async () => {
    const delays: number[] = [];
    const sleep = async (ms: number) => {
      delays.push(ms);
    };
    const provider = createProvider();
    const dispatcher = createDispatcher({
      database: createDb({
        claimDispatchIntent: vi.fn(async () => claimed("x".repeat(100))),
      }),
      provider,
      sleep,
      rng: () => 0.5,
    });
    // 100 chars → 7000ms base, jitter 1.0 → 7000.
    await dispatcher.dispatchIntent(workspaceId, "i");
    // delays: typing duration, pausedToSend
    expect(delays).toHaveLength(2);
    expect(delays[0]).toBe(7000);

    // Short text clamps to the minimum.
    delays.length = 0;
    const short = createDispatcher({
      database: createDb({
        claimDispatchIntent: vi.fn(async () => claimed("hi")),
      }),
      provider: createProvider(),
      sleep,
      rng: () => 0.5,
    });
    await short.dispatchIntent(workspaceId, "i");
    expect(delays[0]).toBe(CHOREOGRAPHY.typingMinMs);

    // Very long text clamps to the maximum.
    delays.length = 0;
    const long = createDispatcher({
      database: createDb({
        claimDispatchIntent: vi.fn(async () => claimed("x".repeat(1000))),
      }),
      provider: createProvider(),
      sleep,
      rng: () => 0.5,
    });
    await long.dispatchIntent(workspaceId, "i");
    expect(delays[0]).toBe(CHOREOGRAPHY.typingMaxMs);
  });

  test("dispatchPending wraps a burst in online → … → offline per session", async () => {
    const order: string[] = [];
    const provider = createProvider({
      setPresence: vi.fn(async (i) => {
        order.push(i.chatId ? i.presence : `global:${i.presence}`);
      }),
      send: vi.fn(async () => {
        order.push("send");
        return { kind: "sent" as const, providerMessageId: "p-1" };
      }),
    });
    const db = createDb();
    db.listPendingIntents
      .mockResolvedValueOnce([{ id: "a" }, { id: "b" }])
      .mockResolvedValue([]);
    const dispatcher = createDispatcher({
      database: db,
      provider,
      sleep: instant,
      rng: () => 0.5,
    });
    await dispatcher.dispatchPending(workspaceId);
    expect(order[0]).toBe("global:online");
    expect(order[order.length - 1]).toBe("global:offline");
    expect(order.filter((s) => s === "send")).toHaveLength(2);
    // Global online is sent once per session, not per message.
    expect(order.filter((s) => s === "global:online")).toHaveLength(1);
  });

  test("providers without presence capabilities send immediately", async () => {
    const provider = createProvider({
      capabilities: {
        sendIdempotency: "none",
        reconciliation: "webhook",
        presenceSignals: false,
        readReceipts: false,
        lidResolution: false,
      },
    });
    const sleep = vi.fn(instant);
    const dispatcher = createDispatcher({
      database: createDb(),
      provider,
      sleep,
    });
    await dispatcher.dispatchIntent(workspaceId, "i");
    expect(provider.setPresence).not.toHaveBeenCalled();
    expect(provider.sendSeen).not.toHaveBeenCalled();
    expect(sleep).not.toHaveBeenCalled();
    expect(provider.send).toHaveBeenCalled();
  });

  test("presence or seen failure never blocks the send", async () => {
    const provider = createProvider({
      setPresence: vi.fn(async () => {
        throw new Error("presence down");
      }),
      sendSeen: vi.fn(async () => {
        throw new Error("seen down");
      }),
    });
    const dispatcher = createDispatcher({
      database: createDb(),
      provider,
      sleep: instant,
      onError: () => {},
    });
    await dispatcher.dispatchIntent(workspaceId, "i");
    expect(provider.send).toHaveBeenCalled();
  });

  test("concurrent drains for the same workspace join the running one", async () => {
    const db = createDb();
    db.listPendingIntents
      .mockResolvedValueOnce([{ id: "a" }])
      .mockResolvedValue([]);
    const dispatcher = createDispatcher({
      database: db,
      provider: createProvider(),
      sleep: instant,
    });
    await Promise.all([
      dispatcher.dispatchPending(workspaceId),
      dispatcher.dispatchPending(workspaceId),
    ]);
    // The second call joined the first drain instead of double-claiming.
    expect(db.claimDispatchIntent).toHaveBeenCalledTimes(1);
  });

  test("send outcomes keep ADR 0010 classification", async () => {
    for (const [kind, outcome] of [
      ["rejected", "failed"],
      ["blocked", "failed"],
      ["unknown", "unknown"],
    ] as const) {
      const db = createDb();
      const provider = createProvider({
        capabilities: {
          sendIdempotency: "none",
          reconciliation: "webhook",
          presenceSignals: false,
          readReceipts: false,
          lidResolution: false,
        },
        send: vi.fn(async () => ({ kind, reason: "r" })),
      });
      const dispatcher = createDispatcher({ database: db, provider });
      await dispatcher.dispatchIntent(workspaceId, "i");
      expect(db.settleDispatch).toHaveBeenCalledWith(
        workspaceId,
        expect.objectContaining({ outcome }),
      );
    }
  });

  test("claim honour the lease and skips non-claimed intents", async () => {
    const db = createDb({
      claimDispatchIntent: vi.fn(
        async (_w: string, _i: string, o: { leaseMs: number }) => {
          expect(o.leaseMs).toBe(DISPATCH_LEASE_MS);
          return { kind: "notPending" as const, status: "sent" };
        },
      ),
    });
    const provider = createProvider();
    const dispatcher = createDispatcher({ database: db, provider });
    await dispatcher.dispatchIntent(workspaceId, "i");
    expect(provider.send).not.toHaveBeenCalled();
  });
});
