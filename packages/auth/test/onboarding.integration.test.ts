import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, test } from "vitest";
import { Pool } from "pg";
import { createDatabase } from "@maria/database";
import { startTestDatabase } from "@maria/database/testing";
import { createLocalAuth } from "../src/index.ts";

let admin: Pool;
let runtime: Pool;
let database: ReturnType<typeof createDatabase>;
let auth: ReturnType<typeof createLocalAuth>;
let testDatabase: Awaited<ReturnType<typeof startTestDatabase>>;
const concurrentPools: Pool[] = [];

beforeAll(async () => {
  testDatabase = await startTestDatabase();
  admin = testDatabase.admin;
  runtime = testDatabase.runtime;
  database = createDatabase(runtime);
  auth = createLocalAuth(runtime, database, {});
}, 120000);

afterAll(async () => {
  await Promise.all(concurrentPools.map((pool) => pool.end()));
  await testDatabase.close();
}, 30000);

async function createIndependentRuntimeAuth(applicationName: string) {
  const uri = new URL(testDatabase.container.getConnectionUri());
  uri.username = "maria_runtime";
  uri.password = "runtime";
  uri.searchParams.set("application_name", applicationName);
  const pool = new Pool({ connectionString: uri.toString(), max: 1 });
  concurrentPools.push(pool);
  await pool.query("select 1");
  return createLocalAuth(pool, createDatabase(pool), {});
}

async function seedWorkspace() {
  const orgId = randomUUID();
  const workspaceId = randomUUID();
  const userId = randomUUID();
  await admin.query("insert into organizations (id, name) values ($1, 'Org')", [
    orgId,
  ]);
  await admin.query(
    "insert into workspaces (id, org_id, name) values ($1, $2, 'Workspace')",
    [workspaceId, orgId],
  );
  await admin.query(
    "insert into users (id, email, name, password_hash) values ($1, $2, 'Admin', 'x')",
    [userId, `admin-${randomUUID()}@example.com`],
  );
  await admin.query(
    "insert into memberships (user_id, workspace_id, role) values ($1, $2, 'admin')",
    [userId, workspaceId],
  );
  return { workspaceId, userId };
}

async function seedMember(workspaceId: string) {
  const userId = randomUUID();
  await admin.query(
    "insert into users (id, email, name, password_hash) values ($1, $2, 'Agent', 'x')",
    [userId, `agent-${randomUUID()}@example.com`],
  );
  await admin.query(
    "insert into memberships (user_id, workspace_id, role) values ($1, $2, 'agent')",
    [userId, workspaceId],
  );
}

test("a fresh workspace lists all steps pending and no onboardedAt", async () => {
  const { workspaceId } = await seedWorkspace();
  const view = await auth.getOnboarding(workspaceId);
  expect(view?.workspaceName).toBe("Workspace");
  expect(view?.onboardedAt).toBeNull();
  expect(view?.steps.map((s) => s.id)).toEqual([
    "basics",
    "channel",
    "team",
    "review",
  ]);
  expect(view?.steps.every((s) => s.status === "pending")).toBe(true);
});

test("step updates persist data and skip records skipped (not done)", async () => {
  const { workspaceId } = await seedWorkspace();
  expect(
    await auth.updateOnboardingStep(workspaceId, "basics", {
      status: "done",
      data: { niche: "clínica odontológica" },
    }),
  ).toBe("updated");
  expect(
    await auth.updateOnboardingStep(workspaceId, "channel", {
      status: "skipped",
    }),
  ).toBe("updated");

  const view = await auth.getOnboarding(workspaceId);
  const basics = view?.steps.find((s) => s.id === "basics");
  const channel = view?.steps.find((s) => s.id === "channel");
  expect(basics?.status).toBe("done");
  expect(basics?.data?.niche).toBe("clínica odontológica");
  expect(channel?.status).toBe("skipped");
});

