import { randomUUID } from "node:crypto";
import { expect, test, vi } from "vitest";
import type { AuthPort } from "@maria/auth";
import { buildApp } from "../src/app.ts";

function createAuthStub(overrides: Partial<AuthPort> = {}) {
  const stub = {
    login: vi.fn().mockResolvedValue(undefined),
    verifySession: vi.fn().mockResolvedValue(undefined),
    authorizeWorkspace: vi.fn().mockResolvedValue(undefined),
    listUserWorkspaces: vi.fn().mockResolvedValue([]),
    createUser: vi.fn().mockResolvedValue(undefined),
    listUsers: vi.fn().mockResolvedValue([]),
    updateUser: vi.fn().mockResolvedValue("not-found"),
    changePassword: vi.fn().mockResolvedValue("not-found"),
    listMembers: vi.fn().mockResolvedValue([]),
    addMembership: vi.fn().mockResolvedValue("not-found"),
    updateMembershipRole: vi.fn().mockResolvedValue("not-found"),
    removeMembership: vi.fn().mockResolvedValue("not-found"),
    ensureAdmin: vi.fn().mockResolvedValue(false),
    seedAdmin: vi.fn().mockResolvedValue(undefined),
  };
  return Object.assign(stub, overrides);
}

const memberAuth = () =>
  createAuthStub({
    verifySession: async () => ({
      userId: randomUUID(),
      email: "user@example.com",
      name: "User",
      isAdmin: false,
    }),
    authorizeWorkspace: async () => ({ role: "member" }),
  });

function createDatabaseStub() {
  return {
    listContacts: vi.fn().mockResolvedValue([]),
    getContact: vi.fn().mockResolvedValue(undefined),
    createContact: vi.fn(),
    updateContact: vi.fn().mockResolvedValue(undefined),
    deleteContact: vi.fn().mockResolvedValue(false),
    listCompanies: vi.fn().mockResolvedValue([]),
    getCompany: vi.fn().mockResolvedValue(undefined),
    createCompany: vi.fn(),
    updateCompany: vi.fn().mockResolvedValue(undefined),
    deleteCompany: vi.fn().mockResolvedValue(false),
    listPipelines: vi.fn().mockResolvedValue([]),
    createPipeline: vi.fn(),
    updatePipeline: vi.fn().mockResolvedValue(undefined),
    deletePipeline: vi.fn().mockResolvedValue("not-found"),
    listStages: vi.fn().mockResolvedValue([]),
    createStage: vi.fn().mockResolvedValue(undefined),
    updateStage: vi.fn().mockResolvedValue(undefined),
    deleteStage: vi.fn().mockResolvedValue("not-found"),
    listDeals: vi.fn().mockResolvedValue([]),
    getDeal: vi.fn().mockResolvedValue(undefined),
    createDeal: vi.fn().mockResolvedValue(undefined),
    updateDeal: vi.fn().mockResolvedValue(undefined),
    moveDeal: vi.fn().mockResolvedValue(undefined),
    deleteDeal: vi.fn().mockResolvedValue(false),
    listOrganizations: vi.fn().mockResolvedValue([]),
    createOrganization: vi.fn(),
    listWorkspaces: vi.fn().mockResolvedValue([]),
    createWorkspace: vi.fn(),
    createChannelInstance: vi.fn().mockResolvedValue(undefined),
    listChannelInstances: vi.fn().mockResolvedValue([]),
    getChannelInstance: vi.fn().mockResolvedValue(undefined),
    receiveInboundMessage: vi.fn().mockResolvedValue({ kind: "duplicate" }),
    listConversations: vi.fn().mockResolvedValue([]),
    getConversation: vi.fn().mockResolvedValue(undefined),
    listMessages: vi.fn().mockResolvedValue([]),
    createOutboundIntent: vi.fn().mockResolvedValue({ kind: "missing" }),
    getMessage: vi.fn().mockResolvedValue(undefined),
    resolveUnknownMessage: vi.fn().mockResolvedValue({ kind: "missing" }),
    claimDispatchIntent: vi.fn().mockResolvedValue({ kind: "missing" }),
    settleDispatch: vi.fn().mockResolvedValue({ kind: "settled" }),
    reapExpiredDispatches: vi.fn().mockResolvedValue({ reaped: 0 }),
    recordDeliveryStatus: vi.fn().mockResolvedValue({ kind: "recorded" }),
    listPendingIntents: vi.fn().mockResolvedValue([]),
  };
}

