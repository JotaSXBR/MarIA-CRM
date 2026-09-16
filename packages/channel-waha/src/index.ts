/// <reference types="node" />
import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  InboundEvent,
  MessagingProvider,
  SendInput,
  SendResult,
  WebhookVerification,
} from "@maria/messaging";

export const wahaProviderName = "waha";

export function createWahaProvider(): MessagingProvider {
  return {
    name: wahaProviderName,
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

async function send(_input: SendInput): Promise<SendResult> {
  return { kind: "blocked", reason: "WAHA outbound not certified" };
}
