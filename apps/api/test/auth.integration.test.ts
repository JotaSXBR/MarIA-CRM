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
  const listContacts = vi.fn();
  const auth = createAuthStub();
  const app = buildApp({
    database: { listContacts },
    auth,
  });
  try {
    expect(
      (await app.inject(`/contacts?workspaceId=${workspaceId}`)).statusCode,
    ).toBe(401);
    expect(listContacts).not.toHaveBeenCalled();
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
  const listContacts = vi.fn().mockResolvedValue([contact]);
  const auth = createAuthStub({
    verifySession: async () => ({
      userId,
      email: "user@example.com",
      isAdmin: false,
    }),
    authorizeWorkspace: async () => ({ role: "member" }),
  });
  const app = buildApp({
    database: { listContacts },
    auth,
  });
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
    expect(listContacts).toHaveBeenCalledOnce();
    expect(listContacts).toHaveBeenCalledWith(workspaceId);
  } finally {
    await app.close();
  }
});

test("contacts reject an authenticated user without workspace membership", async () => {
  const workspaceId = randomUUID();
  const userId = randomUUID();
  const listContacts = vi.fn();
  const auth = createAuthStub({
    verifySession: async () => ({
      userId,
      email: "user@example.com",
      isAdmin: false,
    }),
  });
  const app = buildApp({
    database: { listContacts },
    auth,
  });
  try {
    const response = await app.inject({
      method: "GET",
      url: `/contacts?workspaceId=${workspaceId}`,
      headers: { authorization: "Bearer token" },
    });
    expect(response.statusCode).toBe(401);
    expect(listContacts).not.toHaveBeenCalled();
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
  const app = buildApp({
    database: { listContacts: vi.fn() },
    auth,
  });
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
  const app = buildApp({
    database: { listContacts: vi.fn() },
    auth,
  });
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
