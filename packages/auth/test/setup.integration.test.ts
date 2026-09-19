import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, test } from "vitest";
import { Pool } from "pg";
import { createDatabase } from "@maria/database";
import { silencePoolErrors, startTestDatabase } from "@maria/database/testing";
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
  auth = createLocalAuth(runtime, database, {
    adminEmail: "seeded@example.com",
    adminPassword: "seeded-password",
  });
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
  const pool = silencePoolErrors(
    new Pool({ connectionString: uri.toString(), max: 1 }),
  );
  concurrentPools.push(pool);
  await pool.query("select 1");
  return createLocalAuth(pool, createDatabase(pool), {});
}

async function resetUsers() {
  await admin.query("truncate users cascade");
}

const setupInput = (suffix: string) => ({
  email: `master-${suffix}@example.com`,
  name: `Master ${suffix}`,
  password: `password-${suffix}`,
  workspaceName: `Workspace ${suffix}`,
});

test("first-run bootstrap creates master, org, workspace and admin membership", async () => {
  await resetUsers();
  expect(await auth.setupRequired()).toBe(true);

  const input = setupInput("one");
  const result = await auth.completeSetup(input);
  expect(result).not.toBe("already-setup");
  const { userId, workspaceId } = result as {
    userId: string;
    workspaceId: string;
  };
  expect(await auth.setupRequired()).toBe(false);

  const user = (
    await admin.query("select is_admin, email from users where id = $1::uuid", [
      userId,
    ])
  ).rows[0];
  expect(user).toMatchObject({ is_admin: true, email: input.email });
  const workspace = (
    await admin.query(
      "select w.name, o.name as org_name from workspaces w join organizations o on o.id = w.org_id where w.id = $1::uuid",
      [workspaceId],
    )
  ).rows[0];
  expect(workspace).toEqual({
    name: input.workspaceName,
    org_name: input.workspaceName,
  });
  expect(await auth.authorizeWorkspace(userId, workspaceId)).toEqual({
    role: "admin",
  });
  expect(await auth.listUserWorkspaces(userId)).toEqual([
    {
      workspaceId,
      workspaceName: input.workspaceName,
      role: "admin",
      onboarded: false,
    },
  ]);

  const login = await auth.login(input.email, input.password);
  expect(login).toBeDefined();

  expect(await auth.completeSetup(setupInput("two"))).toBe("already-setup");
  const count = await admin.query("select count(*)::int as n from users");
  expect(count.rows[0].n).toBe(1);
});

test("concurrent setups serialize on the advisory lock and mint one master", async () => {
  await resetUsers();
  const applicationNames = [
    `setup-one-${randomUUID()}`,
    `setup-two-${randomUUID()}`,
  ];
  const [firstAuth, secondAuth] = await Promise.all(
    applicationNames.map(createIndependentRuntimeAuth),
  );

  const gate = await admin.connect();
  try {
    await gate.query("begin");
    await gate.query(
      "select pg_advisory_xact_lock(hashtext('maria_auth_global_admin'))",
    );
    const attempts = Promise.all([
      firstAuth.completeSetup(setupInput("first")),
      secondAuth.completeSetup(setupInput("second")),
    ]);
    const deadline = Date.now() + 5_000;
    while (Date.now() < deadline) {
      const blocked = await admin.query<{ application_name: string }>(
        "select application_name from pg_stat_activity where application_name = any($1::text[]) and wait_event_type = 'Lock'",
        [applicationNames],
      );
      if (blocked.rows.length === applicationNames.length) break;
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    await gate.query("commit");
    const results = await attempts;
    expect(results.filter((r) => r === "already-setup")).toHaveLength(1);
    expect(
      results.filter((r) => typeof r === "object" && r !== null),
    ).toHaveLength(1);
  } finally {
    gate.release();
  }

  const users = await admin.query(
    "select count(*)::int as total, count(*) filter (where is_admin)::int as admins from users",
  );
  expect(users.rows[0]).toEqual({ total: 1, admins: 1 });
  const memberships = await admin.query(
    "select count(*)::int as n from memberships",
  );
  expect(memberships.rows[0].n).toBe(1);
});

test("env-seeded admin wins over the visual setup path", async () => {
  await resetUsers();
  expect(await auth.setupRequired()).toBe(true);
  await auth.seedAdmin();
  expect(await auth.setupRequired()).toBe(false);
  expect(await auth.completeSetup(setupInput("visual"))).toBe("already-setup");
});
