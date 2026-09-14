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

beforeAll(async () => {
  container = await new PostgreSqlContainer(image).start();
  admin = new Pool({ connectionString: container.getConnectionUri() });
  await admin.query(
    "create role maria_runtime login password 'runtime' nosuperuser nobypassrls",
  );
  await admin.query(
    await readFile(
      new URL("../drizzle/0000_product_foundation.sql", import.meta.url),
      "utf8",
    ),
  );
  await admin.query(`
    grant usage on schema public to maria_runtime;
    grant select, insert, update on contacts, companies to maria_runtime;
  `);
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

test("product RLS scopes reads and writes and leaves no context on its pooled connection", async () => {
  expect(
    (
      await runtime.query(`
        select c.relname, r.rolsuper, r.rolbypassrls, c.relforcerowsecurity,
          c.relowner = r.oid as owns_table
        from pg_roles r cross join pg_class c
        where r.rolname = current_user and c.relname in ('contacts', 'companies')
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
  ]);
  expect((await runtime.query("select * from contacts")).rows).toEqual([]);
  expect((await runtime.query("select * from companies")).rows).toEqual([]);
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

  await expect(
    database.withWorkspace(workspaceA, async (tx) => {
      await tx.execute(
        sql`insert into contacts (workspace_id, name) values (${workspaceA}, 'Rolled back')`,
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
  expect((await runtime.query("select * from contacts")).rows).toEqual([]);
  const count = await database.withWorkspace(workspaceA, (tx) =>
    tx.execute<{ count: string }>(sql`select count(*) from contacts`),
  );
  expect(count.rows).toEqual([{ count: "2" }]);

  expect(
    (
      await runtime.query(
        "select current_setting('app.workspace_id', true) as workspace_id",
      )
    ).rows,
  ).toEqual([{ workspace_id: "" }]);
  expect((await runtime.query("select * from companies")).rows).toEqual([]);
  await expect(
    createDatabase(admin).withWorkspace(workspaceA, async () => undefined),
  ).rejects.toThrow("database role must not be superuser or BYPASSRLS");
  await admin.query("alter role maria_runtime bypassrls");
  await expect(
    database.withWorkspace(workspaceA, async () => undefined),
  ).rejects.toThrow("database role must not be superuser or BYPASSRLS");
});
