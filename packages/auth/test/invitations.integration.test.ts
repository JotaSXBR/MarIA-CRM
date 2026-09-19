import { createHash, randomUUID } from "node:crypto";
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
  const pool = silencePoolErrors(
    new Pool({ connectionString: uri.toString(), max: 1 }),
  );
  concurrentPools.push(pool);
  await pool.query("select 1");
  return createLocalAuth(pool, createDatabase(pool), {});
}

async function seedWorkspace() {
  const orgId = randomUUID();
  const workspaceId = randomUUID();
  const inviterId = randomUUID();
  await admin.query("insert into organizations (id, name) values ($1, 'Org')", [
    orgId,
  ]);
  await admin.query(
    "insert into workspaces (id, org_id, name) values ($1, $2, 'Workspace')",
    [workspaceId, orgId],
  );
  await admin.query(
    "insert into users (id, email, name, password_hash) values ($1, $2, 'Inviter', 'x')",
    [inviterId, `inviter-${randomUUID()}@example.com`],
  );
  await admin.query(
    "insert into memberships (user_id, workspace_id, role) values ($1, $2, 'admin')",
    [inviterId, workspaceId],
  );
  return { workspaceId, inviterId };
}

async function createInvite(email: string, role = "agent" as const) {
  const { workspaceId, inviterId } = await seedWorkspace();
  const result = await auth.createInvitation({
    workspaceId,
    email,
    role,
    invitedBy: inviterId,
  });
  if (typeof result === "string") throw new Error(`invite failed: ${result}`);
  return { ...result, workspaceId, inviterId };
}

test("create stores only the token hash and the plaintext is shown once", async () => {
  const invite = await createInvite("Agent@Example.com");
  expect(invite.token.length).toBeGreaterThan(20);

  const row = (
    await admin.query(
      "select email, role, token_hash, invited_by, consumed_at from invitations where id = $1::uuid",
      [invite.id],
    )
  ).rows[0];
  expect(row.email).toBe("agent@example.com");
  expect(row.role).toBe("agent");
  expect(row.token_hash).toBe(
    createHash("sha256").update(invite.token).digest("hex"),
  );
  expect(row.token_hash).not.toBe(invite.token);
  expect(row.invited_by).toBe(invite.inviterId);
  expect(row.consumed_at).toBeNull();
});

test("preview, accept as new user, membership and replay protection", async () => {
  const invite = await createInvite("new-agent@example.com");

  const preview = await auth.previewInvitation(invite.token);
  expect(preview).toMatchObject({
    email: "new-agent@example.com",
    workspaceName: "Workspace",
    role: "agent",
  });
  expect(await auth.previewInvitation("wrong-token")).toBe("invalid");

  const accepted = await auth.acceptInvitation(invite.token, {
    name: "New Agent",
    password: "agent-password",
  });
  expect(accepted).toMatchObject({ kind: "created" });
  if (typeof accepted === "string") throw new Error("not created");
  const userId = accepted.userId;

  const user = (
    await admin.query(
      "select email, name, is_admin from users where id = $1::uuid",
      [userId],
    )
  ).rows[0];
  expect(user).toEqual({
    email: "new-agent@example.com",
    name: "New Agent",
    is_admin: false,
  });
  expect(await auth.authorizeWorkspace(userId, invite.workspaceId)).toEqual({
    role: "agent",
  });

  const inviteRow = (
    await admin.query(
      "select consumed_at from invitations where id = $1::uuid",
      [invite.id],
    )
  ).rows[0];
  expect(inviteRow.consumed_at).not.toBeNull();

  // Replay: the consumed invite is rejected for both acceptors.
  expect(
    await auth.acceptInvitation(invite.token, {
      name: "Again",
      password: "agent-password",
    }),
  ).toBe("unusable");
  expect(await auth.previewInvitation(invite.token)).toBe("unusable");
});

test("accept attaches an authenticated existing user and enforces email match", async () => {
  const invite = await createInvite("existing@example.com");
  const existingId = randomUUID();
  const otherId = randomUUID();
  await admin.query(
    "insert into users (id, email, name, password_hash) values ($1, 'existing@example.com', 'Existing', 'x'), ($2, 'other@example.com', 'Other', 'x')",
    [existingId, otherId],
  );

  // Anonymous accept for an existing account must authenticate instead.
  expect(
    await auth.acceptInvitation(invite.token, {
      name: "Existing",
      password: "whatever-password",
    }),
  ).toBe("user-exists");
  // Failed checks leave the invitation live.
  expect(await auth.previewInvitation(invite.token)).toMatchObject({
    email: "existing@example.com",
  });

  // A different user's session cannot consume it.
  expect(await auth.acceptInvitation(invite.token, { userId: otherId })).toBe(
    "email-mismatch",
  );

  const attached = await auth.acceptInvitation(invite.token, {
    userId: existingId,
  });
  expect(attached).toMatchObject({ kind: "attached", userId: existingId });
  expect(await auth.authorizeWorkspace(existingId, invite.workspaceId)).toEqual(
    { role: "agent" },
  );
});