const channelInstance = (workspaceId: string, channelInstanceId: string) => ({
  id: channelInstanceId,
  workspaceId,
  provider: "waha",
  providerInstanceId: "session-1",
  webhookSecret: "secret",
  isActive: true,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
});

const wahaStub = (over: Record<string, unknown> = {}) => ({
  name: "waha",
  capabilities: {
    sendIdempotency: "none" as const,
    reconciliation: "webhook" as const,
    presenceSignals: false,
    readReceipts: false,
    lidResolution: false,
  },
  verifyWebhook: () => true,
  normalizeEvent: () => ({ kind: "unknown" as const }),
  send: async () => ({ kind: "blocked" as const, reason: "unused" }),
  ...over,
});

test("POST /conversations/:id/messages accepts attachments and contacts", async () => {
  const workspaceId = randomUUID();
  const conversationId = randomUUID();
  const messageId = randomUUID();
  const now = new Date("2026-01-01T00:00:00Z");
  const database = createDatabaseStub();
  database.createOutboundIntent.mockResolvedValue({
    kind: "created",
    intentId: randomUUID(),
    messageId,
  });
  database.getMessage.mockResolvedValue({
    id: messageId,
    workspaceId,
    conversationId,
    providerMessageId: null,
    direction: "outbound",
    status: "pending",
    contentType: "image",
    body: "legenda",
    mediaKey: `${workspaceId}/k.png`,
    mediaMime: "image/png",
    mediaFilename: "f.png",
    createdAt: now,
  });
  const media = {
    put: vi.fn(
      async (_workspaceId: string, _data: Uint8Array, _extension?: string) =>
        `${workspaceId}/k.png`,
    ),
    read: vi.fn(async () => null),
  };
  const app = buildApp({ database, auth: memberAuth(), media });
  try {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47]).toString("base64");
    const image = await app.inject({
      method: "POST",
      url: `/conversations/${conversationId}/messages?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
      payload: {
        body: "legenda",
        attachment: { data: png, mimetype: "image/png", filename: "f.png" },
      },
    });
    expect(image.statusCode).toBe(201);
    expect(image.json()).toMatchObject({
      hasMedia: true,
      contentType: "image",
      mediaMime: "image/png",
    });
    // The internal storage key never leaves the API surface.
    expect(image.json().mediaKey).toBeUndefined();
    expect(media.put).toHaveBeenCalledWith(
      workspaceId,
      expect.any(Uint8Array),
      "png",
    );
    expect(database.createOutboundIntent).toHaveBeenCalledWith(workspaceId, {
      conversationId,
      body: "legenda",
      contentType: "image",
      media: {
        key: `${workspaceId}/k.png`,
        mime: "image/png",
        filename: "f.png",
      },
    });

    // Non-media mimetypes become documents; body is optional for media.
    const doc = await app.inject({
      method: "POST",
      url: `/conversations/${conversationId}/messages?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
      payload: {
        attachment: {
          data: Buffer.from("pdf").toString("base64"),
          mimetype: "application/pdf",
          filename: "doc.pdf",
        },
      },
    });
    expect(doc.statusCode).toBe(201);
    expect(database.createOutboundIntent).toHaveBeenLastCalledWith(
      workspaceId,
      expect.objectContaining({ contentType: "document", body: null }),
    );

    // Contact cards persist a vCard payload in the media store.
    const contact = await app.inject({
      method: "POST",
      url: `/conversations/${conversationId}/messages?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
      payload: {
        contact: { fullName: "Ana", phoneNumber: "+55 16 91234-5678" },
      },
    });
    expect(contact.statusCode).toBe(201);
    const vcardCall = media.put.mock.calls.at(-1)!;
    expect(new TextDecoder().decode(vcardCall[1])).toContain("BEGIN:VCARD");
    expect(vcardCall[2]).toBe("vcf");
    expect(database.createOutboundIntent).toHaveBeenLastCalledWith(
      workspaceId,
      expect.objectContaining({
        contentType: "contact",
        body: "Ana · +55 16 91234-5678",
      }),
    );

    // Empty payload is a validation error.
    const empty = await app.inject({
      method: "POST",
      url: `/conversations/${conversationId}/messages?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
      payload: {},
    });
    expect(empty.statusCode).toBe(400);
  } finally {
    await app.close();
  }
});

