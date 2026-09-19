import { randomUUID } from "node:crypto";
import { expect, test, vi } from "vitest";
import type { AuthPort, WorkspaceRole } from "@maria/auth";
import { buildApp } from "../src/app.ts";
import type { RouteDatabase } from "../src/routes/shared.ts";

const workspaceId = randomUUID();
const userId = randomUUID();

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

const onboardingView = {
  workspaceName: "Workspace",
  onboardedAt: null,
  steps: [
    { id: "basics", status: "pending" },
    { id: "channel", status: "pending" },
    { id: "team", status: "pending" },
    { id: "review", status: "pending" },
  ],
};

test("GET /onboarding returns the step registry for any member", async () => {
  const auth = memberAuth("viewer");
  auth.getOnboarding.mockResolvedValue(onboardingView);
  const app = buildApp({ database, auth });
  try {
    const response = await app.inject({
      method: "GET",
      url: `/onboarding?workspaceId=${workspaceId}`,
      headers: bearer("t"),
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().steps.map((s: { id: string }) => s.id)).toEqual([
      "basics",
      "channel",
      "team",
      "review",
    ]);
    expect(
      (
        await app.inject({
          method: "GET",
          url: `/onboarding?workspaceId=${workspaceId}`,
        })
      ).statusCode,
    ).toBe(401);
    expect(
      (
        await app.inject({
          method: "GET",
          url: `/onboarding?workspaceId=${randomUUID()}`,
          headers: bearer("t"),
        })
      ).statusCode,
    ).toBe(401);
  } finally {
    await app.close();
  }
});

test("PATCH /onboarding/steps/:step requires manager and maps results", async () => {
  const auth = memberAuth("viewer");
  const app = buildApp({ database, auth });
  try {
    expect(
      (
        await app.inject({
          method: "PATCH",
          url: `/onboarding/steps/basics?workspaceId=${workspaceId}`,
          headers: bearer("t"),
          payload: { status: "done" },
        })
      ).statusCode,
    ).toBe(403);
    expect(
      (
        await app.inject({
          method: "PATCH",
          url: `/onboarding/steps/unknown?workspaceId=${workspaceId}`,
          headers: bearer("t"),
          payload: { status: "done" },
        })
      ).statusCode,
    ).toBe(400);
    // `review` is closed only by completing the wizard.
    expect(
      (
        await app.inject({
          method: "PATCH",
          url: `/onboarding/steps/review?workspaceId=${workspaceId}`,
          headers: bearer("t"),
          payload: { status: "done" },
        })
      ).statusCode,
    ).toBe(400);
  } finally {
    await app.close();
  }

  const manager = memberAuth("manager");
  manager.updateOnboardingStep.mockResolvedValue("updated");
  manager.getOnboarding.mockResolvedValue({
    ...onboardingView,
    steps: [
      { id: "basics", status: "done", data: { niche: "clínica" } },
      { id: "channel", status: "pending" },
      { id: "team", status: "pending" },
      { id: "review", status: "pending" },
    ],
  });
  const app2 = buildApp({ database, auth: manager });
  try {
    const response = await app2.inject({
      method: "PATCH",
      url: `/onboarding/steps/basics?workspaceId=${workspaceId}`,
      headers: bearer("t"),
      payload: { status: "done", data: { niche: "clínica" } },
    });
    expect(response.statusCode).toBe(200);
    expect(manager.updateOnboardingStep).toHaveBeenCalledWith(
      workspaceId,
      "basics",
      { status: "done", data: { niche: "clínica" } },
    );
    expect(response.json().steps[0].status).toBe("done");
  } finally {
    await app2.close();
  }
});

test("PATCH maps not-found and already-onboarded", async () => {
  const auth = memberAuth("admin");
  const app = buildApp({ database, auth });
  try {
    auth.updateOnboardingStep.mockResolvedValue("not-found");
    expect(
      (
        await app.inject({
          method: "PATCH",
          url: `/onboarding/steps/team?workspaceId=${workspaceId}`,
          headers: bearer("t"),
          payload: { status: "skipped" },
        })
      ).statusCode,
    ).toBe(404);
    auth.updateOnboardingStep.mockResolvedValue("already-onboarded");
    expect(
      (
        await app.inject({
          method: "PATCH",
          url: `/onboarding/steps/team?workspaceId=${workspaceId}`,
          headers: bearer("t"),
          payload: { status: "skipped" },
        })
      ).statusCode,
    ).toBe(409);
  } finally {
    await app.close();
  }
});

test("POST /onboarding/complete gates on manager and pending steps", async () => {
  const auth = memberAuth("agent");
  const app = buildApp({ database, auth });
  try {
    expect(
      (
        await app.inject({
          method: "POST",
          url: `/onboarding/complete?workspaceId=${workspaceId}`,
          headers: bearer("t"),
        })
      ).statusCode,
    ).toBe(403);
  } finally {
    await app.close();
  }

  const manager = memberAuth("manager");
  manager.completeOnboarding.mockResolvedValue("incomplete");
  const app2 = buildApp({ database, auth: manager });
  try {
    expect(
      (
        await app2.inject({
          method: "POST",
          url: `/onboarding/complete?workspaceId=${workspaceId}`,
          headers: bearer("t"),
        })
      ).statusCode,
    ).toBe(409);

    const onboardedAt = new Date();
    manager.completeOnboarding.mockResolvedValue({ onboardedAt });
    const response = await app2.inject({
      method: "POST",
      url: `/onboarding/complete?workspaceId=${workspaceId}`,
      headers: bearer("t"),
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().onboardedAt).toBe(onboardedAt.toISOString());
  } finally {
    await app2.close();
  }
});
