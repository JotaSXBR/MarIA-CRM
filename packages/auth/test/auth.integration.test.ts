import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, test } from "vitest";
import type { Pool } from "pg";
import { createDatabase } from "@maria/database";
import { startTestDatabase } from "@maria/database/testing";
import { createLocalAuth } from "../src/index.ts";

let admin: Pool;
let runtime: Pool;
let database: ReturnType<typeof createDatabase>;
let auth: ReturnType<typeof createLocalAuth>;

beforeAll(async () => {
  const testDatabase = await startTestDatabase();
  admin = testDatabase.admin;
  runtime = testDatabase.runtime;
  database = createDatabase(runtime);
  auth = createLocalAuth(runtime, database, {
    adminEmail: "admin@example.com",
    adminPassword: "admin-password",
  });
}, 120000);

afterAll(async () => {
  await runtime?.end();
  await admin?.end();
}, 30000);

test("local auth supports login, session verification and workspace authorization", async () => {
  await auth.seedAdmin();

  const adminLogin = await auth.login("admin@example.com", "admin-password");
  expect(adminLogin).toBeDefined();
  const adminSession = await auth.verifySession(adminLogin!.token);
  expect(adminSession).toMatchObject({
    email: "admin@example.com",
    isAdmin: true,
  });
  expect(await auth.ensureAdmin(adminSession!.userId)).toBe(true);

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
    role: "member",
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
    role: "member",
  });
  expect(
    await auth.authorizeWorkspace(memberSession!.userId, randomUUID()),
  ).toBeUndefined();

  await expect(
    auth.login("member@example.com", "wrong-password"),
  ).resolves.toBeUndefined();
  await expect(
    auth.login("unknown@example.com", "member-password"),
  ).resolves.toBeUndefined();
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
