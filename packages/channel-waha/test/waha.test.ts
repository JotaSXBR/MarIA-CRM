/// <reference types="node" />
import { createHmac } from "node:crypto";
import { expect, test } from "vitest";
import { createWahaProvider } from "../src/index.ts";

const secret = "session-secret";

function hrefOf(url: unknown): string {
  return typeof url === "string"
    ? url
    : url instanceof URL
      ? url.href
      : (url as Request).url;
}

function bodyOf(init: RequestInit | undefined): unknown {
  return JSON.parse(typeof init?.body === "string" ? init.body : "{}");
}

function sampleMessageBody() {
  return JSON.stringify({
    id: "evt_01J0000000000000000000000A",
    timestamp: 1741249702485,
    event: "message",
    session: "default",
    engine: "WEBJS",
    payload: {
      id: "false_5511999999999@c.us_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      timestamp: 1667561485,
      from: "5511999999999@c.us",
      fromMe: false,
      source: "app",
      to: "5511888888888@c.us",
      body: "hello",
      hasMedia: false,
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
  expect(result).toMatchObject({
    kind: "message",
    providerThreadId: "5511999999999@c.us",
    providerMessageId:
      "false_5511999999999@c.us_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    providerEventId: "evt_01J0000000000000000000000A",
    providerEventKind: "message",
    sender: { phone: "5511999999999" },
    content: { type: "text", text: "hello" },
  });
});

test("normalizeEvent ignores our own messages (fromMe)", () => {
  const provider = createWahaProvider();
  const own = JSON.parse(sampleMessageBody()) as {
    event: string;
    payload: { fromMe: boolean };
  };
  own.payload.fromMe = true;
  expect(provider.normalizeEvent(own).kind).toBe("unknown");
  own.event = "message.any";
  expect(provider.normalizeEvent(own).kind).toBe("unknown");
});

test("normalizeEvent drops status@broadcast pseudo-chats", () => {
  const provider = createWahaProvider();
  const status = JSON.parse(sampleMessageBody()) as {
    payload: { from: string };
  };
  status.payload.from = "status@broadcast";
  expect(provider.normalizeEvent(status).kind).toBe("unknown");
});

test("normalizeEvent keeps LID threads without inventing a phone", () => {
  const provider = createWahaProvider();
  const lid = JSON.parse(sampleMessageBody()) as {
    payload: { from: string; id: string };
  };
  lid.payload.from = "122930570739927@lid";
  lid.payload.id = "false_122930570739927@lid_3EB0ACCA805CA4AB04983D";
  const result = provider.normalizeEvent(lid);
  expect(result).toMatchObject({
    kind: "message",
    providerThreadId: "122930570739927@lid",
    sender: { lid: "122930570739927@lid" },
  });
  if (result.kind === "message") {
    // The LID digits are a privacy identifier, never a contact phone.
    expect(result.sender.phone).toBeUndefined();
  }
});

test("normalizeEvent reads the real number from lid alternate fields", () => {
  const provider = createWahaProvider();
  const lid = JSON.parse(sampleMessageBody()) as {
    payload: Record<string, unknown>;
  };
  lid.payload.from = "122930570739927@lid";
  lid.payload.id = "false_122930570739927@lid_3EB0ACCA805CA4AB04983D";
  lid.payload._data = {
    Info: { Sender: "122930570739927@lid", SenderAlt: "5516999887766@c.us" },
  };
  expect(provider.normalizeEvent(lid)).toMatchObject({
    kind: "message",
    sender: { phone: "5516999887766", lid: "122930570739927@lid" },
  });
});

test("normalizeEvent maps message.ack ackName to status", () => {
  const provider = createWahaProvider();
  const result = provider.normalizeEvent({
    id: "evt_01J0000000000000000000000B",
    event: "message.ack",
    session: "default",
    payload: {
      id: "true_5511999999999@c.us_4CC5EDD64BC22EBA6D639F2AF571346C",
      from: "5511999999999@c.us",
      fromMe: true,
      ack: 3,
      ackName: "READ",
    },
  });
  expect(result).toMatchObject({
    kind: "status",
    providerMessageId:
      "true_5511999999999@c.us_4CC5EDD64BC22EBA6D639F2AF571346C",
    providerEventId: "evt_01J0000000000000000000000B",
    providerEventKind: "ack.READ",
    status: "READ",
  });
});

test("normalizeEvent maps numeric ack without ackName", () => {
  const provider = createWahaProvider();
  const result = provider.normalizeEvent({
    event: "message.ack",
    session: "default",
    payload: {
      id: "true_1@c.us_x",
      from: "1@c.us",
      ack: 2,
    },
  });
  expect(result).toMatchObject({ kind: "status", status: "DEVICE" });
});

test("normalizeEvent reads session.status from payload.status", () => {
  const provider = createWahaProvider();
  const result = provider.normalizeEvent({
    id: "evt_01J0000000000000000000000C",
    event: "session.status",
    session: "default",
    payload: { status: "WORKING" },
  });
  expect(result).toMatchObject({
    kind: "session",
    providerEventId: "evt_01J0000000000000000000000C",
    providerEventKind: "session.WORKING",
    status: "WORKING",
  });
});

test("normalizeEvent marks media messages by mimetype", () => {
  const provider = createWahaProvider();
  const mediaMessage = JSON.parse(sampleMessageBody()) as {
    payload: Record<string, unknown>;
  };
  mediaMessage.payload.hasMedia = true;
  mediaMessage.payload.media = {
    url: "http://waha:3000/files/x.jpg",
    mimetype: "image/jpeg",
    filename: "x.jpg",
  };
  const result = provider.normalizeEvent(mediaMessage);
  expect(result).toMatchObject({
    kind: "message",
    content: { type: "text", text: "[image/jpeg] hello" },
  });
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

test("setPresence posts chat and global presence (ADR 0012)", async () => {
  const calls: { url: string; body: unknown }[] = [];
  const provider = createWahaProvider({
    baseUrl: "http://waha:3000",
    fetchImpl: async (url, init) => {
      calls.push({ url: hrefOf(url), body: bodyOf(init) });
      return new Response("{}", { status: 200 });
    },
  });
  await provider.setPresence!({ session: "sales", presence: "online" });
  await provider.setPresence!({
    session: "sales",
    chatId: "5511999999999@c.us",
    presence: "typing",
  });
  expect(calls[0]!.url).toBe("http://waha:3000/api/sales/presence");
  expect(calls[0]!.body).toEqual({ presence: "online" });
  expect(calls[1]!.body).toEqual({
    chatId: "5511999999999@c.us",
    presence: "typing",
  });
});

test("setPresence and sendSeen never throw on provider failure", async () => {
  const provider = createWahaProvider({
    baseUrl: "http://waha:3000",
    fetchImpl: async () => {
      throw new Error("socket hangup");
    },
  });
  await expect(
    provider.setPresence!({ session: "s", presence: "offline" }),
  ).resolves.toBeUndefined();
  await expect(
    provider.sendSeen!({ session: "s", chatId: "x@c.us" }),
  ).resolves.toBeUndefined();
  // Unconfigured provider is also a silent no-op.
  const bare = createWahaProvider();
  await expect(
    bare.sendSeen!({ session: "s", chatId: "x@c.us" }),
  ).resolves.toBeUndefined();
});

test("sendSeen posts session, chatId and optional message ids", async () => {
  const bodies: unknown[] = [];
  const provider = createWahaProvider({
    baseUrl: "http://waha:3000",
    fetchImpl: async (url, init) => {
      expect(hrefOf(url)).toBe("http://waha:3000/api/sendSeen");
      bodies.push(bodyOf(init));
      return new Response("{}", { status: 200 });
    },
  });
  await provider.sendSeen!({
    session: "s",
    chatId: "1@g.us",
    messageIds: ["false_1@g.us_abc"],
    participant: "2@c.us",
  });
  expect(bodies[0]).toEqual({
    session: "s",
    chatId: "1@g.us",
    messageIds: ["false_1@g.us_abc"],
    participant: "2@c.us",
  });
});

test("resolveLid maps a lid to the phone chat id, null when unknown", async () => {
  const provider = createWahaProvider({
    baseUrl: "http://waha:3000",
    fetchImpl: async (url) => {
      expect(hrefOf(url)).toBe(
        "http://waha:3000/api/sales/lids/122930570739927%40lid",
      );
      return new Response(
        JSON.stringify({
          lid: "122930570739927@lid",
          pn: "5516999887766@c.us",
        }),
        { status: 200 },
      );
    },
  });
  await expect(
    provider.resolveLid!("sales", "122930570739927@lid"),
  ).resolves.toBe("5516999887766@c.us");

  const missing = createWahaProvider({
    baseUrl: "http://waha:3000",
    fetchImpl: async () => new Response("{}", { status: 404 }),
  });
  await expect(missing.resolveLid!("s", "1@lid")).resolves.toBeNull();
  await expect(
    createWahaProvider().resolveLid!("s", "1@lid"),
  ).resolves.toBeNull();
});
