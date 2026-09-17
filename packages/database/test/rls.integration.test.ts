import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, expect, test } from "vitest";
import { sql } from "drizzle-orm";
import type { Pool } from "pg";
import { createDatabase } from "../src/index.ts";
import { startTestDatabase } from "@maria/database/testing";

const workspaceA = randomUUID();
const workspaceB = randomUUID();
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
  const testDatabase = await startTestDatabase();
  admin = testDatabase.admin;
  runtime = testDatabase.runtime;
  database = createDatabase(runtime);
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
}, 120000);

afterAll(async () => {
  await database?.close();
  await admin?.end();
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
    can_use_pipelines: boolean;
    can_use_stages: boolean;
    can_use_deals: boolean;
    can_delete_deals: boolean;
    can_use_notes: boolean;
    can_delete_notes: boolean;
    can_use_tasks: boolean;
    can_delete_tasks: boolean;
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
      has_table_privilege(current_user, 'invitations', 'SELECT, INSERT, UPDATE') as can_use_invitations,
      has_table_privilege(current_user, 'pipelines', 'SELECT, INSERT, UPDATE') as can_use_pipelines,
      has_table_privilege(current_user, 'stages', 'SELECT, INSERT, UPDATE') as can_use_stages,
      has_table_privilege(current_user, 'deals', 'SELECT, INSERT, UPDATE') as can_use_deals,
      has_table_privilege(current_user, 'deals', 'DELETE') as can_delete_deals,
      has_table_privilege(current_user, 'notes', 'SELECT, INSERT, UPDATE') as can_use_notes,
      has_table_privilege(current_user, 'notes', 'DELETE') as can_delete_notes,
      has_table_privilege(current_user, 'tasks', 'SELECT, INSERT, UPDATE') as can_use_tasks,
      has_table_privilege(current_user, 'tasks', 'DELETE') as can_delete_tasks
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
      can_use_pipelines: true,
      can_use_stages: true,
      can_use_deals: true,
      can_delete_deals: false,
      can_use_notes: true,
      can_delete_notes: false,
      can_use_tasks: true,
      can_delete_tasks: false,
    },
  ]);
  expect(
    (
      await runtime.query(`
        select c.relname, r.rolsuper, r.rolbypassrls, c.relforcerowsecurity,
          c.relowner = r.oid as owns_table
        from pg_roles r cross join pg_class c
        where r.rolname = current_user and c.relname in ('contacts', 'companies', 'memberships', 'invitations', 'pipelines', 'stages', 'deals', 'notes', 'tasks')
        order by c.relname
      `)
    ).rows,
  ).toEqual(
    [
      "companies",
      "contacts",
      "deals",
      "invitations",
      "memberships",
      "notes",
      "pipelines",
      "stages",
      "tasks",
    ].map((relname) => ({
      relname,
      rolsuper: false,
      rolbypassrls: false,
      relforcerowsecurity: true,
      owns_table: false,
    })),
  );
  expect((await runtime.query("select * from contacts")).rows).toEqual([]);
  expect((await runtime.query("select * from companies")).rows).toEqual([]);
  expect((await runtime.query("select * from memberships")).rows).toEqual([]);
  expect((await runtime.query("select * from invitations")).rows).toEqual([]);
  expect((await runtime.query("select * from pipelines")).rows).toEqual([]);
  expect((await runtime.query("select * from stages")).rows).toEqual([]);
  expect((await runtime.query("select * from deals")).rows).toEqual([]);
  expect((await runtime.query("select * from notes")).rows).toEqual([]);
  expect((await runtime.query("select * from tasks")).rows).toEqual([]);
  await expect(
    runtime.query(
      "insert into contacts (workspace_id, name) values ($1, 'unscoped')",
      [workspaceA],
    ),
  ).rejects.toMatchObject({ code: "42501" });
  await expect(
    runtime.query(
      "insert into notes (workspace_id, body) values ($1, 'unscoped')",
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
  await admin.query("alter role maria_runtime nobypassrls");
});

