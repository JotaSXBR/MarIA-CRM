import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, test } from "vitest";
import { Pool } from "pg";
import { createDatabase } from "@maria/database";
import { startTestDatabase } from "@maria/database/testing";
import { createLocalAuth, type AuthPort } from "../src/index.ts";

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
    adminEmail: "admin@example.com",
    adminPassword: "admin-password",
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
  const pool = new Pool({ connectionString: uri.toString(), max: 1 });
  concurrentPools.push(pool);
  await pool.query("select 1");
  return createLocalAuth(pool, createDatabase(pool), {});
}

async function waitForBlockedConnections(applicationNames: string[]) {
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline) {
    const result = await admin.query<{ application_name: string }>(
      "select application_name from pg_stat_activity where application_name = any($1::text[]) and wait_event_type = 'Lock'",
      [applicationNames],
    );
    if (result.rows.length === applicationNames.length) return;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error("concurrent auth operations did not both block on a lock");
}

async function runWithMutationGate<T>(
  applicationNames: string[],
  lockQuery: string,
  lockValues: unknown[],
  start: () => Promise<T[]>,
) {
  const client = await admin.connect();
  let transactionOpen = false;
  let operations: Promise<T[]> | undefined;
  try {
    await client.query("begin");
    transactionOpen = true;
    await client.query(lockQuery, lockValues);
    operations = start();
    await waitForBlockedConnections(applicationNames);
    await client.query("commit");
    transactionOpen = false;
    return await operations;
  } finally {
    if (transactionOpen) await client.query("rollback");
    client.release();
    if (operations) await Promise.allSettled([operations]);
  }
}

type WorkspaceMutation = (
  auth: AuthPort,
  workspaceId: string,
  membershipId: string,
) => Promise<"updated" | "removed" | "not-found" | "last-admin" | "forbidden">;

async function assertWorkspaceAdminRace(
  scenario: string,
  mutations: [WorkspaceMutation, WorkspaceMutation],
) {
  const org = await database.createOrganization({ name: `${scenario} Org` });
  const workspace = await database.createWorkspace({
    orgId: org.id,
    name: `${scenario} Workspace`,
  });
  if (!workspace) throw new Error("workspace setup failed");
  const firstUser = await auth.createUser({
    email: `${scenario}-one-${randomUUID()}@example.com`,
    name: `${scenario} One`,
    password: "password",
  });
  const secondUser = await auth.createUser({
    email: `${scenario}-two-${randomUUID()}@example.com`,
    name: `${scenario} Two`,
    password: "password",
  });
  if (!firstUser || !secondUser) throw new Error("user setup failed");
  await auth.addMembership({
    userId: firstUser.userId,
    workspaceId: workspace.id,
    role: "admin",
  });
  await auth.addMembership({
    userId: secondUser.userId,
    workspaceId: workspace.id,
    role: "admin",
  });
  const members = await auth.listMembers(workspace.id);
  const applicationNames = [
    `auth-${scenario}-one-${randomUUID()}`,
    `auth-${scenario}-two-${randomUUID()}`,
  ];
  const [firstAuth, secondAuth] = await Promise.all(
    applicationNames.map(createIndependentRuntimeAuth),
  );
  const results = await runWithMutationGate(
    applicationNames,
    "select id from memberships where id = any($1::uuid[]) for update",
    [[members[0]!.id, members[1]!.id]],
    () =>
      Promise.all([
        mutations[0](firstAuth, workspace.id, members[0]!.id),
        mutations[1](secondAuth, workspace.id, members[1]!.id),
      ]),
  );
  expect(results).toContain("last-admin");
  expect(
    results.some((result) => result === "updated" || result === "removed"),
  ).toBe(true);
  const remainingMembers = await auth.listMembers(workspace.id);
  expect(
    remainingMembers.filter((member) => member.role === "admin"),
  ).toHaveLength(1);
}

