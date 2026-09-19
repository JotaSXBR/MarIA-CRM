import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, test } from "vitest";
import { sql } from "drizzle-orm";
import type { Pool } from "pg";
import { createDatabase } from "../src/index.ts";
import { startTestDatabase } from "@maria/database/testing";

const workspaceA = randomUUID();
const workspaceB = randomUUID();
const agentUser = randomUUID();
let admin: Pool;
let database: ReturnType<typeof createDatabase>;

beforeAll(async () => {
  const testDatabase = await startTestDatabase();
  admin = testDatabase.admin;
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
      ($1, 'agent@example.com', 'Agente Um', 'x')`,
    [agentUser],
  );
  await database.withWorkspace(workspaceA, (tx) =>
    tx.execute(sql`
      insert into memberships (user_id, workspace_id, role) values
        (${agentUser}, ${workspaceA}, 'agent')
    `),
  );
}, 120000);

afterAll(async () => {
  await database?.close();
  await admin?.end();
}, 30000);

const inbound = async (
  workspaceId: string,
  threadId: string,
  providerEventId: string,
) => {
  const channel = await database.createChannelInstance(workspaceId, {
    provider: "waha",
    providerInstanceId: `wq-${providerEventId}`,
    webhookSecret: "secret",
  });
  const received = await database.receiveInboundMessage(workspaceId, {
    channelInstanceId: channel!.id,
    providerThreadId: threadId,
    providerMessageId: providerEventId,
    providerEventId,
    providerEventKind: "message",
    contentType: "text",
    body: "hi",
    rawPayload: { event: "message" },
    signatureVerified: true,
  });
  if (received.kind !== "received") throw new Error("inbound seed failed");
  return received.conversationId;
};

test("work queue assembles the five actionable groups per workspace", async () => {
  // Conversation that only ever received an inbound → unassigned + awaiting.
  const waitingId = await inbound(workspaceA, "55110010@c.us", "wq-in-1");
  // Conversation that was answered → in neither group.
  const answeredId = await inbound(workspaceA, "55110011@c.us", "wq-in-2");
  const outbound = await database.createOutboundIntent(workspaceA, {
    conversationId: answeredId,
    authorUserId: agentUser,
    body: "resposta",
  });
  if (outbound.kind !== "created") throw new Error("outbound seed failed");
  // Settle as delivered — a pending send does not count as an answer.
  const okClaim = await database.claimDispatchIntent(
    workspaceA,
    outbound.intentId,
    { leaseMs: 60_000 },
  );
  if (okClaim.kind !== "claimed") throw new Error("claim failed");
  await database.settleDispatch(workspaceA, {
    intentId: outbound.intentId,
    attemptId: okClaim.attemptId,
    fencingToken: okClaim.fencingToken,
    outcome: "succeeded",
    providerMessageId: "wq-out-1",
  });
  await database.assignConversation(workspaceA, {
    conversationId: answeredId,
    assigneeId: agentUser,
    actorId: agentUser,
    canDelegate: false,
  });
  // An outbound send that failed → send issue. Claim + settle exercises the
  // real fencing path (ADR 0010) rather than forging the status.
  const failedSend = await database.createOutboundIntent(workspaceA, {
    conversationId: waitingId,
    authorUserId: agentUser,
    body: "tentativa",
  });
  if (failedSend.kind !== "created") throw new Error("send seed failed");
  const claim = await database.claimDispatchIntent(
    workspaceA,
    failedSend.intentId,
    { leaseMs: 60_000 },
  );
  if (claim.kind !== "claimed") throw new Error("claim failed");
  const settled = await database.settleDispatch(workspaceA, {
    intentId: failedSend.intentId,
    attemptId: claim.attemptId,
    fencingToken: claim.fencingToken,
    outcome: "failed",
    error: "provider down",
  });
  expect(settled.kind).toBe("settled");
  // Overdue and future tasks + an idle vs busy deal.
  const contact = await database.createContact(workspaceA, {
    name: "Ana",
    phone: "+55119990010",
  });
  const pipeline = await database.createPipeline(workspaceA, {
    name: "Vendas",
  });
  const stage = pipeline
    ? await database.createStage(workspaceA, pipeline.id, {
        name: "Negociação",
      })
    : undefined;
  const idleDeal =
    pipeline && stage
      ? await database.createDeal(workspaceA, {
          pipelineId: pipeline.id,
          stageId: stage.id,
          title: "Sem ação",
          contactId: contact?.id ?? null,
        })
      : undefined;
  const busyDeal =
    pipeline && stage
      ? await database.createDeal(workspaceA, {
          pipelineId: pipeline.id,
          stageId: stage.id,
          title: "Com tarefa",
        })
      : undefined;
  if (!contact || !pipeline || !stage || !idleDeal || !busyDeal) {
    throw new Error("crm seed failed");
  }
  await database.createTask(workspaceA, {
    title: "Vencida",
    contactId: contact.id,
    dueAt: new Date("2020-01-01T00:00:00Z"),
  });
  await database.createTask(workspaceA, {
    title: "Futura",
    dealId: busyDeal.id,
    dueAt: new Date("2999-01-01T00:00:00Z"),
  });

  const queue = await database.listWorkQueue(workspaceA);
  expect(queue.unassigned.map((row) => row.id)).toContain(waitingId);
  expect(queue.unassigned.map((row) => row.id)).not.toContain(answeredId);
  expect(queue.awaitingReply.map((row) => row.id)).toEqual([waitingId]);
  expect(queue.sendIssues).toMatchObject([
    { conversationId: waitingId, status: "failed" },
  ]);
  expect(queue.overdueTasks).toMatchObject([
    { title: "Vencida", contactName: "Ana" },
  ]);
  expect(queue.idleDeals.map((row) => row.title)).toEqual(["Sem ação"]);

  // Cross-tenant: workspace B sees none of A's queue items.
  const empty = await database.listWorkQueue(workspaceB);
  expect(empty).toEqual({
    unassigned: [],
    awaitingReply: [],
    sendIssues: [],
    overdueTasks: [],
    idleDeals: [],
  });
});
