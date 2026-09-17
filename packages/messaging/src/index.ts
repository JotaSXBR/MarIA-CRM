/**
 * Media attachment metadata carried on inbound messages. `url` is the
 * provider's download location — resolve bytes through
 * `MessagingProvider.downloadMedia`, never expose it to clients.
 */
export type InboundMedia = {
  url: string;
  mimetype?: string;
  filename?: string;
};

export type MediaContentType = "image" | "video" | "audio" | "document";

export type InboundContent =
  | { type: "text"; text: string }
  | {
      type: MediaContentType;
      /** Message text/caption accompanying the media. */
      caption: string;
      media: InboundMedia;
    };

export type InboundMessage = {
  kind: "message";
  providerThreadId: string;
  providerMessageId: string;
  providerEventId: string;
  providerEventKind: "message";
  sender: {
    phone?: string;
    name?: string;
    /**
     * Hidden LID chat id (e.g. `1229...@lid`) when WhatsApp privacy-masks the
     * sender number. Resolve via `MessagingProvider.resolveLid` — never store
     * the LID digits as the contact phone.
     */
    lid?: string;
  };
  content: InboundContent;
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

/** Outbound content. Media variants carry base64 `data` read from storage at
 * dispatch time — the ledger persists the storage key, not the bytes. */
export type SendContent =
  | { type: "text"; text: string }
  | {
      type: MediaContentType;
      /** Base64-encoded file bytes. */
      data: string;
      mimetype: string;
      filename?: string;
      caption?: string;
    }
  | {
      type: "contact";
      /** vCard 3.0 payloads; providers with structured contact APIs map fields. */
      contacts: { vcard: string }[];
    };

export type SendInput = {
  /** Provider session/instance identifier (e.g. WAHA session name). */
  session: string;
  /** Provider thread/chat identifier (e.g. `5511...@c.us`). */
  to: string;
  content: SendContent;
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
  /** Chat-scoped typing/recording presence signals (ADR 0012). */
  presenceSignals: boolean;
  /** Read receipts (mark messages seen) support. */
  readReceipts: boolean;
  /** Hidden-identifier (`@lid`) → public phone resolution support. */
  lidResolution: boolean;
};

/**
 * ADR 0012 presence choreography primitives. These are best-effort UX
 * signals, not durable state: a lost presence/seen call never blocks the
 * send itself, and the dispatcher orchestrates their timing.
 */
export type PresenceState =
  "online" | "offline" | "typing" | "recording" | "paused";

export type PresenceInput = {
  /** Provider session/instance identifier. */
  session: string;
  /** Required for chat-scoped states (typing/recording/paused). */
  chatId?: string;
  presence: PresenceState;
};

export type SeenInput = {
  session: string;
  chatId: string;
  /** Specific provider message ids to mark read; omit for all unread. */
  messageIds?: string[];
  /** Group participant required for group-message read receipts. */
  participant?: string;
};

export interface MessagingProvider {
  readonly name: string;
  readonly capabilities: ProviderCapabilities;
  verifyWebhook(input: WebhookVerification): boolean;
  normalizeEvent(raw: unknown): InboundEvent;
  send(input: SendInput): Promise<SendResult>;
  /** Best-effort presence signal; unsupported providers may omit it. */
  setPresence?(input: PresenceInput): Promise<void>;
  /** Best-effort read receipt; unsupported providers may omit it. */
  sendSeen?(input: SeenInput): Promise<void>;
  /**
   * Resolve a hidden identifier (`@lid`) to the public phone chat id
   * (`@c.us`), or null when unknown — used for contact phone linking.
   */
  resolveLid?(session: string, lid: string): Promise<string | null>;
  /**
   * Download a media payload referenced by an inbound message. `url` may be
   * provider-relative or absolute; implementations authenticate with the
   * provider credentials. Returns null when the media is unavailable.
   */
  downloadMedia?(
    url: string,
  ): Promise<{ data: Uint8Array; mimetype?: string } | null>;
}
