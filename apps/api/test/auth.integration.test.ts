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
    listMembers: vi.fn().mockResolvedValue([]),
    addMembership: vi.fn().mockResolvedValue("not-found"),
    updateMembershipRole: vi.fn().mockResolvedValue("not-found"),
    removeMembership: vi.fn().mockResolvedValue("not-found"),
    ensureAdmin: vi.fn().mockResolvedValue(false),
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
    claimDispatchIntent: vi.fn().mockResolvedValue({ kind: "missing" }),
    settleDispatch: vi.fn().mockResolvedValue({ kind: "settled" }),
    reapExpiredDispatches: vi.fn().mockResolvedValue({ reaped: 0 }),
    recordDeliveryStatus: vi.fn().mockResolvedValue({ kind: "recorded" }),
    listPendingIntents: vi.fn().mockResolvedValue([]),
  };
}

test("liveness exposes only its public contract and unknown routes return 404", async () => {
  const app = buildApp();
  try {
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
    expect((await app.inject("/contacts")).statusCode).toBe(404);
  } finally {
    await app.close();
  }
}, 15000);

test("contacts require an authenticated workspace membership", async () => {
  const workspaceId = randomUUID();
  const database = createDatabaseStub();
  const auth = createAuthStub();
  const app = buildApp({ database, auth });
  try {
    expect(
      (await app.inject(`/contacts?workspaceId=${workspaceId}`)).statusCode,
    ).toBe(401);
    expect(database.listContacts).not.toHaveBeenCalled();
  } finally {
    await app.close();
  }
});

test("contacts use the authorized workspace", async () => {
  const workspaceId = randomUUID();
  const userId = randomUUID();
  const contact = {
    id: randomUUID(),
    name: "Contact",
    email: null,
    phone: null,
    createdAt: new Date(),
  };
  const database = createDatabaseStub();
  database.listContacts.mockResolvedValue([contact]);
  const auth = createAuthStub({
    verifySession: async () => ({
      userId,
      email: "user@example.com",
      name: "User",
      isAdmin: false,
    }),
    authorizeWorkspace: async () => ({ role: "member" }),
  });
  const app = buildApp({ database, auth });
  try {
    const response = await app.inject({
      method: "GET",
      url: `/contacts?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([
      { ...contact, createdAt: contact.createdAt.toISOString() },
    ]);
    expect(database.listContacts).toHaveBeenCalledOnce();
    expect(database.listContacts).toHaveBeenCalledWith(workspaceId);
  } finally {
    await app.close();
  }
});

test("contacts reject an authenticated user without workspace membership", async () => {
  const workspaceId = randomUUID();
  const userId = randomUUID();
  const database = createDatabaseStub();
  const auth = createAuthStub({
    verifySession: async () => ({
      userId,
      email: "user@example.com",
      name: "User",
      isAdmin: false,
    }),
  });
  const app = buildApp({ database, auth });
  try {
    const response = await app.inject({
      method: "GET",
      url: `/contacts?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
    });
    expect(response.statusCode).toBe(401);
    expect(database.listContacts).not.toHaveBeenCalled();
  } finally {
    await app.close();
  }
});

test("admin endpoint creates a user when caller is admin", async () => {
  const userId = randomUUID();
  const createUser = vi.fn().mockResolvedValue({ userId });
  const auth = createAuthStub({
    verifySession: async () => ({
      userId: "admin-id",
      email: "admin@example.com",
      name: "User",
      isAdmin: true,
    }),
    createUser,
  });
  const app = buildApp({ database: createDatabaseStub(), auth });
  try {
    const response = await app.inject({
      method: "POST",
      url: "/admin/users",
      headers: { authorization: "Bearer admin-token" },
      payload: {
        email: "new@example.com",
        name: "New User",
        password: "new-password",
      },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ userId });
    expect(createUser).toHaveBeenCalledWith({
      email: "new@example.com",
      name: "New User",
      password: "new-password",
      workspaceId: undefined,
      role: undefined,
    });
  } finally {
    await app.close();
  }
});

test("admin endpoint rejects non-admin callers", async () => {
  const auth = createAuthStub({
    verifySession: async () => ({
      userId: "member-id",
      email: "member@example.com",
      name: "User",
      isAdmin: false,
    }),
  });
  const app = buildApp({ database: createDatabaseStub(), auth });
  try {
    const response = await app.inject({
      method: "POST",
      url: "/admin/users",
      headers: { authorization: "Bearer member-token" },
      payload: {
        email: "new@example.com",
        name: "New User",
        password: "new-password",
      },
    });
    expect(response.statusCode).toBe(401);
  } finally {
    await app.close();
  }
});