test("local auth supports login, session verification and workspace authorization", async () => {
  await auth.seedAdmin();

  const adminLogin = await auth.login("admin@example.com", "admin-password");
  expect(adminLogin).toBeDefined();
  const adminSession = await auth.verifySession(adminLogin!.token);
  expect(adminSession).toMatchObject({
    email: "admin@example.com",
    isAdmin: true,
  });

  const workspace = randomUUID();
  await admin.query("insert into organizations (id, name) values ($1, 'Org')", [
    randomUUID(),
  ]);
  await admin.query(
    "insert into workspaces (id, org_id, name) values ($1, $2, 'Workspace')",
    [workspace, (await admin.query("select id from organizations")).rows[0].id],
  );

  const member = await auth.createUser({
    email: "member@example.com",
    name: "Member",
    password: "member-password",
    workspaceId: workspace,
    role: "agent",
  });
  expect(member).toBeDefined();

  const memberLogin = await auth.login("member@example.com", "member-password");
  expect(memberLogin).toBeDefined();
  const memberSession = await auth.verifySession(memberLogin!.token);
  expect(memberSession).toMatchObject({
    email: "member@example.com",
    isAdmin: false,
  });

  expect(
    await auth.authorizeWorkspace(memberSession!.userId, workspace),
  ).toEqual({
    role: "agent",
  });
  expect(
    await auth.authorizeWorkspace(memberSession!.userId, randomUUID()),
  ).toBeUndefined();

  const memberships = await auth.listUserWorkspaces(memberSession!.userId);
  expect(memberships).toEqual([
    { workspaceId: workspace, workspaceName: "Workspace", role: "agent" },
  ]);

  await expect(
    auth.login("member@example.com", "wrong-password"),
  ).resolves.toBeUndefined();
  await expect(
    auth.login("unknown@example.com", "member-password"),
  ).resolves.toBeUndefined();
});

test("admin management runs under the runtime role with least privilege", async () => {
  const org = await database.createOrganization({ name: "Mgmt Org" });
  const workspace = await database.createWorkspace({
    orgId: org.id,
    name: "Mgmt Workspace",
  });
  expect(workspace).toBeDefined();
  expect(
    await database.createWorkspace({ orgId: randomUUID(), name: "Nope" }),
  ).toBeUndefined();

  const user = await auth.createUser({
    email: "managed@example.com",
    name: "Managed",
    password: "managed-password",
  });
  expect(user).toBeDefined();
  expect(
    await auth.addMembership({
      userId: user!.userId,
      workspaceId: workspace!.id,
      role: "admin",
    }),
  ).toBe("created");
  expect(
    await auth.addMembership({
      userId: user!.userId,
      workspaceId: workspace!.id,
      role: "agent",
    }),
  ).toBe("duplicate");
  expect(
    await auth.addMembership({
      userId: randomUUID(),
      workspaceId: workspace!.id,
      role: "agent",
    }),
  ).toBe("not-found");
  expect(
    await auth.addMembership({
      userId: user!.userId,
      workspaceId: randomUUID(),
      role: "agent",
    }),
  ).toBe("not-found");

  const members = await auth.listMembers(workspace!.id);
  expect(members).toHaveLength(1);
  expect(
    await auth.updateMembershipRole(
      workspace!.id,
      members[0]!.id,
      "agent",
      "admin",
    ),
  ).toBe("last-admin");

  const second = await auth.createUser({
    email: "second@example.com",
    name: "Second",
    password: "second-password",
  });
  await auth.addMembership({
    userId: second!.userId,
    workspaceId: workspace!.id,
    role: "admin",
  });
  expect(
    await auth.updateMembershipRole(
      workspace!.id,
      members[0]!.id,
      "agent",
      "admin",
    ),
  ).toBe("updated");

  const members2 = await auth.listMembers(workspace!.id);
  const lastAdmin = members2.find((member) => member.role === "admin")!;
  const member = members2.find((member) => member.role === "agent")!;
  expect(
    await auth.removeMembership(workspace!.id, lastAdmin.id, "admin"),
  ).toBe("last-admin");
  expect(await auth.removeMembership(workspace!.id, member.id, "admin")).toBe(
    "removed",
  );
  expect(await auth.removeMembership(workspace!.id, member.id, "admin")).toBe(
    "not-found",
  );

  const users = await auth.listUsers();
  const globalAdmin = users.find((row) => row.isAdmin);
  expect(globalAdmin).toBeDefined();
  expect(await auth.updateUser(user!.userId, { name: "Renamed" })).toBe(
    "updated",
  );
  expect(await auth.updateUser(randomUUID(), { name: "Nope" })).toBe(
    "not-found",
  );
  expect(await auth.updateUser(globalAdmin!.id, { active: false })).toBe(
    "last-admin",
  );
});

