import { randomUUID } from "node:crypto";
import { expect, test, vi } from "vitest";
import type { AuthPort, WorkspaceRole } from "@maria/auth";
import { buildApp } from "../src/app.ts";
import type { RouteDatabase } from "../src/routes/shared.ts";

const workspaceId = randomUUID();
const userId = randomUUID();
const now = new Date().toISOString();

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
    seedAdmin: vi.fn().mockResolvedValue(undefined),
  };
  return Object.assign(stub, overrides);
}

function memberAuth(role: WorkspaceRole) {
  return createAuthStub({
    verifySession: vi.fn().mockResolvedValue({
      userId,
      email: "user@example.com",
      name: "User",
      isAdmin: false,
    }),
    authorizeWorkspace: vi
      .fn()
      .mockImplementation(async (_u: string, ws: string) =>
        ws === workspaceId ? { role } : undefined,
      ),
  });
}

const database = {} as RouteDatabase;
const bearer = (token: string) => ({ authorization: `Bearer ${token}` });

test("GET /members lists the workspace team for any member", async () => {
  const auth = memberAuth("viewer");
  auth.listMembers.mockResolvedValue([
    { id: randomUUID(), userId, role: "admin", email: "a@x.com", name: "A" },
  ]);
  const app = buildApp({ database, auth });
  try {
    expect(
      (
        await app.inject({
          method: "GET",
          url: `/members?workspaceId=${workspaceId}`,
          headers: bearer("t"),
        })
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await app.inject({
          method: "GET",
          url: `/members?workspaceId=${workspaceId}`,
        })
      ).statusCode,
    ).toBe(401);
  } finally {
    await app.close();
  }
});

test("POST /invitations enforces manager rank and grant limits", async () => {
  for (const [role, expected] of [
    ["viewer", 403],
    ["agent", 403],
    ["manager", 201],
    ["admin", 201],
  ] as const) {
    const auth = memberAuth(role);
    auth.createInvitation.mockResolvedValue({
      id: randomUUID(),
      token: "plaintext-token",
      expiresAt: new Date(now),
    });
    const app = buildApp({ database, auth });
    try {
      const response = await app.inject({
        method: "POST",
        url: `/invitations?workspaceId=${workspaceId}`,
        headers: bearer("t"),
        payload: { email: "new@example.com", role: "agent" },
      });
      expect(response.statusCode).toBe(expected);
    } finally {
      await app.close();
    }
  }
});

test("POST /invitations rejects admin grants and grants above inviter rank", async () => {
  const manager = memberAuth("manager");
  const admin = memberAuth("admin");
  admin.createInvitation.mockResolvedValue({
    id: randomUUID(),
    token: "t",
    expiresAt: new Date(now),
  });
  const managerApp = buildApp({ database, auth: manager });
  const adminApp = buildApp({ database, auth: admin });
  try {
    // `admin` is not invitable — schema rejects before the handler.
    for (const [app, role] of [
      [managerApp, "admin"],
      [adminApp, "admin"],
    ] as const) {
      expect(
        (
          await app.inject({
            method: "POST",
            url: `/invitations?workspaceId=${workspaceId}`,
            headers: bearer("t"),
            payload: { email: "x@example.com", role },
          })
        ).statusCode,
      ).toBe(400);
    }
    // A manager cannot grant manager (equal rank) or above.
    expect(
      (
        await managerApp.inject({
          method: "POST",
          url: `/invitations?workspaceId=${workspaceId}`,
          headers: bearer("t"),
          payload: { email: "x@example.com", role: "manager" },
        })
      ).statusCode,
    ).toBe(403);
    // An admin can grant manager.
    expect(
      (
        await adminApp.inject({
          method: "POST",
          url: `/invitations?workspaceId=${workspaceId}`,
          headers: bearer("t"),
          payload: { email: "x@example.com", role: "manager" },
        })
      ).statusCode,
    ).toBe(201);
    // Member conflict maps to 409.
    admin.createInvitation.mockResolvedValue("already-member");
    expect(
      (
        await adminApp.inject({
          method: "POST",
          url: `/invitations?workspaceId=${workspaceId}`,
          headers: bearer("t"),
          payload: { email: "member@example.com", role: "agent" },
        })
      ).statusCode,
    ).toBe(409);
  } finally {
    await managerApp.close();
    await adminApp.close();
  }
});

