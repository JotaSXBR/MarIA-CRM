import { randomUUID } from "node:crypto";
import { expect, test, vi } from "vitest";
import type { AuthPort } from "@maria/auth";
import { buildApp } from "../src/app.ts";
import type { RouteDatabase } from "../src/routes/shared.ts";

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
    setupRequired: vi.fn().mockResolvedValue(true),
    completeSetup: vi.fn().mockResolvedValue("already-setup"),
    seedAdmin: vi.fn().mockResolvedValue(undefined),
  };
  return Object.assign(stub, overrides);
}

function createDatabaseStub() {
  return {
    listOrganizations: vi.fn().mockResolvedValue([]),
    createOrganization: vi.fn(),
    listWorkspaces: vi.fn().mockResolvedValue([]),
    createWorkspace: vi.fn(),
  } as unknown as RouteDatabase;
}

const setupBody = {
  email: "master@example.com",
  name: "Master",
  password: "master-password",
  workspaceName: "Acme",
};

test("GET /setup/status reports the bootstrap gate", async () => {
  const auth = createAuthStub();
  const app = buildApp({
    database: createDatabaseStub(),
    auth,
    setup: { tokenRequired: true, token: "boot-token" },
  });
  try {
    const pending = await app.inject({ method: "GET", url: "/setup/status" });
    expect(pending.statusCode).toBe(200);
    expect(pending.json()).toEqual({
      setupRequired: true,
      tokenRequired: true,
    });

    auth.setupRequired.mockResolvedValue(false);
    const done = await app.inject({ method: "GET", url: "/setup/status" });
    expect(done.json()).toEqual({
      setupRequired: false,
      tokenRequired: true,
    });
  } finally {
    await app.close();
  }
});

test("POST /setup bootstraps once and returns a session token", async () => {
  const userId = randomUUID();
  const workspaceId = randomUUID();
  const auth = createAuthStub({
    completeSetup: vi.fn().mockResolvedValue({ userId, workspaceId }),
    login: vi.fn().mockResolvedValue({ token: "session-token" }),
  });
  const app = buildApp({
    database: createDatabaseStub(),
    auth,
    setup: { tokenRequired: true, token: "boot-token" },
  });
  try {
    const missing = await app.inject({
      method: "POST",
      url: "/setup",
      payload: setupBody,
    });
    expect(missing.statusCode).toBe(403);
    const wrong = await app.inject({
      method: "POST",
      url: "/setup",
      payload: { ...setupBody, token: "wrong" },
    });
    expect(wrong.statusCode).toBe(403);
    expect(auth.completeSetup).not.toHaveBeenCalled();

    const created = await app.inject({
      method: "POST",
      url: "/setup",
      payload: { ...setupBody, token: "boot-token" },
    });
    expect(created.statusCode).toBe(201);
    expect(created.json()).toEqual({ token: "session-token" });
    expect(auth.completeSetup).toHaveBeenCalledWith(setupBody);
    expect(auth.login).toHaveBeenCalledWith(
      "master@example.com",
      "master-password",
    );

    // The single-use token is consumed: a replay never reaches the port.
    const replay = await app.inject({
      method: "POST",
      url: "/setup",
      payload: { ...setupBody, token: "boot-token" },
    });
    expect(replay.statusCode).toBe(403);
    expect(auth.completeSetup).toHaveBeenCalledTimes(1);
  } finally {
    await app.close();
  }
});

test("POST /setup maps an existing install to 409 and validates input", async () => {
  const auth = createAuthStub();
  const app = buildApp({
    database: createDatabaseStub(),
    auth,
    setup: { tokenRequired: false },
  });
  try {
    const conflict = await app.inject({
      method: "POST",
      url: "/setup",
      payload: setupBody,
    });
    expect(conflict.statusCode).toBe(409);

    const invalid = await app.inject({
      method: "POST",
      url: "/setup",
      payload: { ...setupBody, password: "short" },
    });
    expect(invalid.statusCode).toBe(400);
  } finally {
    await app.close();
  }
});