test("members can create, read and update contacts in their workspace", async () => {
  const workspaceId = randomUUID();
  const userId = randomUUID();
  const contact = {
    id: randomUUID(),
    name: "Contact",
    email: "contact@example.com",
    phone: null,
    createdAt: new Date(),
  };
  const database = createDatabaseStub();
  database.createContact.mockResolvedValue(contact);
  database.getContact.mockResolvedValue(contact);
  database.updateContact.mockResolvedValue({ ...contact, name: "Renamed" });
  const auth = createAuthStub({
    verifySession: async () => ({
      userId,
      email: "user@example.com",
      name: "User",
      isAdmin: false,
    }),
    authorizeWorkspace: async () => ({ role: "member" }),
  });
  const app = buildApp({ database, auth });
  try {
    const created = await app.inject({
      method: "POST",
      url: `/contacts?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
      payload: { name: "Contact", email: "contact@example.com" },
    });
    expect(created.statusCode).toBe(201);
    expect(created.json()).toEqual({
      ...contact,
      createdAt: contact.createdAt.toISOString(),
    });
    expect(database.createContact).toHaveBeenCalledWith(workspaceId, {
      name: "Contact",
      email: "contact@example.com",
    });

    const fetched = await app.inject({
      method: "GET",
      url: `/contacts/${contact.id}?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
    });
    expect(fetched.statusCode).toBe(200);

    const updated = await app.inject({
      method: "PATCH",
      url: `/contacts/${contact.id}?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
      payload: { name: "Renamed" },
    });
    expect(updated.statusCode).toBe(200);
    expect(updated.json().name).toBe("Renamed");
    expect(database.updateContact).toHaveBeenCalledWith(
      workspaceId,
      contact.id,
      { name: "Renamed" },
    );
  } finally {
    await app.close();
  }
});

test("contact mutations reject unauthenticated requests and missing rows return 404", async () => {
  const workspaceId = randomUUID();
  const userId = randomUUID();
  const contactId = randomUUID();
  const database = createDatabaseStub();
  const auth = createAuthStub({
    verifySession: async (token?: string) =>
      token === "member-token"
        ? { userId, email: "user@example.com", name: "User", isAdmin: false }
        : undefined,
    authorizeWorkspace: async () => ({ role: "member" }),
  });
  const app = buildApp({ database, auth });
  try {
    expect(
      (
        await app.inject({
          method: "POST",
          url: `/contacts?workspaceId=${workspaceId}`,
          payload: { name: "Nope" },
        })
      ).statusCode,
    ).toBe(401);
    expect(database.createContact).not.toHaveBeenCalled();

    expect(
      (
        await app.inject({
          method: "GET",
          url: `/contacts/${contactId}?workspaceId=${workspaceId}`,
          headers: { authorization: "Bearer member-token" },
        })
      ).statusCode,
    ).toBe(404);
    expect(
      (
        await app.inject({
          method: "PATCH",
          url: `/contacts/${contactId}?workspaceId=${workspaceId}`,
          headers: { authorization: "Bearer member-token" },
          payload: { name: "Renamed" },
        })
      ).statusCode,
    ).toBe(404);
  } finally {
    await app.close();
  }
});

test("only workspace admins can delete contacts", async () => {
  const workspaceId = randomUUID();
  const contactId = randomUUID();
  const database = createDatabaseStub();
  database.deleteContact.mockResolvedValue(true);
  const auth = createAuthStub({
    verifySession: async (token?: string) => ({
      userId: token === "admin-token" ? "admin-id" : "member-id",
      email: "user@example.com",
      name: "User",
      isAdmin: false,
    }),
    authorizeWorkspace: async (userId?: string) => ({
      role: userId === "admin-id" ? "admin" : "member",
    }),
  });
  const app = buildApp({ database, auth });
  try {
    const denied = await app.inject({
      method: "DELETE",
      url: `/contacts/${contactId}?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer member-token" },
    });
    expect(denied.statusCode).toBe(403);
    expect(database.deleteContact).not.toHaveBeenCalled();

    const deleted = await app.inject({
      method: "DELETE",
      url: `/contacts/${contactId}?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer admin-token" },
    });
    expect(deleted.statusCode).toBe(204);
    expect(database.deleteContact).toHaveBeenCalledWith(workspaceId, contactId);

    database.deleteContact.mockResolvedValue(false);
    const missing = await app.inject({
      method: "DELETE",
      url: `/contacts/${contactId}?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer admin-token" },
    });
    expect(missing.statusCode).toBe(404);
  } finally {
    await app.close();
  }
});

