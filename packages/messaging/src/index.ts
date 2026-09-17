export type InboundMessage = {
  kind: "message";
  providerThreadId: string;
  providerMessageId: string;
  providerEventId: string;
  providerEventKind: "message";
  sender: {
    phone?: string;
    name?: string;
  };
  content: {
    type: "text";
    text: string;
  };
};

export type InboundStatus = {
  kind: "status";
  providerThreadId: string;
  providerMessageId: string;
  providerEventId: string;
  providerEventKind: string;
  status: string;
};

export type InboundSession = {
  kind: "session";
  providerEventId: string;
  providerEventKind: string;
  status: string;
};

export type InboundUnknown = {
  kind: "unknown";
};

export type InboundEvent =
  InboundMessage | InboundStatus | InboundSession | InboundUnknown;

export type WebhookVerification = {
  rawBody: Uint8Array;
  signatureHeader: string;
  secret: string;
};

export type SendInput = {
  /** Provider session/instance identifier (e.g. WAHA session name). */
  session: string;
  /** Provider thread/chat identifier (e.g. `5511...@c.us`). */
  to: string;
  content: { type: "text"; text: string };
};

/**
 * ADR 0010 send classification:
 * - `sent`: provider accepted and returned a message id.
 * - `rejected`: provider refused before acceptance (4xx) — safe to mark failed.
 * - `unknown`: timeout, lost response or ambiguous 5xx — the provider may have
 *   accepted; must stay blocked unless reconciliation proves otherwise.
 * - `blocked`: adapter declined the send (not configured/certified).
 */
export type SendResult =
  | { kind: "sent"; providerMessageId: string }
  | { kind: "rejected"; reason: string }
  | { kind: "unknown"; reason: string }
  | { kind: "blocked"; reason: string };

export type ProviderCapabilities = {
  /**
   * Whether the provider deduplicates sends by a caller-supplied key within a
   * documented retention window. `none` means a timed-out send can never be
   * blindly retried (ADR 0010 §4).
   */
  sendIdempotency: "keyed" | "none";
  /** How an `unknown` outcome can be reconciled. */
  reconciliation: "provider_lookup" | "webhook" | "none";
};

export interface MessagingProvider {
  readonly name: string;
  readonly capabilities: ProviderCapabilities;
  verifyWebhook(input: WebhookVerification): boolean;
  normalizeEvent(raw: unknown): InboundEvent;
  send(input: SendInput): Promise<SendResult>;
}
