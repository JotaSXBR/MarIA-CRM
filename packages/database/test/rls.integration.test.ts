import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, expect, test } from "vitest";
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import { createDatabase } from "../src/index.ts";

const image =
  "postgres:18.6-bookworm@sha256:1c59e2c3c818eaa0f0628f695b36e7c9e362d6b219b36a54a32df645cbd7e1af";
const workspaceA = randomUUID();
const workspaceB = randomUUID();
let container: StartedPostgreSqlContainer;
let admin: Pool;
let runtime: Pool;
let database: ReturnType<typeof createDatabase>;

async function expectRlsRejection(operation: Promise<unknown>) {
  await expect(operation).rejects.toMatchObject({ cause: { code: "42501" } });
}

async function getWorkspaceContext(client: Pool) {
  const result = await client.query<{ workspace_id: string }>(
    "select current_setting('app.workspace_id', true) as workspace_id",
  );
  return result.rows[0]?.workspace_id ?? "";
}

beforeAll(async () => {
  container = await new PostgreSqlContainer(image).start();
  admin = new Pool({ connectionString: container.getConnectionUri() });
  for (const migration of [
    "0000_product_foundation.sql",
    "0001_runtime_role.sql",
    "0002_local_identity.sql",
  ]) {
    await admin.query(
      await readFile(
        new URL(`../drizzle/${migration}`, import.meta.url),
        "utf8",
      ),
    );
  }
  await admin.query("alter role maria_runtime password 'runtime'");
  const organization = randomUUID();
  await admin.query(
    "insert into organizations (id, name) values ($1, 'Organization')",
    [organization],
  );
  await admin.query(
    "insert into workspaces (id, org_id, name) values ($1, $3, 'A'), ($2, $3, 'B')",
    [workspaceA, workspaceB, organization],
  );
  await admin.query(
    "insert into contacts (workspace_id, name) values ($1, 'Contact A'), ($2, 'Contact B')",
    [workspaceA, workspaceB],
  );
  await admin.query(
    "insert into companies (workspace_id, name) values ($1, 'Company A'), ($2, 'Company B')",
    [workspaceA, workspaceB],
  );
  const uri = new URL(container.getConnectionUri());
  uri.username = "maria_runtime";
  uri.password = "runtime";
  runtime = new Pool({ connectionString: uri.toString(), max: 1 });
  database = createDatabase(runtime);
}, 120000);

afterAll(async () => {
  await database?.close();
  await admin?.end();
  await container?.stop();
}, 30000);

async function queryRolePrivileges(client: Pool) {
  const result = await client.query<{
    rolcanlogin: boolean;
    rolsuper: boolean;
    rolcreaterole: boolean;
    rolcreatedb: boolean;
    rolreplication: boolean;
    rolbypassrls: boolean;
    can_connect: boolean;
    can_use_schema: boolean;
    can_use_contacts: boolean;
    can_delete_contacts: boolean;
    can_use_users: boolean;
    can_use_sessions: boolean;
    can_use_memberships: boolean;
    can_use_invitations: boolean;
  }>(`
    select rolcanlogin, rolsuper, rolcreaterole, rolcreatedb, rolreplication,
      rolbypassrls,
      has_database_privilege(current_user, current_database(), 'CONNECT') as can_connect,
      has_schema_privilege(current_user, 'public', 'USAGE') as can_use_schema,
      has_table_privilege(current_user, 'contacts', 'SELECT, INSERT, UPDATE') as can_use_contacts,
      has_table_privilege(current_user, 'contacts', 'DELETE') as can_delete_contacts,
      has_table_privilege(current_user, 'users', 'SELECT, INSERT, UPDATE') as can_use_users,
      has_table_privilege(current_user, 'sessions', 'SELECT, INSERT, DELETE') as can_use_sessions,
      has_table_privilege(current_user, 'memberships', 'SELECT, INSERT, UPDATE, DELETE') as can_use_memberships,
      has_table_privilege(current_user, 'invitations', 'SELECT, INSERT, UPDATE') as can_use_invitations
    from pg_roles
    where rolname = current_user
  `);
  return result.rows;
}