test("companies follow the same workspace membership contract", async () => {
  const workspaceId = randomUUID();
  const userId = randomUUID();
  const company = {
    id: randomUUID(),
    name: "Company",
    createdAt: new Date(),
  };
  const database = createDatabaseStub();
  database.createCompany.mockResolvedValue(company);
  database.getCompany.mockResolvedValue(company);
  database.updateCompany.mockResolvedValue({ ...company, name: "Renamed" });
  database.deleteCompany.mockResolvedValue(true);
  const auth = createAuthStub({
    verifySession: async (token?: string) =>
      token
        ? { userId, email: "user@example.com", name: "User", isAdmin: false }
        : undefined,
    authorizeWorkspace: async (_userId?: string, wsId?: string) =>
      wsId === workspaceId ? { role: "admin" } : undefined,
  });
  const app = buildApp({ database, auth });
  try {
    expect(
      (
        await app.inject({
          method: "POST",
          url: `/companies?workspaceId=${workspaceId}`,
          payload: { name: "Nope" },
        })
      ).statusCode,
    ).toBe(401);
    expect(database.createCompany).not.toHaveBeenCalled();

    const otherWorkspace = randomUUID();
    expect(
      (
        await app.inject({
          method: "GET",
          url: `/companies/${company.id}?workspaceId=${otherWorkspace}`,
          headers: { authorization: "Bearer token" },
        })
      ).statusCode,
    ).toBe(401);
    expect(database.getCompany).not.toHaveBeenCalled();

    const created = await app.inject({
      method: "POST",
      url: `/companies?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
      payload: { name: "Company" },
    });
    expect(created.statusCode).toBe(201);
    expect(created.json()).toEqual({
      ...company,
      createdAt: company.createdAt.toISOString(),
    });

    const updated = await app.inject({
      method: "PATCH",
      url: `/companies/${company.id}?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
      payload: { name: "Renamed" },
    });
    expect(updated.statusCode).toBe(200);
    expect(updated.json().name).toBe("Renamed");

    const deleted = await app.inject({
      method: "DELETE",
      url: `/companies/${company.id}?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
    });
    expect(deleted.statusCode).toBe(204);
    expect(database.deleteCompany).toHaveBeenCalledWith(
      workspaceId,
      company.id,
    );

    database.deleteCompany.mockResolvedValue(false);
    expect(
      (
        await app.inject({
          method: "DELETE",
          url: `/companies/${company.id}?workspaceId=${workspaceId}`,
          headers: { authorization: "Bearer token" },
        })
      ).statusCode,
    ).toBe(404);
  } finally {
    await app.close();
  }
});

test("admin management routes require a global admin session", async () => {
  const database = createDatabaseStub();
  const auth = createAuthStub({
    verifySession: async (token?: string) =>
      token === "admin-token"
        ? {
            userId: "admin-id",
            email: "admin@example.com",
            name: "User",
            isAdmin: true,
          }
        : token === "member-token"
          ? {
              userId: "member-id",
              email: "m@example.com",
              name: "User",
              isAdmin: false,
            }
          : undefined,
  });
  const app = buildApp({ database, auth });
  try {
    expect((await app.inject("/admin/users")).statusCode).toBe(401);
    expect(auth.listUsers).not.toHaveBeenCalled();
    expect(
      (
        await app.inject({
          method: "GET",
          url: "/admin/workspaces",
          headers: { authorization: "Bearer member-token" },
        })
      ).statusCode,
    ).toBe(401);
    expect(database.listWorkspaces).not.toHaveBeenCalled();
  } finally {
    await app.close();
  }
});

test("me/workspaces lists the caller's workspace memberships", async () => {
  const workspaceId = randomUUID();
  const auth = createAuthStub({
    verifySession: async (token?: string) =>
      token === "token"
        ? {
            userId: "user-id",
            email: "user@example.com",
            name: "User",
            isAdmin: false,
          }
        : undefined,
    listUserWorkspaces: vi.fn(async () => [
      { workspaceId, workspaceName: "Workspace", role: "member" as const },
    ]),
  });
  const app = buildApp({ database: createDatabaseStub(), auth });
  try {
    expect((await app.inject("/me/workspaces")).statusCode).toBe(401);
    expect(auth.listUserWorkspaces).not.toHaveBeenCalled();
    const response = await app.inject({
      method: "GET",
      url: "/me/workspaces",
      headers: { authorization: "Bearer token" },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([
      { workspaceId, workspaceName: "Workspace", role: "member" },
    ]);
    expect(auth.listUserWorkspaces).toHaveBeenCalledWith("user-id");
  } finally {
    await app.close();
  }
});

test("admin management covers users, organizations, workspaces and memberships", async () => {
  const orgId = randomUUID();
  const workspaceId = randomUUID();
  const userId = randomUUID();
  const membershipId = randomUUID();
  const admin = { authorization: "Bearer admin-token" };
  const database = createDatabaseStub();
  database.createOrganization.mockResolvedValue({ id: orgId });
  database.createWorkspace.mockResolvedValue({ id: workspaceId });
  const auth = createAuthStub({
    verifySession: async (token?: string) =>
      token === "admin-token"
        ? {
            userId: "admin-id",
            email: "admin@example.com",
            name: "User",
            isAdmin: true,
          }
        : undefined,
    listUsers: vi.fn(async () => [
      {
        id: userId,
        email: "user@example.com",
        name: "User",
        isAdmin: false,
        active: true,
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
    ]),
    listMembers: vi.fn(async () => [
      {
        id: membershipId,
        userId,
        role: "member" as const,
        email: "user@example.com",
        name: "User",
      },
    ]),
  });
  const app = buildApp({ database, auth });
  try {
    const users = await app.inject({
      method: "GET",
      url: "/admin/users",
      headers: admin,
    });
    expect(users.statusCode).toBe(200);
    expect(users.json()[0].email).toBe("user@example.com");

    auth.updateUser.mockResolvedValue("updated");
    expect(
      (
        await app.inject({
          method: "PATCH",
          url: `/admin/users/${userId}`,
          headers: admin,
          payload: { active: false },
        })
      ).statusCode,
    ).toBe(204);
    expect(auth.updateUser).toHaveBeenCalledWith(userId, {
      name: undefined,
      active: false,
    });
    auth.updateUser.mockResolvedValue("last-admin");
    expect(
      (
        await app.inject({
          method: "PATCH",
          url: `/admin/users/${userId}`,
          headers: admin,
          payload: { active: false },
        })
      ).statusCode,
    ).toBe(409);

    const org = await app.inject({
      method: "POST",
      url: "/admin/organizations",
      headers: admin,
      payload: { name: "Org" },
    });
    expect(org.statusCode).toBe(201);
    expect(org.json()).toEqual({ id: orgId });

    const workspace = await app.inject({
      method: "POST",
      url: "/admin/workspaces",
      headers: admin,
      payload: { orgId, name: "Workspace" },
    });
    expect(workspace.statusCode).toBe(201);
    expect(workspace.json()).toEqual({ id: workspaceId });
    database.createWorkspace.mockResolvedValue(undefined);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/admin/workspaces",
          headers: admin,
          payload: { orgId: randomUUID(), name: "Nope" },
        })
      ).statusCode,
    ).toBe(404);

    const members = await app.inject({
      method: "GET",
      url: `/admin/workspaces/${workspaceId}/members`,
      headers: admin,
    });
    expect(members.statusCode).toBe(200);
    expect(members.json()[0].role).toBe("member");
    expect(auth.listMembers).toHaveBeenCalledWith(workspaceId);

    auth.addMembership.mockResolvedValue("created");
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/admin/memberships",
          headers: admin,
          payload: { userId, workspaceId, role: "member" },
        })
      ).statusCode,
    ).toBe(201);
    auth.addMembership.mockResolvedValue("duplicate");
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/admin/memberships",
          headers: admin,
          payload: { userId, workspaceId, role: "member" },
        })
      ).statusCode,
    ).toBe(409);
    auth.addMembership.mockResolvedValue("not-found");
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/admin/memberships",
          headers: admin,
          payload: {
            userId: randomUUID(),
            workspaceId,
            role: "member",
          },
        })
      ).statusCode,
    ).toBe(404);

    auth.updateMembershipRole.mockResolvedValue("updated");
    expect(
      (
        await app.inject({
          method: "PATCH",
          url: `/admin/memberships/${membershipId}?workspaceId=${workspaceId}`,
          headers: admin,
          payload: { role: "admin" },
        })
      ).statusCode,
    ).toBe(204);
    expect(auth.updateMembershipRole).toHaveBeenCalledWith(
      workspaceId,
      membershipId,
      "admin",
    );
    auth.updateMembershipRole.mockResolvedValue("last-admin");
    expect(
      (
        await app.inject({
          method: "PATCH",
          url: `/admin/memberships/${membershipId}?workspaceId=${workspaceId}`,
          headers: admin,
          payload: { role: "member" },
        })
      ).statusCode,
    ).toBe(409);

    auth.removeMembership.mockResolvedValue("removed");
    expect(
      (
        await app.inject({
          method: "DELETE",
          url: `/admin/memberships/${membershipId}?workspaceId=${workspaceId}`,
          headers: admin,
        })
      ).statusCode,
    ).toBe(204);
    auth.removeMembership.mockResolvedValue("last-admin");
    expect(
      (
        await app.inject({
          method: "DELETE",
          url: `/admin/memberships/${membershipId}?workspaceId=${workspaceId}`,
          headers: admin,
        })
      ).statusCode,
    ).toBe(409);
  } finally {
    await app.close();
  }
});

test("pipelines, stages and deals enforce auth and membership", async () => {
  const workspaceId = randomUUID();
  const database = createDatabaseStub();
  const auth = createAuthStub();
  const app = buildApp({ database, auth });
  try {
    for (const url of [
      `/pipelines?workspaceId=${workspaceId}`,
      `/deals?workspaceId=${workspaceId}&pipelineId=${randomUUID()}`,
    ]) {
      expect((await app.inject(url)).statusCode).toBe(401);
    }
    expect(database.listPipelines).not.toHaveBeenCalled();
    expect(database.listDeals).not.toHaveBeenCalled();
  } finally {
    await app.close();
  }
});

test("pipeline CRUD roundtrips through the authorized workspace", async () => {
  const workspaceId = randomUUID();
  const pipelineId = randomUUID();
  const database = createDatabaseStub();
  const auth = createAuthStub({
    verifySession: async () => ({
      userId: randomUUID(),
      email: "admin@example.com",
      name: "User",
      isAdmin: false,
    }),
    authorizeWorkspace: async () => ({ role: "admin" }),
  });
  const app = buildApp({ database, auth });
  try {
    const pipeline = {
      id: pipelineId,
      name: "Vendas",
      position: "a0",
      createdAt: new Date("2026-01-01T00:00:00Z"),
    };
    database.createPipeline.mockResolvedValue(pipeline);
    const created = await app.inject({
      method: "POST",
      url: `/pipelines?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
      payload: { name: "Vendas" },
    });
    expect(created.statusCode).toBe(201);
    expect(created.json().id).toBe(pipelineId);
    expect(database.createPipeline).toHaveBeenCalledWith(workspaceId, {
      name: "Vendas",
    });

    database.updatePipeline.mockResolvedValue({
      ...pipeline,
      name: "Renamed",
    });
    expect(
      (
        await app.inject({
          method: "PATCH",
          url: `/pipelines/${pipelineId}?workspaceId=${workspaceId}`,
          headers: { authorization: "Bearer token" },
          payload: { name: "Renamed" },
        })
      ).statusCode,
    ).toBe(200);

    database.deletePipeline.mockResolvedValue("has-deals");
    expect(
      (
        await app.inject({
          method: "DELETE",
          url: `/pipelines/${pipelineId}?workspaceId=${workspaceId}`,
          headers: { authorization: "Bearer token" },
        })
      ).statusCode,
    ).toBe(409);
    database.deletePipeline.mockResolvedValue("deleted");
    expect(
      (
        await app.inject({
          method: "DELETE",
          url: `/pipelines/${pipelineId}?workspaceId=${workspaceId}`,
          headers: { authorization: "Bearer token" },
        })
      ).statusCode,
    ).toBe(204);
  } finally {
    await app.close();
  }
});