test("GET and DELETE /invitations are manager-scoped", async () => {
  const auth = memberAuth("manager");
  const inviteId = randomUUID();
  auth.listInvitations.mockResolvedValue([
    {
      id: inviteId,
      email: "x@x.com",
      role: "agent",
      expiresAt: new Date(now),
      createdAt: new Date(now),
    },
  ]);
  auth.revokeInvitation.mockResolvedValue("revoked");
  const viewer = memberAuth("viewer");
  const app = buildApp({ database, auth });
  const viewerApp = buildApp({ database, auth: viewer });
  try {
    expect(
      (
        await app.inject({
          method: "GET",
          url: `/invitations?workspaceId=${workspaceId}`,
          headers: bearer("t"),
        })
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await viewerApp.inject({
          method: "GET",
          url: `/invitations?workspaceId=${workspaceId}`,
          headers: bearer("t"),
        })
      ).statusCode,
    ).toBe(403);
    expect(
      (
        await app.inject({
          method: "DELETE",
          url: `/invitations/${inviteId}?workspaceId=${workspaceId}`,
          headers: bearer("t"),
        })
      ).statusCode,
    ).toBe(204);
    auth.revokeInvitation.mockResolvedValue("not-found");
    expect(
      (
        await app.inject({
          method: "DELETE",
          url: `/invitations/${randomUUID()}?workspaceId=${workspaceId}`,
          headers: bearer("t"),
        })
      ).statusCode,
    ).toBe(404);
  } finally {
    await app.close();
    await viewerApp.close();
  }
});

test("GET /invitations/:token is a public preview", async () => {
  const auth = createAuthStub({
    previewInvitation: vi.fn().mockResolvedValue({
      email: "x@example.com",
      workspaceId,
      workspaceName: "Acme",
      role: "agent",
      expiresAt: new Date(now),
    }),
  });
  const app = buildApp({ database, auth });
  try {
    const ok = await app.inject({
      method: "GET",
      url: "/invitations/some-token",
    });
    expect(ok.statusCode).toBe(200);
    expect(ok.json()).toMatchObject({ workspaceName: "Acme", role: "agent" });

    auth.previewInvitation.mockResolvedValue("unusable");
    expect(
      (await app.inject({ method: "GET", url: "/invitations/old" })).statusCode,
    ).toBe(410);
    auth.previewInvitation.mockResolvedValue("invalid");
    expect(
      (await app.inject({ method: "GET", url: "/invitations/bad" })).statusCode,
    ).toBe(404);
  } finally {
    await app.close();
  }
});

test("POST /invitations/:token/accept maps each outcome", async () => {
  const auth = createAuthStub({
    login: vi.fn().mockResolvedValue({ token: "session-token" }),
    verifySession: vi.fn().mockResolvedValue({
      userId,
      email: "user@example.com",
      name: "User",
      isAdmin: false,
    }),
  });
  const app = buildApp({ database, auth });
  try {
    // Missing name/password without a session is a client error.
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/invitations/t/accept",
          payload: {},
        })
      ).statusCode,
    ).toBe(400);

    // New account: created + auto-login session.
    auth.acceptInvitation.mockResolvedValue({
      kind: "created",
      userId: randomUUID(),
      email: "new@example.com",
    });
    const created = await app.inject({
      method: "POST",
      url: "/invitations/t/accept",
      payload: { name: "New", password: "new-password" },
    });
    expect(created.statusCode).toBe(201);
    expect(created.json()).toEqual({ token: "session-token" });

    // Authenticated attach.
    auth.acceptInvitation.mockResolvedValue({
      kind: "attached",
      userId,
      email: "user@example.com",
    });
    const attached = await app.inject({
      method: "POST",
      url: "/invitations/t/accept",
      headers: bearer("t"),
      payload: {},
    });
    expect(attached.statusCode).toBe(200);
    expect(attached.json()).toEqual({ status: "attached" });
    expect(auth.acceptInvitation).toHaveBeenLastCalledWith("t", { userId });

    for (const [result, status] of [
      ["invalid", 404],
      ["unusable", 410],
      ["email-mismatch", 403],
      ["user-exists", 409],
    ] as const) {
      auth.acceptInvitation.mockResolvedValue(result);
      expect(
        (
          await app.inject({
            method: "POST",
            url: "/invitations/t/accept",
            payload: { name: "N", password: "p-password" },
          })
        ).statusCode,
      ).toBe(status);
    }
  } finally {
    await app.close();
  }
});