test("inviting an existing member is rejected at creation", async () => {
  const { workspaceId, inviterId } = await seedWorkspace();
  const memberId = randomUUID();
  await admin.query(
    "insert into users (id, email, name, password_hash) values ($1, 'member@example.com', 'Member', 'x')",
    [memberId],
  );
  await admin.query(
    "insert into memberships (user_id, workspace_id, role) values ($1, $2, 'viewer')",
    [memberId, workspaceId],
  );
  expect(
    await auth.createInvitation({
      workspaceId,
      email: "member@example.com",
      role: "agent",
      invitedBy: inviterId,
    }),
  ).toBe("already-member");
});

test("one live invitation per workspace/email: re-issue revokes the old token", async () => {
  const { workspaceId, inviterId } = await seedWorkspace();
  const first = await auth.createInvitation({
    workspaceId,
    email: "same@example.com",
    role: "agent",
    invitedBy: inviterId,
  });
  const second = await auth.createInvitation({
    workspaceId,
    email: "same@example.com",
    role: "manager",
    invitedBy: inviterId,
  });
  if (typeof first === "string" || typeof second === "string") {
    throw new Error("invite creation failed");
  }

  const live = await auth.listInvitations(workspaceId);
  expect(live).toHaveLength(1);
  expect(live[0]!.id).toBe(second.id);
  expect(live[0]!.role).toBe("manager");

  expect(await auth.previewInvitation(first.token)).toBe("unusable");
  expect(await auth.previewInvitation(second.token)).toMatchObject({
    role: "manager",
  });
});

test("list and revoke stay workspace-scoped", async () => {
  const invite = await createInvite("scoped@example.com");
  const other = await seedWorkspace();

  expect(await auth.listInvitations(invite.workspaceId)).toHaveLength(1);
  expect(await auth.listInvitations(other.workspaceId)).toEqual([]);

  // Cross-workspace revocation sees nothing.
  expect(await auth.revokeInvitation(other.workspaceId, invite.id)).toBe(
    "not-found",
  );
  expect(await auth.revokeInvitation(invite.workspaceId, invite.id)).toBe(
    "revoked",
  );
  expect(await auth.revokeInvitation(invite.workspaceId, invite.id)).toBe(
    "not-found",
  );
  expect(await auth.previewInvitation(invite.token)).toBe("unusable");
  expect(await auth.listInvitations(invite.workspaceId)).toEqual([]);
});

test("expired invitations cannot be previewed or accepted", async () => {
  const { workspaceId, inviterId } = await seedWorkspace();
  const token = "expired-token-value";
  await admin.query(
    "insert into invitations (email, workspace_id, role, token_hash, expires_at) values ('old@example.com', $1, 'agent', $2, now() - interval '1 hour')",
    [workspaceId, createHash("sha256").update(token).digest("hex")],
  );
  void inviterId;
  expect(await auth.previewInvitation(token)).toBe("unusable");
  expect(
    await auth.acceptInvitation(token, {
      name: "Old",
      password: "old-password",
    }),
  ).toBe("unusable");
});

test("concurrent accepts serialize: exactly one consumes the invitation", async () => {
  const invite = await createInvite("race@example.com");
  const names = [`accept-a-${randomUUID()}`, `accept-b-${randomUUID()}`];
  const [authA, authB] = await Promise.all(
    names.map(createIndependentRuntimeAuth),
  );

  const results = await Promise.all([
    authA.acceptInvitation(invite.token, {
      name: "Racer A",
      password: "racer-password",
    }),
    authB.acceptInvitation(invite.token, {
      name: "Racer B",
      password: "racer-password",
    }),
  ]);
  const created = results.filter(
    (r) => typeof r === "object" && r !== null && r.kind === "created",
  );
  const rejected = results.filter((r) => r === "unusable");
  expect(created).toHaveLength(1);
  expect(rejected).toHaveLength(1);

  const users = await admin.query(
    "select count(*)::int as n from users where email = 'race@example.com'",
  );
  expect(users.rows[0].n).toBe(1);
  const memberships = await admin.query(
    "select count(*)::int as n from memberships where workspace_id = $1::uuid and role = 'agent'",
    [invite.workspaceId],
  );
  expect(memberships.rows[0].n).toBe(1);
});
