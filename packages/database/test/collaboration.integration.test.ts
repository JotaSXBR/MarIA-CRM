import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, test } from "vitest";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import { createDatabase } from "../src/index.ts";
import { silencePoolErrors, startTestDatabase } from "@maria/database/testing";

const workspaceA = randomUUID();
const workspaceB = randomUUID();
const agentUser = randomUUID();
const managerUser = randomUUID();
let admin: Pool;
let database: ReturnType<typeof createDatabase>;
let runtimeUri: string;
let conversationId: string;

beforeAll(async () => {
  const testDatabase = await startTestDatabase();
  admin = testDatabase.admin;
  const uri = new URL(testDatabase.container.getConnectionUri());
  uri.username = "maria_runtime";
  uri.password = "runtime";
  runtimeUri = uri.toString();
  database = createDatabase(testDatabase.runtime);
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
    `insert into users (id, email, name, password_hash) values
      ($1, 'agent@example.com', 'Agente Um', 'x'),
      ($2, 'manager@example.com', 'Gerente', 'x')`,
    [agentUser, managerUser],
  );
  await database.withWorkspace(workspaceA, (tx) =>
    tx.execute(sql`
      insert into memberships (user_id, workspace_id, role) values
        (${agentUser}, ${workspaceA}, 'agent'),
        (${managerUser}, ${workspaceA}, 'manager')
    `),
  );
  const channel = await database.createChannelInstance(workspaceA, {
    provider: "waha",
    providerInstanceId: "collaboration",
    webhookSecret: "secret",
  });
  const received = await database.receiveInboundMessage(workspaceA, {
    channelInstanceId: channel!.id,
    providerThreadId: "55110001@c.us",
    providerMessageId: "msg-collab",
    providerEventId: "msg-collab",
    providerEventKind: "message",
    contentType: "text",
    body: "hi",
    rawPayload: { event: "message" },
    signatureVerified: true,
  });
  if (received.kind !== "received") throw new Error("inbound seed failed");
  conversationId = received.conversationId;
}, 120000);

afterAll(async () => {
  await database?.close();
  await admin?.end();
}, 30000);

test("internal notes join the thread without a dispatch intent", async () => {
  const missing = await database.createConversationNote(workspaceA, {
    conversationId: randomUUID(),
    authorUserId: agentUser,
    body: "not here",
  });
  expect(missing).toEqual({ kind: "missing" });
  // Cross-tenant: the workspace B scope cannot see workspace A's conversation.
  expect(
    await database.createConversationNote(workspaceB, {
      conversationId,
      authorUserId: agentUser,
      body: "cross-tenant",
    }),
  ).toEqual({ kind: "missing" });

  const created = await database.createConversationNote(workspaceA, {
    conversationId,
    authorUserId: agentUser,
    body: "Cliente pediu retorno às 15h.",
  });
  expect(created.kind).toBe("created");
  if (created.kind !== "created") return;

  const thread = await database.listMessages(workspaceA, conversationId);
  const note = thread.find((row) => row.id === created.message.id);
  expect(note).toMatchObject({
    kind: "note",
    direction: "internal",
    status: "note",
    body: "Cliente pediu retorno às 15h.",
    authorUserId: agentUser,
    authorName: "Agente Um",
  });
  // Channel messages stay `message` and inbound rows have no author.
  const inbound = thread.find((row) => row.direction === "inbound");
  expect(inbound).toMatchObject({ kind: "message", authorUserId: null });

  // Notes never enter the dispatch ledger — no provider sees them.
  const intents = await admin.query(
    "select count(*)::int as n from dispatch_intents where message_id = $1",
    [created.message.id],
  );
  expect(intents.rows[0]?.n).toBe(0);

  // Operator resolution only applies to outbound channel traffic.
  expect(
    await database.resolveUnknownMessage(workspaceA, {
      messageId: created.message.id,
      resolution: "sent",
    }),
  ).toEqual({ kind: "invalidState", status: "note" });
});

test("outbound intents record the human author", async () => {
  const created = await database.createOutboundIntent(workspaceA, {
    conversationId,
    authorUserId: agentUser,
    body: "respondendo",
  });
  expect(created.kind).toBe("created");
  if (created.kind !== "created") return;
  const message = await database.getMessage(workspaceA, created.messageId);
  expect(message).toMatchObject({
    kind: "message",
    direction: "outbound",
    authorUserId: agentUser,
    authorName: "Agente Um",
  });
});

test("quick replies are workspace-scoped with normalized unique shortcuts", async () => {
  const rls = await admin.query<{ relforcerowsecurity: boolean }>(
    `select c.relforcerowsecurity from pg_class c
     where c.relname = 'quick_replies'`,
  );
  expect(rls.rows[0]?.relforcerowsecurity).toBe(true);
  const runtime = silencePoolErrors(new Pool({ connectionString: runtimeUri }));
  try {
    await expect(
      runtime.query("select * from quick_replies"),
    ).resolves.toMatchObject({ rows: [] });
  } finally {
    await runtime.end();
  }

  const created = await database.createQuickReply(workspaceA, {
    title: "Boas-vindas",
    shortcut: " /Saudacao ",
    body: "Olá! Como posso ajudar?",
    createdBy: agentUser,
  });
  expect(created).toMatchObject({
    title: "Boas-vindas",
    shortcut: "saudacao",
    createdBy: agentUser,
  });
  if (!created) return;

  // Active shortcut conflict → undefined (routes map to 409).
  expect(
    await database.createQuickReply(workspaceA, {
      title: "Duplicada",
      shortcut: "saudacao",
      body: "x",
    }),
  ).toBeUndefined();
  expect(
    await database.updateQuickReply(workspaceA, created.id, {
      shortcut: "saudacao",
    }),
  ).toMatchObject({ shortcut: "saudacao" });

  // Cross-tenant reads and writes stay empty.
  expect(await database.listQuickReplies(workspaceB)).toEqual([]);
  expect(
    await database.updateQuickReply(workspaceB, created.id, { title: "x" }),
  ).toBeUndefined();
  expect(await database.deleteQuickReply(workspaceB, created.id)).toBe(false);

  const second = await database.createQuickReply(workspaceA, {
    title: "Preço",
    shortcut: "preco",
    body: "O plano custa…",
  });
  expect(second).not.toBeUndefined();
  expect(
    await database.updateQuickReply(workspaceA, second!.id, {
      shortcut: "saudacao",
    }),
  ).toBeUndefined();

  // Soft delete frees the shortcut (partial unique index).
  expect(await database.deleteQuickReply(workspaceA, created.id)).toBe(true);
  expect(
    await database.createQuickReply(workspaceA, {
      title: "Saudação 2",
      shortcut: "saudacao",
      body: "Oi!",
    }),
  ).toMatchObject({ shortcut: "saudacao" });

  const list = await database.listQuickReplies(workspaceA);
  expect(list.map((row) => row.shortcut)).toEqual(["preco", "saudacao"]);
});