test("stages and deals reject members for delete and 404 on invalid refs", async () => {
  const workspaceId = randomUUID();
  const pipelineId = randomUUID();
  const stageId = randomUUID();
  const database = createDatabaseStub();
  const auth = createAuthStub({
    verifySession: async () => ({
      userId: randomUUID(),
      email: "member@example.com",
      name: "User",
      isAdmin: false,
    }),
    authorizeWorkspace: async () => ({ role: "member" }),
  });
  const app = buildApp({ database, auth });
  try {
    expect(
      (
        await app.inject({
          method: "DELETE",
          url: `/stages/${stageId}?workspaceId=${workspaceId}`,
          headers: { authorization: "Bearer token" },
        })
      ).statusCode,
    ).toBe(403);
    expect(
      (
        await app.inject({
          method: "DELETE",
          url: `/deals/${randomUUID()}?workspaceId=${workspaceId}`,
          headers: { authorization: "Bearer token" },
        })
      ).statusCode,
    ).toBe(403);

    // createStage returns undefined when the pipeline does not exist / is cross-workspace
    expect(
      (
        await app.inject({
          method: "POST",
          url: `/pipelines/${pipelineId}/stages?workspaceId=${workspaceId}`,
          headers: { authorization: "Bearer token" },
          payload: { name: "Qualificação" },
        })
      ).statusCode,
    ).toBe(404);

    // createDeal returns undefined when stage/contact/company refs are invalid
    expect(
      (
        await app.inject({
          method: "POST",
          url: `/deals?workspaceId=${workspaceId}`,
          headers: { authorization: "Bearer token" },
          payload: { pipelineId, stageId, title: "Deal" },
        })
      ).statusCode,
    ).toBe(404);
  } finally {
    await app.close();
  }
});