test("GET /messages/:id/media serves stored bytes under workspace auth", async () => {
  const workspaceId = randomUUID();
  const messageId = randomUUID();
  const database = createDatabaseStub();
  database.getMessage.mockResolvedValue({
    id: messageId,
    workspaceId,
    conversationId: randomUUID(),
    providerMessageId: null,
    direction: "inbound",
    status: "received",
    contentType: "image",
    body: null,
    mediaKey: `${workspaceId}/img.jpg`,
    mediaMime: "image/jpeg",
    mediaFilename: "photo.jpg",
    createdAt: new Date("2026-01-01T00:00:00Z"),
  });
  const media = {
    put: vi.fn(),
    read: vi.fn(async () => new Uint8Array([0xff, 0xd8])),
  };
  const app = buildApp({ database, auth: memberAuth(), media });
  try {
    const unauthorized = await app.inject({
      method: "GET",
      url: `/messages/${messageId}/media?workspaceId=${workspaceId}`,
    });
    expect(unauthorized.statusCode).toBe(401);

    const response = await app.inject({
      method: "GET",
      url: `/messages/${messageId}/media?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("image/jpeg");
    expect(response.headers["content-disposition"]).toContain("photo.jpg");
    expect(media.read).toHaveBeenCalledWith(
      workspaceId,
      `${workspaceId}/img.jpg`,
    );

    database.getMessage.mockResolvedValue(undefined);
    const missing = await app.inject({
      method: "GET",
      url: `/messages/${messageId}/media?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
    });
    expect(missing.statusCode).toBe(404);
  } finally {
    await app.close();
  }
});

test("POST /webhooks/waha downloads inbound media into the media store", async () => {
  const workspaceId = randomUUID();
  const channelInstanceId = randomUUID();
  const database = createDatabaseStub();
  database.getChannelInstance.mockResolvedValue(
    channelInstance(workspaceId, channelInstanceId),
  );
  database.receiveInboundMessage.mockResolvedValue({ kind: "received" });
  const downloadMedia = vi.fn(
    async (): Promise<{
      data: Uint8Array;
      mimetype?: string;
    } | null> => ({
      data: new Uint8Array([0x89, 0x50]),
      mimetype: "image/png",
    }),
  );
  const media = {
    put: vi.fn(
      async (_workspaceId: string, _data: Uint8Array, _extension?: string) =>
        `${workspaceId}/dl.png`,
    ),
    read: vi.fn(async () => null),
  };
  const app = buildApp({
    database,
    auth: createAuthStub(),
    media,
    messaging: {
      waha: wahaStub({
        normalizeEvent: () => ({
          kind: "message" as const,
          providerThreadId: "55119999@c.us",
          providerMessageId: "waha-img-1",
          providerEventId: "evt-img-1",
          providerEventKind: "message",
          sender: { phone: "55119999" },
          content: {
            type: "image" as const,
            caption: "olha",
            media: {
              url: "/api/files/x.png",
              mimetype: "image/png",
              filename: "x.png",
            },
          },
        }),
        downloadMedia,
      }),
    },
  });
  try {
    const response = await app.inject({
      method: "POST",
      url: `/webhooks/waha/${workspaceId}/${channelInstanceId}`,
      payload: { event: "message", session: "session-1" },
    });
    expect(response.statusCode).toBe(200);
    expect(downloadMedia).toHaveBeenCalledWith("/api/files/x.png");
    expect(media.put).toHaveBeenCalledWith(
      workspaceId,
      new Uint8Array([0x89, 0x50]),
      "png",
    );
    expect(database.receiveInboundMessage).toHaveBeenCalledWith(
      workspaceId,
      expect.objectContaining({
        contentType: "image",
        body: "olha",
        media: {
          key: `${workspaceId}/dl.png`,
          mime: "image/png",
          filename: "x.png",
        },
      }),
    );

    // Unavailable media still records the message (without stored bytes).
    downloadMedia.mockResolvedValue(null);
    const second = await app.inject({
      method: "POST",
      url: `/webhooks/waha/${workspaceId}/${channelInstanceId}`,
      payload: { event: "message", session: "session-1" },
    });
    expect(second.statusCode).toBe(200);
    expect(database.receiveInboundMessage).toHaveBeenLastCalledWith(
      workspaceId,
      expect.objectContaining({ media: null }),
    );
  } finally {
    await app.close();
  }
});
