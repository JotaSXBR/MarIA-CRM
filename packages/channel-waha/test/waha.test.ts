/// <reference types="node" />
import { createHmac } from "node:crypto";
import { expect, test } from "vitest";
import { createWahaProvider } from "../src/index.ts";

const secret = "session-secret";

function sampleMessageBody() {
  return JSON.stringify({
    event: "message",
    data: {
      from: "5511999999999@c.us",
      id: { _serialized: "msg-1" },
      body: "hello",
      type: "text",
    },
  });
}

test("verifyWebhook accepts a valid HMAC", () => {
  const provider = createWahaProvider();
  const rawBody = new TextEncoder().encode(sampleMessageBody());
  const signature = createHmac("sha512", secret).update(rawBody).digest("hex");
  expect(
    provider.verifyWebhook({
      rawBody,
      signatureHeader: signature,
      secret,
    }),
  ).toBe(true);
});

test("verifyWebhook rejects an invalid HMAC", () => {
  const provider = createWahaProvider();
  const rawBody = new TextEncoder().encode(sampleMessageBody());
  expect(
    provider.verifyWebhook({
      rawBody,
      signatureHeader: "invalid",
      secret,
    }),
  ).toBe(false);
});

test("normalizeEvent returns a message for a WAHA message payload", () => {
  const provider = createWahaProvider();
  const result = provider.normalizeEvent(JSON.parse(sampleMessageBody()));
  expect(result.kind).toBe("message");
});

test("normalizeEvent returns unknown for unrecognized payloads", () => {
  const provider = createWahaProvider();
  const result = provider.normalizeEvent({ event: "unknown" });
  expect(result.kind).toBe("unknown");
});