test("contact CRUD stays workspace-scoped and soft-deletes under the runtime role", async () => {
  const created = await database.createContact(workspaceA, {
    name: "Scoped",
    email: "scoped@example.com",
  });
  expect(created).toMatchObject({
    name: "Scoped",
    email: "scoped@example.com",
    phone: null,
  });
  expect(await database.getContact(workspaceA, created.id)).toMatchObject({
    id: created.id,
  });
  expect(await database.getContact(workspaceB, created.id)).toBeUndefined();
  expect(
    await database.updateContact(workspaceB, created.id, { name: "Cross" }),
  ).toBeUndefined();

  const updated = await database.updateContact(workspaceA, created.id, {
    name: "Renamed",
    phone: "+55 11 99999-0000",
  });
  expect(updated).toMatchObject({
    name: "Renamed",
    email: "scoped@example.com",
  });

  expect(await database.deleteContact(workspaceB, created.id)).toBe(false);
  expect(await database.deleteContact(workspaceA, created.id)).toBe(true);
  expect(await database.deleteContact(workspaceA, created.id)).toBe(false);
  expect(await database.getContact(workspaceA, created.id)).toBeUndefined();
  expect(
    await database.updateContact(workspaceA, created.id, { name: "Ghost" }),
  ).toBeUndefined();
  expect(
    (await database.listContacts(workspaceA)).map((c) => c.id),
  ).not.toContain(created.id);
  expect(
    (
      await admin.query("select deleted_at from contacts where id = $1", [
        created.id,
      ])
    ).rows[0]?.deleted_at,
  ).not.toBeNull();
});

test("company CRUD stays workspace-scoped and soft-deletes under the runtime role", async () => {
  const created = await database.createCompany(workspaceA, {
    name: "Scoped Co",
  });
  expect(created).toMatchObject({ name: "Scoped Co" });
  expect(await database.getCompany(workspaceA, created.id)).toMatchObject({
    id: created.id,
  });
  expect(await database.getCompany(workspaceB, created.id)).toBeUndefined();
  expect(
    await database.updateCompany(workspaceB, created.id, { name: "Cross" }),
  ).toBeUndefined();

  const updated = await database.updateCompany(workspaceA, created.id, {
    name: "Renamed Co",
  });
  expect(updated).toMatchObject({ name: "Renamed Co" });

  expect(await database.deleteCompany(workspaceB, created.id)).toBe(false);
  expect(await database.deleteCompany(workspaceA, created.id)).toBe(true);
  expect(await database.deleteCompany(workspaceA, created.id)).toBe(false);
  expect(await database.getCompany(workspaceA, created.id)).toBeUndefined();
  expect(
    (await database.listCompanies(workspaceA)).map((c) => c.id),
  ).not.toContain(created.id);
  expect(
    (
      await admin.query("select deleted_at from companies where id = $1", [
        created.id,
      ])
    ).rows[0]?.deleted_at,
  ).not.toBeNull();
});

