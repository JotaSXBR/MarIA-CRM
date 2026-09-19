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
    setupRequired: vi.fn().mockResolvedValue(false),
    completeSetup: vi.fn().mockResolvedValue("already-setup"),
    createInvitation: vi.fn().mockResolvedValue("already-member"),
    listInvitations: vi.fn().mockResolvedValue([]),
    revokeInvitation: vi.fn().mockResolvedValue("not-found"),
    previewInvitation: vi.fn().mockResolvedValue("invalid"),
    acceptInvitation: vi.fn().mockResolvedValue("invalid"),
    getOnboarding: vi.fn().mockResolvedValue(undefined),
    updateOnboardingStep: vi.fn().mockResolvedValue("not-found"),
    completeOnboarding: vi.fn().mockResolvedValue("not-found"),
    seedAdmin: vi.fn().mockResolvedValue(undefined),
  };
  return Object.assign(stub, overrides);
}

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
    listDealsForContact: vi.fn().mockResolvedValue([]),
    listDealsForCompany: vi.fn().mockResolvedValue([]),
    listNotes: vi.fn().mockResolvedValue([]),
    createNote: vi.fn().mockResolvedValue(undefined),
    deleteNote: vi.fn().mockResolvedValue(false),
    listTasks: vi.fn().mockResolvedValue([]),
    createTask: vi.fn().mockResolvedValue(undefined),
    updateTask: vi.fn().mockResolvedValue(undefined),
    deleteTask: vi.fn().mockResolvedValue(false),
    listTags: vi.fn().mockResolvedValue([]),
    getTag: vi.fn().mockResolvedValue(undefined),
    createTag: vi.fn().mockResolvedValue(undefined),
    updateTag: vi.fn().mockResolvedValue(undefined),
    deleteTag: vi.fn().mockResolvedValue(false),
    listContactTags: vi.fn().mockResolvedValue([]),
    listCompanyTags: vi.fn().mockResolvedValue([]),
    listDealTags: vi.fn().mockResolvedValue([]),
    setContactTags: vi.fn().mockResolvedValue(undefined),
    setCompanyTags: vi.fn().mockResolvedValue(undefined),
    setDealTags: vi.fn().mockResolvedValue(undefined),
    listAttributes: vi.fn().mockResolvedValue([]),
    getAttribute: vi.fn().mockResolvedValue(undefined),
    createAttribute: vi.fn().mockResolvedValue(undefined),
    updateAttribute: vi.fn().mockResolvedValue(undefined),
    deleteAttribute: vi.fn().mockResolvedValue(false),
    listEntityAttributes: vi.fn().mockResolvedValue([]),
    setEntityAttributes: vi.fn().mockResolvedValue(undefined),
    searchEntities: vi
      .fn()
      .mockResolvedValue({ contacts: [], companies: [], deals: [] }),
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

type Role = "viewer" | "agent" | "manager" | "admin";

function roleAuth(roleFor: (token?: string) => Role) {
  return createAuthStub({
    verifySession: async (token?: string) => ({
      userId: `${roleFor(token)}-id`,
      email: "user@example.com",
      name: "User",
      isAdmin: false,
    }),
    authorizeWorkspace: async (userId?: string) => ({
      role: (userId ?? "agent-id").replace(/-id$/, "") as Role,
    }),
  });
}

const bearer = (token: string) => ({ authorization: `Bearer ${token}` });

