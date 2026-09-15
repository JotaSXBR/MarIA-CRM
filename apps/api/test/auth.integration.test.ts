import { randomUUID } from "node:crypto";
import { expect, test, vi } from "vitest";
import { buildApp } from "../src/app.ts";

function createAuthStub(
  overrides: Partial<{
    login: () => Promise<{ token: string } | undefined>;
    verifySession: () => Promise<
      { userId: string; email: string; isAdmin: boolean } | undefined
    >;
    authorizeWorkspace: () => Promise<{ role: "admin" | "member" } | undefined>;
    createUser: () => Promise<{ userId: string } | undefined>;
  }> = {},
) {
  return {
    login: vi.fn().mockResolvedValue(undefined),
    verifySession: vi.fn().mockResolvedValue(undefined),
    authorizeWorkspace: vi.fn().mockResolvedValue(undefined),
    createUser: vi.fn().mockResolvedValue(undefined),
    ensureAdmin: vi.fn().mockResolvedValue(false),
    seedAdmin: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createDatabaseStub() {
  return {
    listContacts: vi.fn().mockResolvedValue([]),
    getContact: vi.fn().mockResolvedValue(undefined),
    createContact: vi.fn(),
    updateContact: vi.fn().mockResolvedValue(undefined),
    deleteContact: vi.fn().mockResolvedValue(false),
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
        ? { userId, email: "user@example.com", isAdmin: false }
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
