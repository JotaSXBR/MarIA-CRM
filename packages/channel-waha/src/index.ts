/// <reference types="node" />
import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  InboundEvent,
  MessagingProvider,
  ProviderCapabilities,
  SendInput,
  SendResult,
  WebhookVerification,
} from "@maria/messaging";

export const wahaProviderName = "waha";

export type WahaProviderConfig = {
  /** Base URL of the WAHA HTTP server, e.g. `http://waha:3000`. */
  baseUrl?: string;
  /** Optional `X-Api-Key` credential for the WAHA HTTP API. */
  apiKey?: string;
  /** Timeout for provider calls in milliseconds (default 15s). */
  timeoutMs?: number;
  /** Injectable fetch for tests. */
  fetchImpl?: typeof fetch;
};

const wahaCapabilities: ProviderCapabilities = {
  // WAHA does not deduplicate sends by a caller key: a timed-out send is
  // ambiguous and must stay `unknown` until reconciled (ADR 0010 §4-5).
  sendIdempotency: "none",
  // Delivery state reconciles through authenticated `message.ack` webhooks.
  reconciliation: "webhook",
};

export function createWahaProvider(
  config: WahaProviderConfig = {},
): MessagingProvider {
  const fetchImpl = config.fetchImpl ?? fetch;
  const timeoutMs = config.timeoutMs ?? 15_000;
  const baseUrl = config.baseUrl?.replace(/\/+$/, "");

  async function send(input: SendInput): Promise<SendResult> {
    if (!baseUrl) {
      return { kind: "blocked", reason: "waha base url not configured" };
    }
    let response: Response;
    try {
      response = await fetchImpl(`${baseUrl}/api/sendText`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          ...(config.apiKey ? { "x-api-key": config.apiKey } : {}),
        },
        body: JSON.stringify({
          session: input.session,
          chatId: input.to,
          text: input.content.text,
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      // Network failure, abort or timeout: the provider may have accepted.
      return {
        kind: "unknown",
        reason: error instanceof Error ? error.message : String(error),
      };
    }
    if (response.ok) {
      const body = (await response.json().catch(() => null)) as unknown;
      const providerMessageId = extractMessageId(
        isRecord(body) ? body.id : undefined,
      );
      return providerMessageId
        ? { kind: "sent", providerMessageId }
        : {
            kind: "unknown",
            reason: "waha returned 2xx without a message id",
          };
    }
    // 4xx rejects before acceptance; ambiguous 5xx stays unknown (ADR 0010).
    const detail = await response.text().catch(() => "");
    if (response.status >= 500) {
      return {
        kind: "unknown",
        reason: `waha ${response.status}: ${detail.slice(0, 200)}`,
      };
    }
    return {
      kind: "rejected",
      reason: `waha ${response.status}: ${detail.slice(0, 200)}`,
    };
  }

  return {
    name: wahaProviderName,
    capabilities: wahaCapabilities,
    verifyWebhook,
    normalizeEvent,
    send,
  };
}

function verifyWebhook(input: WebhookVerification): boolean {
  const expected = createHmac("sha512", input.secret)
    .update(input.rawBody)
    .digest("hex");
  const provided = String(input.signatureHeader ?? "").trim();
  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(provided, "utf8"),
    );
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractMessageId(raw: unknown): string | undefined {
  if (typeof raw === "string") return raw;
  if (
    isRecord(raw) &&
    "_serialized" in raw &&
    typeof raw._serialized === "string"
  ) {
    return raw._serialized;
  }
  return undefined;
}

function normalizeEvent(raw: unknown): InboundEvent {
  if (!isRecord(raw)) return { kind: "unknown" };
  const event = typeof raw.event === "string" ? raw.event : "";
  const data = isRecord(raw.data) ? raw.data : {};
  const from = typeof data.from === "string" ? data.from : "";
  const messageId = extractMessageId(data.id);

  if (event === "message") {
    const text = typeof data.body === "string" ? data.body : "";
    const type = typeof data.type === "string" ? data.type : "unknown";
    if (!messageId || !from) return { kind: "unknown" };
    return {
      kind: "message",
      providerThreadId: from,
      providerMessageId: messageId,
      providerEventId: messageId,
      providerEventKind: "message",
      sender: { phone: from },
      content:
        type === "text"
          ? { type: "text", text }
          : { type: "text", text: `[${type}] ${text}` },
    };
  }

  if (event === "message.ack") {
    const ack = typeof data.ack === "string" ? data.ack : "";
    if (!messageId) return { kind: "unknown" };
    return {
      kind: "status",
      providerThreadId: from,
      providerMessageId: messageId,
      providerEventId: messageId,
      providerEventKind: `ack.${ack}`,
      status: ack,
    };
  }

  if (event === "session.status") {
    const status = typeof data.status === "string" ? data.status : "";
    const eventId = messageId ?? `${status}:${Date.now()}`;
    return {
      kind: "session",
      providerEventId: eventId,
      providerEventKind: `session.${status}`,
      status,
    };
  }

  return { kind: "unknown" };
}