test("pipeline/stage/deal CRUD stays workspace-scoped with scoped ref validation", async () => {
  const pipeline = await database.createPipeline(workspaceA, {
    name: "Vendas",
  });
  expect(pipeline).toMatchObject({ name: "Vendas" });
  expect((await database.listPipelines(workspaceA)).map((p) => p.id)).toContain(
    pipeline.id,
  );
  expect(await database.listPipelines(workspaceB)).toEqual([]);

  const stageA1 = await database.createStage(workspaceA, pipeline.id, {
    name: "Novo",
  });
  const stageA2 = await database.createStage(workspaceA, pipeline.id, {
    name: "Fechado",
  });
  expect(stageA1).toMatchObject({ name: "Novo", pipelineId: pipeline.id });
  expect(stageA1!.position < stageA2!.position).toBe(true);
  expect(await database.listStages(workspaceB, pipeline.id)).toEqual([]);

  // Cross-workspace pipeline must not produce a stage (scoped read, not FK)
  expect(
    await database.createStage(workspaceB, pipeline.id, { name: "Cross" }),
  ).toBeUndefined();

  const contactA = (await database.listContacts(workspaceA))[0];
  const contactB = (await database.listContacts(workspaceB))[0];
  const companyB = (await database.listCompanies(workspaceB))[0];

  const deal = await database.createDeal(workspaceA, {
    pipelineId: pipeline.id,
    stageId: stageA1!.id,
    title: "Deal A",
    valueCents: 10000,
    contactId: contactA!.id,
  });
  expect(deal).toMatchObject({ title: "Deal A", stageId: stageA1!.id });

  // Cross-workspace references must be rejected even though FKs would accept them
  expect(
    await database.createDeal(workspaceA, {
      pipelineId: pipeline.id,
      stageId: stageA1!.id,
      title: "Cross contact",
      contactId: contactB!.id,
    }),
  ).toBeUndefined();
  expect(
    await database.createDeal(workspaceA, {
      pipelineId: pipeline.id,
      stageId: stageA1!.id,
      title: "Cross company",
      companyId: companyB!.id,
    }),
  ).toBeUndefined();

  // Move with neighbor positions: between two deals in the target stage
  const other = await database.createDeal(workspaceA, {
    pipelineId: pipeline.id,
    stageId: stageA2!.id,
    title: "Deal B",
  });
  const moved = await database.moveDeal(workspaceA, deal!.id, {
    stageId: stageA2!.id,
    nextDealId: other!.id,
  });
  expect(moved).toMatchObject({ stageId: stageA2!.id });
  expect(moved!.position < other!.position).toBe(true);
  const movedAfter = await database.moveDeal(workspaceA, deal!.id, {
    stageId: stageA2!.id,
    prevDealId: other!.id,
  });
  expect(movedAfter!.position > other!.position).toBe(true);

  // Unknown deal/stage/neighbor or cross-workspace move returns undefined
  expect(
    await database.moveDeal(workspaceB, deal!.id, { stageId: stageA1!.id }),
  ).toBeUndefined();
  expect(
    await database.moveDeal(workspaceA, deal!.id, { stageId: randomUUID() }),
  ).toBeUndefined();
  expect(
    await database.moveDeal(workspaceA, deal!.id, {
      stageId: stageA1!.id,
      prevDealId: randomUUID(),
    }),
  ).toBeUndefined();

  // Cannot delete a pipeline or stage while it has active deals
  expect(await database.deleteStage(workspaceA, stageA2!.id)).toBe("has-deals");
  expect(await database.deletePipeline(workspaceA, pipeline.id)).toBe(
    "has-deals",
  );

  expect(await database.deleteDeal(workspaceB, deal!.id)).toBe(false);
  expect(await database.deleteDeal(workspaceA, deal!.id)).toBe(true);
  expect(await database.getDeal(workspaceA, deal!.id)).toBeUndefined();
  expect(await database.deleteDeal(workspaceA, other!.id)).toBe(true);
  expect(await database.deleteStage(workspaceA, stageA2!.id)).toBe("deleted");
  expect(await database.deleteStage(workspaceA, stageA2!.id)).toBe("not-found");
  expect(await database.deletePipeline(workspaceA, pipeline.id)).toBe(
    "deleted",
  );
  expect(
    (await database.listPipelines(workspaceA)).map((p) => p.id),
  ).not.toContain(pipeline.id);
});