test("workspace membership mutations enforce the grant rank (ADR 0015)", async () => {
  const organization = await database.createOrganization({ name: "Rank Org" });
  const workspace = await database.createWorkspace({
    orgId: organization!.id,
    name: "Rank Workspace",
  });
  const addMember = async (role: "admin" | "manager" | "agent" | "viewer") => {
    const user = await auth.createUser({
      email: `rank-${role}-${randomUUID()}@example.com`,
      name: `Rank ${role}`,
      password: "password",
    });
    await auth.addMembership({
      userId: user!.userId,
      workspaceId: workspace!.id,
      role,
    });
    return user!.userId;
  };
  const [adminUser, managerUser, agentUser, viewerUser] = [
    await addMember("admin"),
    await addMember("manager"),
    await addMember("agent"),
    await addMember("viewer"),
  ];
  const members = await auth.listMembers(workspace!.id);
  const [adminId, managerId, agentId, viewerId] = [
    adminUser,
    managerUser,
    agentUser,
    viewerUser,
  ].map((userId) => members.find((m) => m.userId === userId)!.id);

  // manager manages/grants agent+viewer only.
  expect(
    await auth.updateMembershipRole(
      workspace!.id,
      agentId,
      "viewer",
      "manager",
    ),
  ).toBe("updated");
  expect(
    await auth.updateMembershipRole(
      workspace!.id,
      viewerId,
      "agent",
      "manager",
    ),
  ).toBe("updated");
  // …never a grant at/above their own rank, nor a peer/higher target.
  expect(
    await auth.updateMembershipRole(
      workspace!.id,
      agentId,
      "manager",
      "manager",
    ),
  ).toBe("forbidden");
  expect(
    await auth.updateMembershipRole(
      workspace!.id,
      managerId,
      "viewer",
      "manager",
    ),
  ).toBe("forbidden");
  expect(
    await auth.updateMembershipRole(
      workspace!.id,
      adminId,
      "viewer",
      "manager",
    ),
  ).toBe("forbidden");
  expect(await auth.removeMembership(workspace!.id, adminId, "manager")).toBe(
    "forbidden",
  );
  expect(await auth.removeMembership(workspace!.id, managerId, "manager")).toBe(
    "forbidden",
  );
  // viewer/agent actors manage nothing.
  expect(
    await auth.updateMembershipRole(workspace!.id, agentId, "viewer", "agent"),
  ).toBe("forbidden");
  expect(await auth.removeMembership(workspace!.id, viewerId, "viewer")).toBe(
    "forbidden",
  );

  // admin may grant admin — and a member promoted to admin is then
  // unmanageable for a manager.
  expect(
    await auth.updateMembershipRole(workspace!.id, agentId, "admin", "admin"),
  ).toBe("updated");
  expect(await auth.removeMembership(workspace!.id, agentId, "manager")).toBe(
    "forbidden",
  );
});

test("rank enforcement is serialized by the workspace membership lock", async () => {
  const organization = await database.createOrganization({ name: "Race Org" });
  const workspace = await database.createWorkspace({
    orgId: organization!.id,
    name: "Race Workspace",
  });
  const makeMember = async (role: "admin" | "manager" | "agent") => {
    const user = await auth.createUser({
      email: `race-${role}-${randomUUID()}@example.com`,
      name: `Race ${role}`,
      password: "password",
    });
    await auth.addMembership({
      userId: user!.userId,
      workspaceId: workspace!.id,
      role,
    });
  };
  await makeMember("admin");
  await makeMember("manager");
  await makeMember("agent");
  const target = (await auth.listMembers(workspace!.id)).find(
    (member) => member.role === "agent",
  )!;

  const [firstAuth, secondAuth] = await Promise.all([
    createIndependentRuntimeAuth(`race-promote-${randomUUID()}`),
    createIndependentRuntimeAuth(`race-remove-${randomUUID()}`),
  ]);
  // admin promotes agent→admin while a manager removes the same membership.
  // The advisory lock serializes them: if the promotion lands first the
  // removal sees an admin target and fails "forbidden"; if the removal lands
  // first the promotion returns "not-found". Either way the rank check ran
  // inside the lock — no promote-then-remove bypass.
  const results = await Promise.all([
    firstAuth.updateMembershipRole(workspace!.id, target.id, "admin", "admin"),
    secondAuth.removeMembership(workspace!.id, target.id, "manager"),
  ]);
  expect(
    (results.includes("updated") && results.includes("forbidden")) ||
      (results.includes("removed") && results.includes("not-found")),
  ).toBe(true);
});