test("product RLS scopes reads and writes and leaves no context on its pooled connection", async () => {
  expect(await queryRolePrivileges(runtime)).toEqual([
    {
      rolcanlogin: true,
      rolsuper: false,
      rolcreaterole: false,
      rolcreatedb: false,
      rolreplication: false,
      rolbypassrls: false,
      can_connect: true,
      can_use_schema: true,
      can_use_contacts: true,
      can_delete_contacts: false,
      can_use_users: true,
      can_use_sessions: true,
      can_use_memberships: true,
      can_use_invitations: true,
    },
  ]);
  expect(
    (
      await runtime.query(`
        select c.relname, r.rolsuper, r.rolbypassrls, c.relforcerowsecurity,
          c.relowner = r.oid as owns_table
        from pg_roles r cross join pg_class c
        where r.rolname = current_user and c.relname in ('contacts', 'companies', 'memberships', 'invitations')
        order by c.relname
      `)
    ).rows,
  ).toEqual([
    {
      relname: "companies",
      rolsuper: false,
      rolbypassrls: false,
      relforcerowsecurity: true,
      owns_table: false,
    },
    {
      relname: "contacts",
      rolsuper: false,
      rolbypassrls: false,
      relforcerowsecurity: true,
      owns_table: false,
    },
    {
      relname: "invitations",
      rolsuper: false,
      rolbypassrls: false,
      relforcerowsecurity: true,
      owns_table: false,
    },
    {
      relname: "memberships",
      rolsuper: false,
      rolbypassrls: false,
      relforcerowsecurity: true,
      owns_table: false,
    },
  ]);
  expect((await runtime.query("select * from contacts")).rows).toEqual([]);
  expect((await runtime.query("select * from companies")).rows).toEqual([]);
  expect((await runtime.query("select * from memberships")).rows).toEqual([]);
  expect((await runtime.query("select * from invitations")).rows).toEqual([]);
  await expect(
    runtime.query(
      "insert into contacts (workspace_id, name) values ($1, 'unscoped')",
      [workspaceA],
    ),
  ).rejects.toMatchObject({ code: "42501" });

  expect(await database.listContacts(workspaceA)).toEqual([
    expect.objectContaining({ name: "Contact A" }),
  ]);
  expect(await database.listContacts(workspaceB)).toEqual([
    expect.objectContaining({ name: "Contact B" }),
  ]);
  const companies = await database.withWorkspace(workspaceA, (tx) =>
    tx.execute<{ workspace_id: string }>(
      sql`select workspace_id from companies`,
    ),
  );
  expect(companies.rows).toEqual([{ workspace_id: workspaceA }]);

  await database.withWorkspace(workspaceA, (tx) =>
    tx.execute(
      sql`insert into contacts (workspace_id, name) values (${workspaceA}, 'New')`,
    ),
  );
  await expectRlsRejection(
    database.withWorkspace(workspaceA, (tx) =>
      tx.execute(
        sql`update contacts set workspace_id = ${workspaceB} where workspace_id = ${workspaceA}`,
      ),
    ),
  );
  await expectRlsRejection(
    database.withWorkspace(workspaceA, (tx) =>
      tx.execute(
        sql`insert into companies (workspace_id, name) values (${workspaceB}, 'Cross-tenant')`,
      ),
    ),
  );
  const hiddenUpdate = await database.withWorkspace(workspaceA, (tx) =>
    tx.execute(
      sql`update companies set name = 'Changed' where workspace_id = ${workspaceB}`,
    ),
  );
  expect(hiddenUpdate.rowCount).toBe(0);

  const userA = randomUUID();
  const userB = randomUUID();
  await admin.query(
    "insert into users (id, email, name, password_hash) values ($1, 'a@example.com', 'A', 'x'), ($2, 'b@example.com', 'B', 'x')",
    [userA, userB],
  );
  await database.withWorkspace(workspaceA, (tx) =>
    tx.execute(
      sql`insert into memberships (user_id, workspace_id, role) values (${userA}, ${workspaceA}, 'member')`,
    ),
  );
  await database.withWorkspace(workspaceB, (tx) =>
    tx.execute(
      sql`insert into memberships (user_id, workspace_id, role) values (${userB}, ${workspaceB}, 'member')`,
    ),
  );
  expect(
    (
      await database.withWorkspace(workspaceA, (tx) =>
        tx.execute<{ user_id: string }>(
          sql`select user_id from memberships order by user_id`,
        ),
      )
    ).rows,
  ).toEqual([{ user_id: userA }]);
  await expectRlsRejection(
    database.withWorkspace(workspaceA, (tx) =>
      tx.execute(
        sql`insert into memberships (user_id, workspace_id, role) values (${userA}, ${workspaceB}, 'member')`,
      ),
    ),
  );

  await expect(
    database.withWorkspace(workspaceA, async (tx) => {
      await tx.execute(
        sql`insert into contacts (workspace_id, name) values (${workspaceA}, 'Rolled back')`,
      );
      throw new Error("rollback");
    }),
  ).rejects.toThrow("rollback");
  expect(await getWorkspaceContext(runtime)).toBe("");
  expect((await runtime.query("select * from contacts")).rows).toEqual([]);
  const count = await database.withWorkspace(workspaceA, (tx) =>
    tx.execute<{ count: string }>(sql`select count(*) from contacts`),
  );
  expect(count.rows).toEqual([{ count: "2" }]);

  expect(await getWorkspaceContext(runtime)).toBe("");
  expect((await runtime.query("select * from companies")).rows).toEqual([]);
  await expect(
    createDatabase(admin).withWorkspace(workspaceA, async () => undefined),
  ).rejects.toThrow("database role must not be superuser or BYPASSRLS");
  await admin.query("alter role maria_runtime bypassrls");
  await expect(
    database.withWorkspace(workspaceA, async () => undefined),
  ).rejects.toThrow("database role must not be superuser or BYPASSRLS");
  await expect(
    admin.query(
      await readFile(
        new URL("../drizzle/0001_runtime_role.sql", import.meta.url),
        "utf8",
      ),
    ),
  ).rejects.toThrow("maria_runtime has unsafe role attributes");
});