test("notes/tasks stay workspace-scoped, validate refs and soft-delete", async () => {
  const contactA = (await database.listContacts(workspaceA))[0]!;
  const contactB = (await database.listContacts(workspaceB))[0]!;
  const companyA = (await database.listCompanies(workspaceA))[0]!;
  const companyB = (await database.listCompanies(workspaceB))[0]!;

  const pipeline = await database.createPipeline(workspaceA, {
    name: "Pipeline notas",
  });
  const stage = await database.createStage(workspaceA, pipeline!.id, {
    name: "Etapa",
  });
  const deal = await database.createDeal(workspaceA, {
    pipelineId: pipeline!.id,
    stageId: stage!.id,
    title: "Negócio com nota",
    contactId: contactA.id,
  });

  const userA = randomUUID();
  await admin.query(
    "insert into users (id, email, name, password_hash) values ($1, 'notes@example.com', 'Autor', 'x')",
    [userA],
  );
  await database.withWorkspace(workspaceA, (tx) =>
    tx.execute(
      sql`insert into memberships (user_id, workspace_id, role) values (${userA}, ${workspaceA}, 'member')`,
    ),
  );

  const note = await database.createNote(workspaceA, {
    body: "Primeira nota",
    contactId: contactA.id,
    companyId: companyA.id,
    dealId: deal!.id,
    authorId: userA,
  });
  expect(note).toMatchObject({
    body: "Primeira nota",
    contactId: contactA.id,
  });

  const notes = await database.listNotes(workspaceA, {
    contactId: contactA.id,
  });
  expect(notes).toHaveLength(1);
  expect(notes[0]).toMatchObject({ id: note!.id, authorName: "Autor" });
  expect(
    await database.listNotes(workspaceB, { contactId: contactA.id }),
  ).toEqual([]);
  expect(
    await database.listNotes(workspaceA, { contactId: contactB.id }),
  ).toEqual([]);
  expect(await database.listNotes(workspaceA, {})).toEqual(
    expect.arrayContaining([expect.objectContaining({ id: note!.id })]),
  );

  // Cross-workspace or unknown refs are rejected even though FKs would accept them
  expect(
    await database.createNote(workspaceA, {
      body: "x",
      contactId: contactB.id,
    }),
  ).toBeUndefined();
  expect(
    await database.createNote(workspaceA, {
      body: "x",
      companyId: companyB.id,
    }),
  ).toBeUndefined();
  expect(
    await database.createNote(workspaceA, { body: "x", dealId: randomUUID() }),
  ).toBeUndefined();

  const task = await database.createTask(workspaceA, {
    title: "Ligar para o contato",
    contactId: contactA.id,
    assigneeId: userA,
    dueAt: new Date("2026-10-01T12:00:00Z"),
  });
  expect(task).toMatchObject({ title: "Ligar para o contato", doneAt: null });

  const tasks = await database.listTasks(workspaceA, {
    contactId: contactA.id,
  });
  expect(tasks).toHaveLength(1);
  expect(tasks[0]).toMatchObject({ id: task!.id, assigneeName: "Autor" });
  expect(
    await database.listTasks(workspaceB, { contactId: contactA.id }),
  ).toEqual([]);

  expect(
    await database.createTask(workspaceA, {
      title: "x",
      contactId: contactB.id,
    }),
  ).toBeUndefined();
  expect(
    await database.createTask(workspaceA, {
      title: "x",
      assigneeId: randomUUID(),
    }),
  ).toBeUndefined();

  const done = await database.updateTask(workspaceA, task!.id, { done: true });
  expect(done!.doneAt).not.toBeNull();

  // Open tasks (doneAt NULL) sort before completed ones.
  const openTask = await database.createTask(workspaceA, {
    title: "Aberta",
    contactId: contactA.id,
  });
  const ordered = await database.listTasks(workspaceA, {
    contactId: contactA.id,
  });
  expect(ordered.map((row) => row.id)).toEqual([openTask!.id, task!.id]);

  const undone = await database.updateTask(workspaceA, task!.id, {
    done: false,
    title: "Retomar",
  });
  expect(undone).toMatchObject({ title: "Retomar", doneAt: null });
  expect(
    await database.updateTask(workspaceB, task!.id, { title: "Cross" }),
  ).toBeUndefined();
  expect(
    await database.updateTask(workspaceA, randomUUID(), { title: "Ghost" }),
  ).toBeUndefined();

  // Contact deals join stage/pipeline names and stay scoped
  const contactDeals = await database.listDealsForContact(
    workspaceA,
    contactA.id,
  );
  expect(contactDeals).toEqual([
    expect.objectContaining({
      id: deal!.id,
      stageName: "Etapa",
      pipelineName: "Pipeline notas",
    }),
  ]);
  expect(await database.listDealsForContact(workspaceB, contactB.id)).toEqual(
    [],
  );

  expect(await database.deleteNote(workspaceB, note!.id)).toBe(false);
  expect(await database.deleteNote(workspaceA, note!.id)).toBe(true);
  expect(await database.deleteNote(workspaceA, note!.id)).toBe(false);
  expect(
    await database.listNotes(workspaceA, { contactId: contactA.id }),
  ).toEqual([]);
  expect(
    (
      await admin.query("select deleted_at from notes where id = $1", [
        note!.id,
      ])
    ).rows[0]?.deleted_at,
  ).not.toBeNull();

  expect(await database.deleteTask(workspaceB, task!.id)).toBe(false);
  expect(await database.deleteTask(workspaceA, task!.id)).toBe(true);
  expect(await database.deleteTask(workspaceA, openTask!.id)).toBe(true);
  expect(
    await database.listTasks(workspaceA, { contactId: contactA.id }),
  ).toEqual([]);

  // Tenant context never leaks back to the pooled connection
  expect(await getWorkspaceContext(runtime)).toBe("");
});
