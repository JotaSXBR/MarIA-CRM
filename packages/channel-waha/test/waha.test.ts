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

test("send is blocked when no WAHA base url is configured", async () => {
  const provider = createWahaProvider();
  const result = await provider.send({
    session: "default",
    to: "5511999999999@c.us",
    content: { type: "text", text: "hi" },
  });
  expect(result).toEqual({
    kind: "blocked",
    reason: "waha base url not configured",
  });
  expect(provider.capabilities.sendIdempotency).toBe("none");
});

test("send posts to /api/sendText with session, chatId and api key", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchImpl: typeof fetch = async (url, init) => {
    const href =
      typeof url === "string" ? url : url instanceof URL ? url.href : url.url;
    calls.push({ url: href, init: init! });
    return new Response(
      JSON.stringify({ id: { _serialized: "true_1@c.us_abc" } }),
      { status: 200 },
    );
  };
  const provider = createWahaProvider({
    baseUrl: "http://waha:3000/",
    apiKey: "secret-key",
    fetchImpl,
  });
  const result = await provider.send({
    session: "sales",
    to: "5511999999999@c.us",
    content: { type: "text", text: "hello" },
  });
  expect(result).toEqual({
    kind: "sent",
    providerMessageId: "true_1@c.us_abc",
  });
  expect(calls).toHaveLength(1);
  expect(calls[0]!.url).toBe("http://waha:3000/api/sendText");
  expect((calls[0]!.init.headers as Record<string, string>)["x-api-key"]).toBe(
    "secret-key",
  );
  const body = calls[0]!.init.body;
  expect(JSON.parse(typeof body === "string" ? body : "{}")).toEqual({
    session: "sales",
    chatId: "5511999999999@c.us",
    text: "hello",
  });
});

test("send classifies 4xx as rejected and 5xx as unknown (ADR 0010)", async () => {
  const rejected = createWahaProvider({
    baseUrl: "http://waha:3000",
    fetchImpl: async () => new Response("bad chat", { status: 422 }),
  });
  expect(
    await rejected.send({
      session: "s",
      to: "x@c.us",
      content: { type: "text", text: "t" },
    }),
  ).toMatchObject({ kind: "rejected" });

  const serverError = createWahaProvider({
    baseUrl: "http://waha:3000",
    fetchImpl: async () => new Response("oops", { status: 500 }),
  });
  expect(
    await serverError.send({
      session: "s",
      to: "x@c.us",
      content: { type: "text", text: "t" },
    }),
  ).toMatchObject({ kind: "unknown" });
});

test("send classifies network failure as unknown, never retryable", async () => {
  const provider = createWahaProvider({
    baseUrl: "http://waha:3000",
    fetchImpl: async () => {
      throw new Error("socket hangup");
    },
  });
  const result = await provider.send({
    session: "s",
    to: "x@c.us",
    content: { type: "text", text: "t" },
  });
  expect(result.kind).toBe("unknown");
});

test("send without a provider message id is unknown, not sent", async () => {
  const provider = createWahaProvider({
    baseUrl: "http://waha:3000",
    fetchImpl: async () => new Response("{}", { status: 200 }),
  });
  const result = await provider.send({
    session: "s",
    to: "x@c.us",
    content: { type: "text", text: "t" },
  });
  expect(result.kind).toBe("unknown");
});
