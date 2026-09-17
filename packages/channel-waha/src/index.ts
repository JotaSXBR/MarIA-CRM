/// <reference types="node" />
import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  InboundEvent,
  MessagingProvider,
  PresenceInput,
  ProviderCapabilities,
  SeenInput,
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
  // Presence choreography (ADR 0012): POST /api/{session}/presence.
  presenceSignals: true,
  // POST /api/sendSeen.
  readReceipts: true,
  // GET /api/{session}/lids/{lid} maps hidden LIDs to phone chat ids.
  lidResolution: true,
};

export function createWahaProvider(
  config: WahaProviderConfig = {},
): MessagingProvider {
  const fetchImpl = config.fetchImpl ?? fetch;
  const timeoutMs = config.timeoutMs ?? 15_000;
  // Trim trailing slashes without a regex — CodeQL flags `\/+$` on
  // uncontrolled input as a potential polynomial backtracking risk.
  let baseUrl = config.baseUrl;
  while (baseUrl?.endsWith("/")) baseUrl = baseUrl.slice(0, -1);

  const headers = {
    "content-type": "application/json",
    accept: "application/json",
    ...(config.apiKey ? { "x-api-key": config.apiKey } : {}),
  };

  type WahaRequest =
    | { outcome: "unconfigured" }
    | { outcome: "network_error"; reason: string }
    | { outcome: "response"; response: Response };

  async function request(
    method: "GET" | "POST",
    path: string,
    body?: Record<string, unknown>,
  ): Promise<WahaRequest> {
    if (!baseUrl) return { outcome: "unconfigured" };
    try {
      const response = await fetchImpl(`${baseUrl}${path}`, {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(timeoutMs),
      });
      return { outcome: "response", response };
    } catch (error) {
      return {
        outcome: "network_error",
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async function send(input: SendInput): Promise<SendResult> {
    const result = await request("POST", "/api/sendText", {
      session: input.session,
      chatId: input.to,
      text: input.content.text,
    });
    if (result.outcome === "unconfigured") {
      return { kind: "blocked", reason: "waha base url not configured" };
    }
    if (result.outcome === "network_error") {
      // Network failure, abort or timeout: the provider may have accepted.
      return { kind: "unknown", reason: result.reason };
    }
    const response = result.response;
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

  // Presence and read receipts are best-effort UX signals (ADR 0012): a lost
  // call never fails or blocks the send itself, so errors are swallowed.
  async function setPresence(input: PresenceInput): Promise<void> {
    await request(
      "POST",
      `/api/${encodeURIComponent(input.session)}/presence`,
      {
        ...(input.chatId ? { chatId: input.chatId } : {}),
        presence: input.presence,
      },
    );
  }

  async function sendSeen(input: SeenInput): Promise<void> {
    await request("POST", "/api/sendSeen", {
      session: input.session,
      chatId: input.chatId,
      ...(input.messageIds?.length ? { messageIds: input.messageIds } : {}),
      ...(input.participant ? { participant: input.participant } : {}),
    });
  }

  async function resolveLid(
    session: string,
    lid: string,
  ): Promise<string | null> {
    const result = await request(
      "GET",
      `/api/${encodeURIComponent(session)}/lids/${encodeURIComponent(lid)}`,
    );
    if (result.outcome !== "response" || !result.response.ok) return null;
    const body = (await result.response.json().catch(() => null)) as unknown;
    // WAHA answers `{ lid: "...@lid", pn: "...@c.us" }`.
    return isRecord(body) && typeof body.pn === "string" ? body.pn : null;
  }

  return {
    name: wahaProviderName,
    capabilities: wahaCapabilities,
    verifyWebhook,
    normalizeEvent,
    send,
    setPresence,
    sendSeen,
    resolveLid,
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

const WAHA_ACK_NAMES: Record<number, string> = {
  [-1]: "ERROR",
  0: "PENDING",
  1: "SERVER",
  2: "DEVICE",
  3: "READ",
  4: "PLAYED",
};

function ackStatus(payload: Record<string, unknown>): string {
  if (typeof payload.ackName === "string" && payload.ackName) {
    return payload.ackName;
  }
  if (typeof payload.ack === "number") {
    return WAHA_ACK_NAMES[payload.ack] ?? `ACK_${payload.ack}`;
  }
  return "";
}

function chatIdToPhone(chatId: string): string {
  return chatId.split("@")[0] ?? chatId;
}

/**
 * Candidate payload fields where engines may expose the real phone chat id
 * (`@c.us`/`@s.whatsapp.net`) of a privacy-masked `@lid` sender. whatsmeow
 * (GOWS) surfaces it as `Info.SenderAlt`; WEBJS may use `author`. The primary
 * resolution path is `resolveLid`; this only avoids the extra API call.
 */
function altPhoneFromPayload(
  payload: Record<string, unknown>,
): string | undefined {
  const data = isRecord(payload._data) ? payload._data : undefined;
  const info = isRecord(data?.Info) ? data.Info : undefined;
  const candidates: unknown[] = [
    payload.author,
    payload.senderObj && isRecord(payload.senderObj)
      ? payload.senderObj.pn
      : undefined,
    info?.SenderAlt,
    info?.Sender,
    data?.author,
    data?.senderAlt,
  ];
  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      /^\d{5,15}@(c\.us|s\.whatsapp\.net)$/.test(candidate)
    ) {
      return chatIdToPhone(candidate);
    }
  }
  return undefined;
}

function normalizeEvent(raw: unknown): InboundEvent {
  if (!isRecord(raw)) return { kind: "unknown" };
  const event = typeof raw.event === "string" ? raw.event : "";
  // WAHA envelopes carry event data in `payload`; `data` is kept as a
  // defensive fallback for older payload shapes.
  const payload = isRecord(raw.payload)
    ? raw.payload
    : isRecord(raw.data)
      ? raw.data
      : {};
  // The envelope `id` (evt_<ULID>) is the provider event id used for
  // deduplication; `payload.id` is the message id. They are not the same
  // identity (ADR 0010).
  const envelopeId = typeof raw.id === "string" ? raw.id : undefined;
  const from = typeof payload.from === "string" ? payload.from : "";
  const messageId = extractMessageId(payload.id);

  if (event === "message" || event === "message.any") {
    // `message` is documented as incoming-only, but both events can carry
    // `fromMe: true` (e.g. `source: "api"` for our own sends on message.any).
    // Our own messages must never become inbound conversations.
    if (payload.fromMe === true) return { kind: "unknown" };
    // WhatsApp Status/Stories arrive as `message` events from a pseudo-chat
    // shared by every contact — inbox noise, not a real conversation. The
    // session-level `ignore.status` filter is the primary gate; this stays as
    // adapter-level defense so misconfigured sessions still can't pollute it.
    if (from === "status@broadcast") return { kind: "unknown" };
    const text = typeof payload.body === "string" ? payload.body : "";
    const media = isRecord(payload.media) ? payload.media : undefined;
    const type =
      typeof media?.mimetype === "string"
        ? media.mimetype
        : payload.hasMedia === true
          ? "media"
          : "text";
    if (!messageId || !from) return { kind: "unknown" };
    const isLid = from.endsWith("@lid");
    // For LID threads the digits in `from` are a privacy identifier, not a
    // phone number — never persist them as the contact phone. Try the
    // alternate-identity fields first; the webhook route falls back to
    // `resolveLid` when the payload does not carry the real number.
    const phone = isLid ? altPhoneFromPayload(payload) : chatIdToPhone(from);
    return {
      kind: "message",
      providerThreadId: from,
      providerMessageId: messageId,
      providerEventId: envelopeId ?? messageId,
      providerEventKind: "message",
      sender: {
        ...(phone ? { phone } : {}),
        ...(isLid ? { lid: from } : {}),
      },
      content:
        type === "text"
          ? { type: "text", text }
          : { type: "text", text: `[${type}] ${text}` },
    };
  }

  if (event === "message.ack" || event === "message.ack.group") {
    const status = ackStatus(payload);
    if (!messageId) return { kind: "unknown" };
    return {
      kind: "status",
      providerThreadId: from,
      providerMessageId: messageId,
      providerEventId: envelopeId ?? messageId,
      providerEventKind: `ack.${status}`,
      status,
    };
  }

  if (event === "session.status") {
    const status = typeof payload.status === "string" ? payload.status : "";
    return {
      kind: "session",
      providerEventId: envelopeId ?? `session.status:${status}:${from}`,
      providerEventKind: `session.${status}`,
      status,
    };
  }

  return { kind: "unknown" };
}