test("deal move forwards stage and neighbor positions to the database", async () => {
  const workspaceId = randomUUID();
  const dealId = randomUUID();
  const stageId = randomUUID();
  const prevId = randomUUID();
  const nextId = randomUUID();
  const database = createDatabaseStub();
  const moved = {
    id: dealId,
    pipelineId: randomUUID(),
    stageId,
    title: "Deal",
    valueCents: null,
    contactId: null,
    companyId: null,
    position: "a1",
    createdAt: new Date("2026-01-01T00:00:00Z"),
  };
  database.moveDeal.mockResolvedValue(moved);
  const auth = createAuthStub({
    verifySession: async () => ({
      userId: randomUUID(),
      email: "member@example.com",
      name: "User",
      isAdmin: false,
    }),
    authorizeWorkspace: async () => ({ role: "member" }),
  });
  const app = buildApp({ database, auth });
  try {
    const response = await app.inject({
      method: "POST",
      url: `/deals/${dealId}/move?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
      payload: { stageId, prevDealId: prevId, nextDealId: nextId },
    });
    expect(response.statusCode).toBe(200);
    expect(database.moveDeal).toHaveBeenCalledWith(workspaceId, dealId, {
      stageId,
      prevDealId: prevId,
      nextDealId: nextId,
    });
    database.moveDeal.mockResolvedValue(undefined);
    expect(
      (
        await app.inject({
          method: "POST",
          url: `/deals/${dealId}/move?workspaceId=${workspaceId}`,
          headers: { authorization: "Bearer token" },
          payload: { stageId: randomUUID() },
        })
      ).statusCode,
    ).toBe(404);
  } finally {
    await app.close();
  }
});

test("GET /me returns the session identity and 401s without a token", async () => {
  const userId = randomUUID();
  const auth = createAuthStub({
    verifySession: async () => ({
      userId,
      email: "admin@example.com",
      name: "Admin",
      isAdmin: true,
    }),
  });
  const app = buildApp({ database: createDatabaseStub(), auth });
  try {
    expect((await app.inject("/me")).statusCode).toBe(401);
    const response = await app.inject({
      method: "GET",
      url: "/me",
      headers: { authorization: "Bearer token" },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      userId,
      email: "admin@example.com",
      name: "Admin",
      isAdmin: true,
    });
  } finally {
    await app.close();
  }
});

test("channel instances and inbox require authenticated workspace membership", async () => {
  const workspaceId = randomUUID();
  const conversationId = randomUUID();
  const database = createDatabaseStub();
  const auth = createAuthStub();
  const app = buildApp({ database, auth });
  try {
    for (const url of [
      `/channel-instances?workspaceId=${workspaceId}`,
      `/conversations?workspaceId=${workspaceId}`,
      `/conversations/${conversationId}/messages?workspaceId=${workspaceId}`,
    ]) {
      expect((await app.inject(url)).statusCode).toBe(401);
    }
    expect(database.listChannelInstances).not.toHaveBeenCalled();
    expect(database.listConversations).not.toHaveBeenCalled();
    expect(database.listMessages).not.toHaveBeenCalled();
  } finally {
    await app.close();
  }
});

test("inbox routes forward the authorized workspace to the database", async () => {
  const workspaceId = randomUUID();
  const conversationId = randomUUID();
  const messageId = randomUUID();
  const now = new Date("2026-01-01T00:00:00Z");
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
  const conversation = {
    id: conversationId,
    workspaceId,
    channelInstanceId: channel.id,
    contactId: null,
    contactName: "55119999",
    providerThreadId: "55119999@c.us",
    epoch: 1,
    createdAt: now,
    updatedAt: now,
  };
  const message = {
    id: messageId,
    workspaceId,
    conversationId,
    providerMessageId: "msg-1",
    direction: "inbound",
    status: "received",
    contentType: "text",
    body: "hello",
    createdAt: now,
  };
  const database = createDatabaseStub();
  database.createChannelInstance.mockResolvedValue(channel);
  database.listChannelInstances.mockResolvedValue([channel]);
  database.listConversations.mockResolvedValue([conversation]);
  database.getConversation.mockResolvedValue(conversation);
  database.listMessages.mockResolvedValue([message]);
  const auth = createAuthStub({
    verifySession: async () => ({
      userId: randomUUID(),
      email: "user@example.com",
      name: "User",
      isAdmin: false,
    }),
    authorizeWorkspace: async () => ({ role: "member" }),
  });
  const app = buildApp({ database, auth });
  try {
    const created = await app.inject({
      method: "POST",
      url: `/channel-instances?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
      payload: {
        provider: "waha",
        providerInstanceId: "session-1",
        webhookSecret: "secret",
      },
    });
    expect(created.statusCode).toBe(201);
    expect(database.createChannelInstance).toHaveBeenCalledWith(workspaceId, {
      provider: "waha",
      providerInstanceId: "session-1",
      webhookSecret: "secret",
    });

    const instances = await app.inject({
      method: "GET",
      url: `/channel-instances?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
    });
    expect(instances.statusCode).toBe(200);
    expect(database.listChannelInstances).toHaveBeenCalledWith(workspaceId);

    const conversations = await app.inject({
      method: "GET",
      url: `/conversations?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
    });
    expect(conversations.statusCode).toBe(200);
    expect(database.listConversations).toHaveBeenCalledWith(workspaceId);

    const messages = await app.inject({
      method: "GET",
      url: `/conversations/${conversationId}/messages?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
    });
    expect(messages.statusCode).toBe(200);
    expect(messages.json()[0].body).toBe("hello");
    expect(database.getConversation).toHaveBeenCalledWith(
      workspaceId,
      conversationId,
    );
    expect(database.listMessages).toHaveBeenCalledWith(
      workspaceId,
      conversationId,
    );

    database.getConversation.mockResolvedValue(undefined);
    const missing = await app.inject({
      method: "GET",
      url: `/conversations/${randomUUID()}/messages?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
    });
    expect(missing.statusCode).toBe(404);
  } finally {
    await app.close();
  }
});