test("workspace roles enforce the ADR 0015 capability matrix", async () => {
  const workspaceId = randomUUID();
  const contactId = randomUUID();
  const tagId = randomUUID();
  const pipelineId = randomUUID();
  const conversationId = randomUUID();
  const now = new Date("2026-01-01T00:00:00Z");
  const contact = {
    id: contactId,
    name: "Contato",
    email: null,
    phone: null,
    companyId: null,
    createdAt: now,
  };
  const tag = {
    id: tagId,
    name: "Prioridade",
    color: null,
    createdAt: now,
  };
  const pipeline = {
    id: pipelineId,
    name: "Vendas",
    position: "a0",
    createdAt: now,
  };
  const channel = {
    id: randomUUID(),
    workspaceId,
    provider: "waha",
    providerInstanceId: "session-1",
    webhookSecret: "secret",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  const database = createDatabaseStub();
  database.listContacts.mockResolvedValue([contact]);
  database.getContact.mockResolvedValue(contact);
  database.createContact.mockResolvedValue(contact);
  database.updateContact.mockResolvedValue(contact);
  database.deleteContact.mockResolvedValue(true);
  database.createTag.mockResolvedValue(tag);
  database.createPipeline.mockResolvedValue(pipeline);
  database.createChannelInstance.mockResolvedValue(channel);
  database.getConversation.mockResolvedValue({
    id: conversationId,
    workspaceId,
    channelInstanceId: channel.id,
    contactId,
    contactName: "Contato",
    providerThreadId: "5511@c.us",
    epoch: 1,
    createdAt: now,
    updatedAt: now,
  });

  const auth = roleAuth((token) =>
    token === "viewer-token"
      ? "viewer"
      : token === "manager-token"
        ? "manager"
        : token === "admin-token"
          ? "admin"
          : "agent",
  );
  const app = buildApp({ database, auth });
  try {
    // viewer: read-only — every mutation must fail before reaching the DB
    expect(
      (
        await app.inject({
          method: "GET",
          url: `/contacts?workspaceId=${workspaceId}`,
          headers: bearer("viewer-token"),
        })
      ).statusCode,
    ).toBe(200);
    for (const [method, url, payload] of [
      ["POST", `/contacts?workspaceId=${workspaceId}`, { name: "X" }],
      [
        "PATCH",
        `/contacts/${contactId}?workspaceId=${workspaceId}`,
        { name: "Y" },
      ],
      [
        "DELETE",
        `/contacts/${contactId}?workspaceId=${workspaceId}`,
        undefined,
      ],
      [
        "POST",
        `/contacts/${contactId}/notes?workspaceId=${workspaceId}`,
        { body: "n" },
      ],
      [
        "POST",
        `/contacts/${contactId}/tasks?workspaceId=${workspaceId}`,
        { title: "t" },
      ],
      [
        "PUT",
        `/contacts/${contactId}/tags?workspaceId=${workspaceId}`,
        { tagIds: [tagId] },
      ],
      [
        "POST",
        `/deals?workspaceId=${workspaceId}`,
        { pipelineId, stageId: randomUUID(), title: "d" },
      ],
      [
        "POST",
        `/conversations/${conversationId}/messages?workspaceId=${workspaceId}`,
        { body: "oi" },
      ],
      ["POST", `/tags?workspaceId=${workspaceId}`, { name: "t" }],
      ["POST", `/pipelines?workspaceId=${workspaceId}`, { name: "p" }],
      [
        "POST",
        `/channel-instances?workspaceId=${workspaceId}`,
        { provider: "waha", webhookSecret: "s" },
      ],
    ] as const) {
      expect(
        (
          await app.inject({
            method,
            url,
            headers: bearer("viewer-token"),
            ...(payload ? { payload } : {}),
          })
        ).statusCode,
        `${method} ${url} must deny viewer`,
      ).toBe(403);
    }
    expect(database.createContact).not.toHaveBeenCalled();
    expect(database.createTag).not.toHaveBeenCalled();

    // agent: CRM writes, notes/tasks, tag assignment, inbox reply;
    // no deletes and no pipeline/tag/attribute/channel management
    for (const [method, url, payload, expected] of [
      ["POST", `/contacts?workspaceId=${workspaceId}`, { name: "X" }, 201],
      [
        "PATCH",
        `/contacts/${contactId}?workspaceId=${workspaceId}`,
        { name: "Y" },
        200,
      ],
      [
        "DELETE",
        `/contacts/${contactId}?workspaceId=${workspaceId}`,
        undefined,
        403,
      ],
      [
        "POST",
        `/contacts/${contactId}/notes?workspaceId=${workspaceId}`,
        { body: "n" },
        404,
      ],
      [
        "POST",
        `/deals?workspaceId=${workspaceId}`,
        { pipelineId, stageId: randomUUID(), title: "d" },
        404,
      ],
      [
        "POST",
        `/conversations/${conversationId}/messages?workspaceId=${workspaceId}`,
        { body: "oi" },
        404,
      ],
      ["POST", `/tags?workspaceId=${workspaceId}`, { name: "t" }, 403],
      ["POST", `/pipelines?workspaceId=${workspaceId}`, { name: "p" }, 403],
      [
        "POST",
        `/channel-instances?workspaceId=${workspaceId}`,
        { provider: "waha", webhookSecret: "s" },
        403,
      ],
      [
        "DELETE",
        `/tasks/${randomUUID()}?workspaceId=${workspaceId}`,
        undefined,
        403,
      ],
      [
        "DELETE",
        `/notes/${randomUUID()}?workspaceId=${workspaceId}`,
        undefined,
        403,
      ],
      [
        "PUT",
        `/contacts/${contactId}/attributes?workspaceId=${workspaceId}`,
        { values: [] },
        404,
      ],
    ] as const) {
      expect(
        (
          await app.inject({
            method,
            url,
            headers: bearer("token"),
            ...(payload ? { payload } : {}),
          })
        ).statusCode,
        `${method} ${url} agent mismatch`,
      ).toBe(expected);
    }

    // manager: entity deletes + pipeline/tag/attribute/channel management
    for (const [method, url, payload, expected] of [
      [
        "DELETE",
        `/contacts/${contactId}?workspaceId=${workspaceId}`,
        undefined,
        204,
      ],
      ["POST", `/tags?workspaceId=${workspaceId}`, { name: "t" }, 201],
      ["POST", `/pipelines?workspaceId=${workspaceId}`, { name: "p" }, 201],
      [
        "POST",
        `/channel-instances?workspaceId=${workspaceId}`,
        { provider: "waha", webhookSecret: "s" },
        201,
      ],
      [
        "DELETE",
        `/tasks/${randomUUID()}?workspaceId=${workspaceId}`,
        undefined,
        404,
      ],
    ] as const) {
      expect(
        (
          await app.inject({
            method,
            url,
            headers: bearer("manager-token"),
            ...(payload ? { payload } : {}),
          })
        ).statusCode,
        `${method} ${url} manager mismatch`,
      ).toBe(expected);
    }

    // No workspace role grants global administration — /admin/* stays is_admin
    for (const token of ["token", "manager-token", "admin-token"]) {
      expect(
        (
          await app.inject({
            method: "GET",
            url: "/admin/users",
            headers: bearer(token),
          })
        ).statusCode,
      ).toBe(401);
    }
  } finally {
    await app.close();
  }
});

test("platform admin without workspace membership cannot read workspace data", async () => {
  const workspaceId = randomUUID();
  const database = createDatabaseStub();
  const auth = createAuthStub({
    verifySession: async () => ({
      userId: "platform-admin-id",
      email: "root@example.com",
      name: "Root",
      isAdmin: true,
    }),
    authorizeWorkspace: async () => undefined,
  });
  const app = buildApp({ database, auth });
  try {
    for (const url of [
      `/contacts?workspaceId=${workspaceId}`,
      `/conversations?workspaceId=${workspaceId}`,
      `/search?workspaceId=${workspaceId}&q=x`,
    ]) {
      expect(
        (
          await app.inject({
            method: "GET",
            url,
            headers: bearer("token"),
          })
        ).statusCode,
      ).toBe(401);
    }
    expect(database.listContacts).not.toHaveBeenCalled();
    expect(database.listConversations).not.toHaveBeenCalled();
  } finally {
    await app.close();
  }
});