test("session expires after token lifetime", async () => {
  const organization = randomUUID();
  const workspace = randomUUID();
  await admin.query(
    "insert into organizations (id, name) values ($1, 'Expired Org')",
    [organization],
  );
  await admin.query(
    "insert into workspaces (id, org_id, name) values ($1, $2, 'Expired Workspace')",
    [workspace, organization],
  );
  await auth.createUser({
    email: "expired@example.com",
    name: "Expired",
    password: "password",
    workspaceId: workspace,
  });
  const login = await auth.login("expired@example.com", "password");
  const session = await auth.verifySession(login!.token);
  expect(session).toBeDefined();
  await admin.query(
    "update sessions set expires_at = now() - interval '1 second'",
  );
  expect(await auth.verifySession(login!.token)).toBeUndefined();
});

test("changePassword verifies the current password and revokes other sessions", async () => {
  const email = `change-${randomUUID()}@example.com`;
  const user = await auth.createUser({
    email,
    name: "Change",
    password: "old-password",
  });
  expect(user).toBeDefined();
  const first = await auth.login(email, "old-password");
  const second = await auth.login(email, "old-password");
  expect(first).toBeDefined();
  expect(second).toBeDefined();

  expect(
    await auth.changePassword(user!.userId, {
      currentPassword: "wrong-password",
      newPassword: "new-password",
    }),
  ).toBe("invalid-password");

  expect(
    await auth.changePassword(user!.userId, {
      currentPassword: "old-password",
      newPassword: "new-password",
      exceptToken: first!.token,
    }),
  ).toBe("updated");
  expect(await auth.verifySession(first!.token)).toBeDefined();
  expect(await auth.verifySession(second!.token)).toBeUndefined();

  await expect(auth.login(email, "old-password")).resolves.toBeUndefined();
  await expect(auth.login(email, "new-password")).resolves.toBeDefined();

  expect(
    await auth.changePassword(randomUUID(), {
      currentPassword: "old-password",
      newPassword: "new-password",
    }),
  ).toBe("not-found");
});

test("concurrent admin removals preserve the last administrators", async () => {
  const globalOne = await auth.createUser({
    email: "global-one@example.com",
    name: "Global One",
    password: "password",
  });
  const globalTwo = await auth.createUser({
    email: "global-two@example.com",
    name: "Global Two",
    password: "password",
  });
  expect(globalOne).toBeDefined();
  expect(globalTwo).toBeDefined();
  await admin.query(
    "update users set is_admin = true, active = true where id = any($1::uuid[])",
    [[globalOne!.userId, globalTwo!.userId]],
  );
  await admin.query(
    "update users set active = false where email = 'admin@example.com'",
  );

  const globalApplicationNames = [
    `auth-global-one-${randomUUID()}`,
    `auth-global-two-${randomUUID()}`,
  ];
  const [firstGlobalAuth, secondGlobalAuth] = await Promise.all(
    globalApplicationNames.map(createIndependentRuntimeAuth),
  );
  const globalResults = await runWithMutationGate(
    globalApplicationNames,
    "select id from users where id = any($1::uuid[]) for update",
    [[globalOne!.userId, globalTwo!.userId]],
    () =>
      Promise.all([
        firstGlobalAuth.updateUser(globalOne!.userId, { active: false }),
        secondGlobalAuth.updateUser(globalTwo!.userId, { active: false }),
      ]),
  );
  expect(globalResults).toContain("updated");
  expect(globalResults).toContain("last-admin");
  const activeAdmins = await admin.query(
    "select id from users where is_admin and active",
  );
  expect(activeAdmins.rows).toHaveLength(1);

  await assertWorkspaceAdminRace("demote-demote", [
    (raceAuth, workspaceId, membershipId) =>
      raceAuth.updateMembershipRole(
        workspaceId,
        membershipId,
        "agent",
        "admin",
      ),
    (raceAuth, workspaceId, membershipId) =>
      raceAuth.updateMembershipRole(
        workspaceId,
        membershipId,
        "agent",
        "admin",
      ),
  ]);
  await assertWorkspaceAdminRace("remove-remove", [
    (raceAuth, workspaceId, membershipId) =>
      raceAuth.removeMembership(workspaceId, membershipId, "admin"),
    (raceAuth, workspaceId, membershipId) =>
      raceAuth.removeMembership(workspaceId, membershipId, "admin"),
  ]);
  await assertWorkspaceAdminRace("demote-remove", [
    (raceAuth, workspaceId, membershipId) =>
      raceAuth.updateMembershipRole(
        workspaceId,
        membershipId,
        "agent",
        "admin",
      ),
    (raceAuth, workspaceId, membershipId) =>
      raceAuth.removeMembership(workspaceId, membershipId, "admin"),
  ]);
});