test("POST /conversations/:id/messages commits the intent and settles dispatch", async () => {
  const workspaceId = randomUUID();
  const conversationId = randomUUID();
  const intentId = randomUUID();
  const messageId = randomUUID();
  const now = new Date("2026-01-01T00:00:00Z");
  const sentMessage = {
    id: messageId,
    workspaceId,
    conversationId,
    providerMessageId: "waha-msg-1",
    direction: "outbound",
    status: "sent",
    contentType: "text",
    body: "hi there",
    createdAt: now,
  };
  const database = createDatabaseStub();
  database.createOutboundIntent.mockResolvedValue({
    kind: "created",
    intentId,
    messageId,
  });
  database.claimDispatchIntent.mockResolvedValue({
    kind: "claimed",
    attemptId: randomUUID(),
    fencingToken: randomUUID(),
    messageId,
    body: "hi there",
    to: "55119999@c.us",
    session: "sales",
  });
  // The dispatcher drains pending intents in rounds — return the intent once,
  // then an empty queue so the burst terminates.
  database.listPendingIntents
    .mockResolvedValueOnce([{ id: intentId }])
    .mockResolvedValue([]);
  database.settleDispatch.mockResolvedValue({ kind: "settled" });
  database.listMessages.mockResolvedValue([sentMessage]);
  const auth = createAuthStub({
    verifySession: async () => ({
      userId: randomUUID(),
      email: "user@example.com",
      name: "User",
      isAdmin: false,
    }),
    authorizeWorkspace: async () => ({ role: "member" }),
  });
  const send = vi.fn(async () => ({
    kind: "sent" as const,
    providerMessageId: "waha-msg-1",
  }));
  const app = buildApp({
    database,
    auth,
    messaging: {
      waha: {
        name: "waha",
        capabilities: {
          sendIdempotency: "none",
          reconciliation: "webhook",
          presenceSignals: false,
          readReceipts: false,
          lidResolution: false,
        },
        verifyWebhook: () => true,
        normalizeEvent: () => ({ kind: "unknown" }),
        send,
      },
    },
  });
  try {
    const unauthorized = await app.inject({
      method: "POST",
      url: `/conversations/${conversationId}/messages?workspaceId=${workspaceId}`,
      payload: { body: "hi there" },
    });
    expect(unauthorized.statusCode).toBe(401);
    expect(database.createOutboundIntent).not.toHaveBeenCalled();

    const response = await app.inject({
      method: "POST",
      url: `/conversations/${conversationId}/messages?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
      payload: { body: "hi there" },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      id: messageId,
      status: "sent",
      providerMessageId: "waha-msg-1",
      direction: "outbound",
    });
    expect(database.createOutboundIntent).toHaveBeenCalledWith(workspaceId, {
      conversationId,
      body: "hi there",
    });
    // The send now runs in the background dispatcher (ADR 0013) — wait for
    // the asynchronous claim → send → settle cycle to complete.
    await vi.waitFor(() => {
      expect(database.claimDispatchIntent).toHaveBeenCalledWith(
        workspaceId,
        intentId,
        { leaseMs: 60_000 },
      );
      expect(send).toHaveBeenCalledWith({
        session: "sales",
        to: "55119999@c.us",
        content: { type: "text", text: "hi there" },
      });
      expect(database.settleDispatch).toHaveBeenCalledWith(
        workspaceId,
        expect.objectContaining({
          intentId,
          outcome: "succeeded",
          providerMessageId: "waha-msg-1",
        }),
      );
    });
  } finally {
    await app.close();
  }
});

test("POST /conversations/:id/messages 404s for a missing conversation and maps provider outcomes", async () => {
  const workspaceId = randomUUID();
  const conversationId = randomUUID();
  const intentId = randomUUID();
  const attemptId = randomUUID();
  const fencingToken = randomUUID();
  const database = createDatabaseStub();
  database.createOutboundIntent.mockResolvedValue({ kind: "missing" });
  const auth = createAuthStub({
    verifySession: async () => ({
      userId: randomUUID(),
      email: "user@example.com",
      name: "User",
      isAdmin: false,
    }),
    authorizeWorkspace: async () => ({ role: "member" }),
  });
  const send = vi.fn(async () => ({
    kind: "unknown" as const,
    reason: "timeout",
  }));
  const app = buildApp({
    database,
    auth,
    messaging: {
      waha: {
        name: "waha",
        capabilities: {
          sendIdempotency: "none",
          reconciliation: "webhook",
          presenceSignals: false,
          readReceipts: false,
          lidResolution: false,
        },
        verifyWebhook: () => true,
        normalizeEvent: () => ({ kind: "unknown" }),
        send,
      },
    },
  });
  try {
    const missing = await app.inject({
      method: "POST",
      url: `/conversations/${conversationId}/messages?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
      payload: { body: "hello" },
    });
    expect(missing.statusCode).toBe(404);

    const messageId = randomUUID();
    database.createOutboundIntent.mockResolvedValue({
      kind: "created",
      intentId,
      messageId,
    });
    database.claimDispatchIntent.mockResolvedValue({
      kind: "claimed",
      attemptId,
      fencingToken,
      messageId,
      body: "hello",
      to: "5511@c.us",
      session: "s",
    });
    database.listPendingIntents
      .mockResolvedValueOnce([{ id: intentId }])
      .mockResolvedValue([]);
    database.listMessages.mockResolvedValue([
      {
        id: messageId,
        workspaceId,
        conversationId,
        providerMessageId: null,
        direction: "outbound",
        status: "unknown",
        contentType: "text",
        body: "hello",
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
    ]);
    const response = await app.inject({
      method: "POST",
      url: `/conversations/${conversationId}/messages?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
      payload: { body: "hello" },
    });
    expect(response.statusCode).toBe(201);
    await vi.waitFor(() => {
      expect(database.settleDispatch).toHaveBeenCalledWith(
        workspaceId,
        expect.objectContaining({
          intentId,
          attemptId,
          fencingToken,
          outcome: "unknown",
          error: "timeout",
        }),
      );
    });
  } finally {
    await app.close();
  }
});

test("POST /webhooks/waha routes message.ack to recordDeliveryStatus", async () => {
  const workspaceId = randomUUID();
  const channelInstanceId = randomUUID();
  const database = createDatabaseStub();
  database.getChannelInstance.mockResolvedValue({
    id: channelInstanceId,
    workspaceId,
    provider: "waha",
    providerInstanceId: "session-1",
    webhookSecret: "secret",
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  });
  const auth = createAuthStub();
  const normalizeEvent = vi.fn(() => ({
    kind: "status" as const,
    providerThreadId: "55119999@c.us",
    providerMessageId: "waha-msg-1",
    providerEventId: "evt-ack-1",
    providerEventKind: "ack.READ",
    status: "READ",
  }));
  const app = buildApp({
    database,
    auth,
    messaging: {
      waha: {
        name: "waha",
        capabilities: {
          sendIdempotency: "none",
          reconciliation: "webhook",
          presenceSignals: false,
          readReceipts: false,
          lidResolution: false,
        },
        verifyWebhook: () => true,
        normalizeEvent,
        send: async () => ({ kind: "blocked" as const, reason: "unused" }),
      },
    },
  });
  try {
    database.recordDeliveryStatus.mockResolvedValue({
      kind: "applied",
      messageId: randomUUID(),
      status: "read",
    });
    const applied = await app.inject({
      method: "POST",
      url: `/webhooks/waha/${workspaceId}/${channelInstanceId}`,
      payload: { event: "message.ack", session: "session-1" },
    });
    expect(applied.statusCode).toBe(200);
    expect(applied.json()).toEqual({ received: true });
    expect(database.recordDeliveryStatus).toHaveBeenCalledWith(
      workspaceId,
      expect.objectContaining({
        channelInstanceId,
        providerMessageId: "waha-msg-1",
        providerEventId: "evt-ack-1",
        providerEventKind: "ack.READ",
        status: "READ",
        signatureVerified: true,
      }),
    );
    expect(database.receiveInboundMessage).not.toHaveBeenCalled();

    database.recordDeliveryStatus.mockResolvedValue({ kind: "recorded" });
    const recorded = await app.inject({
      method: "POST",
      url: `/webhooks/waha/${workspaceId}/${channelInstanceId}`,
      payload: { event: "message.ack", session: "session-1" },
    });
    expect(recorded.statusCode).toBe(200);
    expect(recorded.json()).toEqual({ received: false });

    // Events from another WAHA session are dropped before normalization.
    const otherSession = await app.inject({
      method: "POST",
      url: `/webhooks/waha/${workspaceId}/${channelInstanceId}`,
      payload: { event: "message.ack", session: "someone-else" },
    });
    expect(otherSession.statusCode).toBe(200);
    expect(database.recordDeliveryStatus).toHaveBeenCalledTimes(2);
  } finally {
    await app.close();
  }
});

test("POST /webhooks/waha resolves lid senders to a real phone", async () => {
  const workspaceId = randomUUID();
  const channelInstanceId = randomUUID();
  const database = createDatabaseStub();
  database.getChannelInstance.mockResolvedValue({
    id: channelInstanceId,
    workspaceId,
    provider: "waha",
    providerInstanceId: "session-1",
    webhookSecret: "secret",
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  });
  database.receiveInboundMessage.mockResolvedValue({ kind: "received" });
  const resolveLid = vi.fn(async () => "5516999887766@c.us");
  const app = buildApp({
    database,
    auth: createAuthStub(),
    messaging: {
      waha: {
        name: "waha",
        capabilities: {
          sendIdempotency: "none",
          reconciliation: "webhook",
          presenceSignals: true,
          readReceipts: true,
          lidResolution: true,
        },
        verifyWebhook: () => true,
        normalizeEvent: () => ({
          kind: "message" as const,
          providerThreadId: "122930570739927@lid",
          providerMessageId: "waha-lid-1",
          providerEventId: "evt-lid-1",
          providerEventKind: "message",
          sender: { lid: "122930570739927@lid" },
          content: { type: "text" as const, text: "oi" },
        }),
        send: async () => ({ kind: "blocked" as const, reason: "unused" }),
        resolveLid,
      },
    },
  });
  try {
    const response = await app.inject({
      method: "POST",
      url: `/webhooks/waha/${workspaceId}/${channelInstanceId}`,
      payload: { event: "message", session: "session-1" },
    });
    expect(response.statusCode).toBe(200);
    expect(resolveLid).toHaveBeenCalledWith("session-1", "122930570739927@lid");
    expect(database.receiveInboundMessage).toHaveBeenCalledWith(
      workspaceId,
      expect.objectContaining({ senderPhone: "5516999887766" }),
    );
  } finally {
    await app.close();
  }
});
