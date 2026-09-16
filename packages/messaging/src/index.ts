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
  to: string;
  content: { type: "text"; text: string };
};

export type SendResult =
  | { kind: "sent"; providerMessageId: string }
  | { kind: "blocked"; reason: string };

export interface MessagingProvider {
  readonly name: string;
  verifyWebhook(input: WebhookVerification): boolean;
  normalizeEvent(raw: unknown): InboundEvent;
  send(input: SendInput): Promise<SendResult>;
}
