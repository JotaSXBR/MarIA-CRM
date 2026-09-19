import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, test } from "vitest";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import { createDatabase } from "../src/index.ts";
import { startTestDatabase } from "@maria/database/testing";

const workspaceA = randomUUID();
const workspaceB = randomUUID();
const managerUser = randomUUID();
const agentUser = randomUUID();
const otherAgent = randomUUID();
const viewerUser = randomUUID();
const outsider = randomUUID();
let admin: Pool;
let database: ReturnType<typeof createDatabase>;
let runtimeUri: string;
let channelA: string;
let conversationId: string;

const concurrentPools: Pool[] = [];

function createIndependentDatabase() {
  const pool = new Pool({ connectionString: runtimeUri, max: 1 });
  concurrentPools.push(pool);
  return createDatabase(pool);
}

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
      ($1, 'manager@example.com', 'Gerente', 'x'),
      ($2, 'agent@example.com', 'Agente Um', 'x'),
      ($3, 'other@example.com', 'Agente Dois', 'x'),
      ($4, 'viewer@example.com', 'Leitor', 'x'),
      ($5, 'outsider@example.com', 'Fora', 'x')`,
    [managerUser, agentUser, otherAgent, viewerUser, outsider],
  );
  await database.withWorkspace(workspaceA, (tx) =>
    tx.execute(sql`
      insert into memberships (user_id, workspace_id, role) values
        (${managerUser}, ${workspaceA}, 'manager'),
        (${agentUser}, ${workspaceA}, 'agent'),
        (${otherAgent}, ${workspaceA}, 'agent'),
        (${viewerUser}, ${workspaceA}, 'viewer')
    `),
  );
  const channel = await database.createChannelInstance(workspaceA, {
    provider: "waha",
    providerInstanceId: "ownership",
    webhookSecret: "secret",
  });
  channelA = channel!.id;
  const received = await database.receiveInboundMessage(workspaceA, {
    channelInstanceId: channelA,
    providerThreadId: "55110000@c.us",
    providerMessageId: "msg-own",
    providerEventId: "msg-own",
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
  await Promise.all(concurrentPools.map((pool) => pool.end()));
  await database?.close();
  await admin?.end();
}, 30000);

test("assignment table forces RLS and history stays workspace-scoped", async () => {
  const rls = await admin.query<{ relforcerowsecurity: boolean }>(
    `select c.relforcerowsecurity from pg_class c
     where c.relname = 'conversation_assignments'`,
  );
  expect(rls.rows[0]?.relforcerowsecurity).toBe(true);

  const runtime = new Pool({ connectionString: runtimeUri });
  try {
    await expect(
      runtime.query("select * from conversation_assignments"),
    ).resolves.toMatchObject({ rows: [] });
  } finally {
    await runtime.end();
  }

  expect(
    await database.listConversationAssignments(workspaceB, conversationId),
  ).toEqual([]);
  expect(
    await database.assignConversation(workspaceB, {
      conversationId,
      assigneeId: managerUser,
      actorId: managerUser,
      canDelegate: true,
    }),
  ).toEqual({ kind: "not-found" });
});

test("manager assigns, queue filters reflect ownership and history records changes", async () => {
  expect(
    await database.listConversations(workspaceA, { filter: "unassigned" }),
  ).toHaveLength(1);
  expect(
    await database.listConversations(workspaceA, {
      filter: "mine",
      userId: agentUser,
    }),
  ).toHaveLength(0);

  expect(
    await database.assignConversation(workspaceA, {
      conversationId,
      assigneeId: agentUser,
      actorId: managerUser,
      canDelegate: true,
    }),
  ).toEqual({ kind: "ok" });

  const conversation = await database.getConversation(
    workspaceA,
    conversationId,
  );
  expect(conversation?.assignedUserId).toBe(agentUser);
  expect(conversation?.assignedUserName).toBe("Agente Um");
  expect(conversation?.assignedAt).toBeInstanceOf(Date);

  expect(
    await database.listConversations(workspaceA, { filter: "unassigned" }),
  ).toHaveLength(0);
  expect(
    await database.listConversations(workspaceA, {
      filter: "mine",
      userId: agentUser,
    }),
  ).toHaveLength(1);
  expect(
    await database.listConversations(workspaceA, {
      filter: "mine",
      userId: otherAgent,
    }),
  ).toHaveLength(0);
  expect(await database.listConversations(workspaceA)).toHaveLength(1);

  // Reassign then release — three history rows in newest-first order.
  await database.assignConversation(workspaceA, {
    conversationId,
    assigneeId: managerUser,
    actorId: managerUser,
    canDelegate: true,
  });
  await database.assignConversation(workspaceA, {
    conversationId,
    assigneeId: null,
    actorId: managerUser,
    canDelegate: true,
  });
  const history = await database.listConversationAssignments(
    workspaceA,
    conversationId,
  );
  expect(history).toHaveLength(3);
  expect(history[0]?.assignedUserId).toBeNull();
  expect(history[0]?.assignedByName).toBe("Gerente");
  expect(history[1]?.assignedUserName).toBe("Gerente");
  expect(history[2]?.assignedUserName).toBe("Agente Um");
});

test("agents can only claim the unassigned queue or release their own", async () => {
  // Agent claims an unassigned conversation for self.
  expect(
    await database.assignConversation(workspaceA, {
      conversationId,
      assigneeId: agentUser,
      actorId: agentUser,
      canDelegate: false,
    }),
  ).toEqual({ kind: "ok" });

  // Another agent cannot take a claimed conversation nor assign to others.
  expect(
    await database.assignConversation(workspaceA, {
      conversationId,
      assigneeId: otherAgent,
      actorId: otherAgent,
      canDelegate: false,
    }),
  ).toEqual({ kind: "forbidden" });
  expect(
    await database.assignConversation(workspaceA, {
      conversationId,
      assigneeId: otherAgent,
      actorId: agentUser,
      canDelegate: false,
    }),
  ).toEqual({ kind: "forbidden" });
  // The owner cannot release a conversation owned by someone else.
  expect(
    await database.assignConversation(workspaceA, {
      conversationId,
      assigneeId: null,
      actorId: otherAgent,
      canDelegate: false,
    }),
  ).toEqual({ kind: "forbidden" });

  // The owner releases it.
  expect(
    await database.assignConversation(workspaceA, {
      conversationId,
      assigneeId: null,
      actorId: agentUser,
      canDelegate: false,
    }),
  ).toEqual({ kind: "ok" });
  expect(
    (await database.getConversation(workspaceA, conversationId))
      ?.assignedUserId,
  ).toBeNull();
});

test("assignees must be inbox-capable workspace members", async () => {
  expect(
    await database.assignConversation(workspaceA, {
      conversationId,
      assigneeId: viewerUser,
      actorId: managerUser,
      canDelegate: true,
    }),
  ).toEqual({ kind: "not-member" });
  expect(
    await database.assignConversation(workspaceA, {
      conversationId,
      assigneeId: outsider,
      actorId: managerUser,
      canDelegate: true,
    }),
  ).toEqual({ kind: "not-member" });
  expect(
    await database.assignConversation(workspaceA, {
      conversationId: randomUUID(),
      assigneeId: agentUser,
      actorId: managerUser,
      canDelegate: true,
    }),
  ).toEqual({ kind: "not-found" });
});

test("concurrent claims serialize to exactly one winner", async () => {
  const dbA = createIndependentDatabase();
  const dbB = createIndependentDatabase();
  const results = await Promise.all([
    dbA.assignConversation(workspaceA, {
      conversationId,
      assigneeId: agentUser,
      actorId: agentUser,
      canDelegate: false,
    }),
    dbB.assignConversation(workspaceA, {
      conversationId,
      assigneeId: otherAgent,
      actorId: otherAgent,
      canDelegate: false,
    }),
  ]);
  expect(results.map((result) => result.kind).sort()).toEqual([
    "forbidden",
    "ok",
  ]);
  const winner = results.findIndex((result) => result.kind === "ok");
  expect(
    (await database.getConversation(workspaceA, conversationId))
      ?.assignedUserId,
  ).toBe([agentUser, otherAgent][winner]);

  // Clean up for the next test run's unassigned expectation is unnecessary —
  // the last state is an owned conversation, covered above.
});
