import { randomUUID } from "node:crypto";
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

beforeAll(async () => {
  container = await new PostgreSqlContainer(image).start();
  admin = new Pool({ connectionString: container.getConnectionUri() });
  await admin.query(
    "create role maria_runtime login password 'runtime' nosuperuser nobypassrls",
  );
  await admin.query(`
    create table rls_fixture (id uuid primary key, workspace_id uuid not null, value text not null);
    alter table rls_fixture enable row level security;
    alter table rls_fixture force row level security;
    grant select, insert, update on rls_fixture to maria_runtime;
    create policy workspace_scope on rls_fixture for all to maria_runtime
      using (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
      with check (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);
  `);
  await admin.query(
    "insert into rls_fixture values ($1, $2, 'a'), ($3, $4, 'b')",
    [randomUUID(), workspaceA, randomUUID(), workspaceB],
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

test("RLS scopes reads and writes, rejects reassignment, and leaves no context on its one pooled connection", async () => {
  expect(
    (
      await runtime.query(`
        select r.rolsuper, r.rolbypassrls, c.relforcerowsecurity,
          c.relowner = r.oid as owns_table
        from pg_roles r cross join pg_class c
        where r.rolname = current_user and c.relname = 'rls_fixture'
      `)
    ).rows,
  ).toEqual([
    {
      rolsuper: false,
      rolbypassrls: false,
      relforcerowsecurity: true,
      owns_table: false,
    },
  ]);
  expect((await runtime.query("select * from rls_fixture")).rows).toEqual([]);
  await expect(
    runtime.query("insert into rls_fixture values ($1, $2, 'unscoped')", [
      randomUUID(),
      workspaceA,
    ]),
  ).rejects.toMatchObject({ code: "42501" });

  const visible = await database.withWorkspace(workspaceA, (tx) =>
    tx.execute<{ workspace_id: string }>(
      sql`select workspace_id from rls_fixture`,
    ),
  );
  expect(visible.rows).toEqual([{ workspace_id: workspaceA }]);
  expect((await runtime.query("select * from rls_fixture")).rows).toEqual([]);

  await database.withWorkspace(workspaceA, (tx) =>
    tx.execute(
      sql`insert into rls_fixture values (${randomUUID()}, ${workspaceA}, 'new')`,
    ),
  );
  await expectRlsRejection(
    database.withWorkspace(workspaceA, (tx) =>
      tx.execute(
        sql`update rls_fixture set workspace_id = ${workspaceB} where workspace_id = ${workspaceA}`,
      ),
    ),
  );
  await expectRlsRejection(
    database.withWorkspace(workspaceA, (tx) =>
      tx.execute(
        sql`insert into rls_fixture values (${randomUUID()}, ${workspaceB}, 'cross-tenant')`,
      ),
    ),
  );
  const hiddenUpdate = await database.withWorkspace(workspaceA, (tx) =>
    tx.execute(
      sql`update rls_fixture set value = 'changed' where workspace_id = ${workspaceB}`,
    ),
  );
  expect(hiddenUpdate.rowCount).toBe(0);

  await expect(
    database.withWorkspace(workspaceA, async (tx) => {
      await tx.execute(
        sql`insert into rls_fixture values (${randomUUID()}, ${workspaceA}, 'rolled back')`,
      );
      throw new Error("rollback");
    }),
  ).rejects.toThrow("rollback");
  expect(
    (
      await runtime.query(
        "select current_setting('app.workspace_id', true) as workspace_id",
      )
    ).rows,
  ).toEqual([{ workspace_id: "" }]);
  expect((await runtime.query("select * from rls_fixture")).rows).toEqual([]);
  const count = await database.withWorkspace(workspaceA, (tx) =>
    tx.execute<{ count: string }>(sql`select count(*) from rls_fixture`),
  );
  expect(count.rows).toEqual([{ count: "2" }]);

  expect(
    (
      await runtime.query(
        "select current_setting('app.workspace_id', true) as workspace_id",
      )
    ).rows,
  ).toEqual([{ workspace_id: "" }]);
  expect((await runtime.query("select * from rls_fixture")).rows).toEqual([]);
  await expect(
    createDatabase(admin).withWorkspace(workspaceA, async () => undefined),
  ).rejects.toThrow("database role must not be superuser or BYPASSRLS");
  await admin.query("alter role maria_runtime bypassrls");
  await expect(
    database.withWorkspace(workspaceA, async () => undefined),
  ).rejects.toThrow("database role must not be superuser or BYPASSRLS");
});