test("channel and team auto-resolve to done from workspace facts", async () => {
  const { workspaceId } = await seedWorkspace();
  await seedMember(workspaceId);
  await admin.query(
    "insert into channel_instances (workspace_id, provider, webhook_secret) values ($1, 'waha', 's')",
    [workspaceId],
  );

  const view = await auth.getOnboarding(workspaceId);
  expect(view?.steps.find((s) => s.id === "channel")?.status).toBe("done");
  expect(view?.steps.find((s) => s.id === "team")?.status).toBe("done");
  expect(view?.steps.find((s) => s.id === "basics")?.status).toBe("pending");
});

test("unknown workspace and review step are rejected", async () => {
  const { workspaceId } = await seedWorkspace();
  expect(await auth.getOnboarding(randomUUID())).toBeUndefined();
  expect(
    await auth.updateOnboardingStep(randomUUID(), "basics", { status: "done" }),
  ).toBe("not-found");
  expect(
    await auth.updateOnboardingStep(workspaceId, "review", { status: "done" }),
  ).toBe("invalid-step");
  expect(await auth.completeOnboarding(randomUUID())).toBe("not-found");
});

test("complete requires every step addressed, then freezes mutations", async () => {
  const { workspaceId } = await seedWorkspace();
  expect(await auth.completeOnboarding(workspaceId)).toBe("incomplete");

  await auth.updateOnboardingStep(workspaceId, "basics", {
    status: "done",
    data: { niche: "imobiliária" },
  });
  await auth.updateOnboardingStep(workspaceId, "channel", {
    status: "skipped",
  });
  await auth.updateOnboardingStep(workspaceId, "team", { status: "skipped" });

  const completed = await auth.completeOnboarding(workspaceId);
  expect(typeof completed).not.toBe("string");
  if (typeof completed === "string") return;

  const view = await auth.getOnboarding(workspaceId);
  expect(view?.onboardedAt).toEqual(completed.onboardedAt);
  expect(view?.steps.find((s) => s.id === "review")?.status).toBe("done");

  // Frozen record + idempotent completion.
  expect(
    await auth.updateOnboardingStep(workspaceId, "basics", { status: "done" }),
  ).toBe("already-onboarded");
  const again = await auth.completeOnboarding(workspaceId);
  expect(typeof again).not.toBe("string");
  if (typeof again !== "string") {
    expect(again.onboardedAt).toEqual(completed.onboardedAt);
  }
});

test("concurrent completions serialize on the workspace row", async () => {
  const { workspaceId } = await seedWorkspace();
  await auth.updateOnboardingStep(workspaceId, "basics", { status: "done" });
  await auth.updateOnboardingStep(workspaceId, "channel", {
    status: "skipped",
  });
  await auth.updateOnboardingStep(workspaceId, "team", { status: "skipped" });

  const other = await createIndependentRuntimeAuth("onboarding-race");
  const [first, second] = await Promise.all([
    auth.completeOnboarding(workspaceId),
    other.completeOnboarding(workspaceId),
  ]);
  expect(typeof first).not.toBe("string");
  expect(typeof second).not.toBe("string");
  if (typeof first !== "string" && typeof second !== "string") {
    expect(second.onboardedAt).toEqual(first.onboardedAt);
  }
});

test("listUserWorkspaces reports the onboarded flag", async () => {
  const { workspaceId, userId } = await seedWorkspace();
  const before = await auth.listUserWorkspaces(userId);
  expect(before.find((w) => w.workspaceId === workspaceId)?.onboarded).toBe(
    false,
  );

  await auth.updateOnboardingStep(workspaceId, "basics", { status: "done" });
  await auth.updateOnboardingStep(workspaceId, "channel", {
    status: "skipped",
  });
  await auth.updateOnboardingStep(workspaceId, "team", { status: "skipped" });
  await auth.completeOnboarding(workspaceId);

  const after = await auth.listUserWorkspaces(userId);
  expect(after.find((w) => w.workspaceId === workspaceId)?.onboarded).toBe(
    true,
  );
});
