import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, test } from "vitest";
import { eq, sql } from "drizzle-orm";
import { Pool } from "pg";
import { createDatabase } from "../src/index.ts";
import { startTestDatabase } from "@maria/database/testing";
import { channelInstances } from "../src/schema.ts";

const workspaceA = randomUUID();
const workspaceB = randomUUID();
let admin: Pool;
let runtime: Pool;
let runtimeUri: string;
let database: ReturnType<typeof createDatabase>;

beforeAll(async () => {
  const testDatabase = await startTestDatabase();
  admin = testDatabase.admin;
  runtime = testDatabase.runtime;
  const uri = new URL(testDatabase.container.getConnectionUri());
  uri.username = "maria_runtime";
  uri.password = "runtime";
  runtimeUri = uri.toString();
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
}, 120000);

afterAll(async () => {
  await database?.close();
  await admin?.end();
}, 30000);

test("messaging tables force RLS and are unaddressable without a workspace scope", async () => {
  const rls = await runtime.query(`
    select c.relname, c.relforcerowsecurity
    from pg_class c
    where c.relname in (
      'channel_instances', 'conversations', 'messages', 'webhook_events',
      'dispatch_intents', 'dispatch_attempts'
    )
    order by c.relname
  `);
  expect(rls.rows).toEqual(
    [
      "channel_instances",
      "conversations",
      "dispatch_attempts",
      "dispatch_intents",
      "messages",
      "webhook_events",
    ].map((relname) => ({ relname, relforcerowsecurity: true })),
  );
  await expect(
    runtime.query(
      "insert into channel_instances (workspace_id, provider, webhook_secret) values ($1, 'waha', 's')",
      [workspaceA],
    ),
  ).rejects.toMatchObject({ code: "42501" });
  await expect(
    runtime.query("select * from dispatch_intents"),
  ).resolves.toMatchObject({ rows: [] });
});

test("receiveInboundMessage creates a scoped channel, conversation and message", async () => {
  const channelA = await database.createChannelInstance(workspaceA, {
    provider: "waha",
    providerInstanceId: "a",
    webhookSecret: "secret-a",
  });
  const channelB = await database.createChannelInstance(workspaceB, {
    provider: "waha",
    providerInstanceId: "b",
    webhookSecret: "secret-b",
  });
  expect(channelA).toBeDefined();
  expect(channelB).toBeDefined();

  const receivedA = await database.receiveInboundMessage(workspaceA, {
    channelInstanceId: channelA!.id,
    providerThreadId: "55119999@c.us",
    providerMessageId: "msg-a",
    providerEventId: "msg-a",
    providerEventKind: "message",
    contentType: "text",
    body: "hello from A",
    rawPayload: { event: "message" },
    signatureVerified: true,
  });
  expect(receivedA.kind).toBe("received");

  const receivedB = await database.receiveInboundMessage(workspaceB, {
    channelInstanceId: channelB!.id,
    providerThreadId: "55119999@c.us",
    providerMessageId: "msg-b",
    providerEventId: "msg-b",
    providerEventKind: "message",
    contentType: "text",
    body: "hello from B",
    rawPayload: { event: "message" },
    signatureVerified: true,
  });
  expect(receivedB.kind).toBe("received");

  expect(
    await database.getChannelInstance(workspaceB, channelA!.id),
  ).toBeUndefined();
  expect(
    await database.getChannelInstance(workspaceA, channelB!.id),
  ).toBeUndefined();

  const counts = await database.withWorkspace(
    workspaceA,
    async (tx) =>
      await tx.execute<{
        conversations: string;
        messages: string;
        webhook_events: string;
      }>(sql`
        select
          (select count(*) from conversations) as conversations,
          (select count(*) from messages) as messages,
          (select count(*) from webhook_events) as webhook_events
      `),
  );
  expect(counts.rows[0]).toEqual({
    conversations: "1",
    messages: "1",
    webhook_events: "1",
  });

  const duplicate = await database.receiveInboundMessage(workspaceA, {
    channelInstanceId: channelA!.id,
    providerThreadId: "55119999@c.us",
    providerMessageId: "msg-a",
    providerEventId: "msg-a",
    providerEventKind: "message",
    contentType: "text",
    body: "hello from A",
    rawPayload: { event: "message" },
    signatureVerified: true,
  });
  expect(duplicate.kind).toBe("duplicate");
});

test("listConversations and listMessages are scoped to a workspace", async () => {
  const aInstances = await database.listChannelInstances(workspaceA);
  expect(aInstances.length).toBe(1);
  expect(aInstances[0]?.provider).toBe("waha");

  const aConversations = await database.listConversations(workspaceA);
  expect(aConversations.length).toBe(1);

  const aMessages = await database.listMessages(
    workspaceA,
    aConversations[0]!.id,
  );
  expect(aMessages.length).toBe(1);
  expect(aMessages[0]?.body).toBe("hello from A");

  const bConversations = await database.listConversations(workspaceB);
  expect(bConversations.length).toBe(1);
  expect(
    await database.listMessages(workspaceB, bConversations[0]!.id),
  ).toHaveLength(1);

  expect(
    await database.listMessages(workspaceB, aConversations[0]!.id),
  ).toHaveLength(0);
  expect(
    await database.getConversation(workspaceB, aConversations[0]!.id),
  ).toBeUndefined();
});

test("listChannelInstances excludes inactive or cross-tenant instances", async () => {
  const activeA = await database.listChannelInstances(workspaceA);
  expect(activeA.length).toBe(1);
  expect(activeA[0]?.provider).toBe("waha");

  const activeB = await database.listChannelInstances(workspaceB);
  expect(activeB.length).toBe(1);

  await database.withWorkspace(workspaceA, async (tx) => {
    await tx
      .update(channelInstances)
      .set({ isActive: false })
      .where(eq(channelInstances.provider, "waha"));
  });

  expect(await database.listChannelInstances(workspaceA)).toHaveLength(0);
  expect(await database.listChannelInstances(workspaceB)).toHaveLength(1);
});

test("receiveInboundMessage links or creates a contact by sender phone", async () => {
  const channelA = await database.createChannelInstance(workspaceA, {
    provider: "waha",
    providerInstanceId: "phone-a",
    webhookSecret: "secret-a",
  });
  const channelB = await database.createChannelInstance(workspaceB, {
    provider: "waha",
    providerInstanceId: "phone-b",
    webhookSecret: "secret-b",
  });

  const receivedA = await database.receiveInboundMessage(workspaceA, {
    channelInstanceId: channelA!.id,
    providerThreadId: "55119999@c.us",
    providerMessageId: "msg-phone-a",
    providerEventId: "msg-phone-a",
    providerEventKind: "message",
    senderPhone: "55119999",
    contentType: "text",
    body: "hello",
    rawPayload: { event: "message" },
    signatureVerified: true,
  });
  expect(receivedA.kind).toBe("received");
  if (receivedA.kind !== "received") throw new Error("not received");

  const conversationA = await database.getConversation(
    workspaceA,
    receivedA.conversationId,
  );
  expect(conversationA?.contactId).not.toBeNull();

  const contactsA = await database.listContacts(workspaceA);
  expect(contactsA.length).toBe(1);
  expect(contactsA[0]?.phone).toBe("55119999");
  expect(contactsA[0]?.name).toBe("55119999");

  const secondA = await database.receiveInboundMessage(workspaceA, {
    channelInstanceId: channelA!.id,
    providerThreadId: "55119999@c.us",
    providerMessageId: "msg-phone-a-2",
    providerEventId: "msg-phone-a-2",
    providerEventKind: "message",
    senderPhone: "55119999",
    contentType: "text",
    body: "hello again",
    rawPayload: { event: "message" },
    signatureVerified: true,
  });
  expect(secondA.kind).toBe("received");
  const contactsA2 = await database.listContacts(workspaceA);
  expect(contactsA2.length).toBe(1);

  const receivedB = await database.receiveInboundMessage(workspaceB, {
    channelInstanceId: channelB!.id,
    providerThreadId: "55119999@c.us",
    providerMessageId: "msg-phone-b",
    providerEventId: "msg-phone-b",
    providerEventKind: "message",
    senderPhone: "55119999",
    contentType: "text",
    body: "hello from B",
    rawPayload: { event: "message" },
    signatureVerified: true,
  });
  expect(receivedB.kind).toBe("received");
  if (receivedB.kind !== "received") throw new Error("not received");

  const conversationB = await database.getConversation(
    workspaceB,
    receivedB.conversationId,
  );
  expect(conversationB?.contactId).not.toBe(conversationA?.contactId);

  const noPhone = await database.receiveInboundMessage(workspaceA, {
    channelInstanceId: channelA!.id,
    providerThreadId: "no-phone@c.us",
    providerMessageId: "msg-no-phone",
    providerEventId: "msg-no-phone",
    providerEventKind: "message",
    contentType: "text",
    body: "anonymous",
    rawPayload: { event: "message" },
    signatureVerified: true,
  });
  expect(noPhone.kind).toBe("received");
  if (noPhone.kind !== "received") throw new Error("not received");
  const noPhoneConversation = await database.getConversation(
    workspaceA,
    noPhone.conversationId,
  );
  expect(noPhoneConversation?.contactId).toBeNull();
});

test("outbound dispatch ledger enforces claim fencing, expiry and tenancy", async () => {
  const channelA = await database.createChannelInstance(workspaceA, {
    provider: "waha",
    providerInstanceId: "dispatch-a",
    webhookSecret: "secret-a",
  });
  const received = await database.receiveInboundMessage(workspaceA, {
    channelInstanceId: channelA!.id,
    providerThreadId: "55118888@c.us",
    providerMessageId: "in-dispatch-1",
    providerEventId: "in-dispatch-1",
    providerEventKind: "message",
    contentType: "text",
    body: "hi",
    rawPayload: { event: "message" },
    signatureVerified: true,
  });
  if (received.kind !== "received") throw new Error("not received");
  const conversationId = received.conversationId;

  // Commit: message + intent atomically, effect identity stable.
  const created = await database.createOutboundIntent(workspaceA, {
    conversationId,
    body: "outbound hello",
  });
  if (created.kind !== "created") throw new Error("not created");

  const pendingA = await database.listPendingIntents(workspaceA);
  expect(pendingA.map((row) => row.id)).toContain(created.intentId);
  expect(await database.listPendingIntents(workspaceB)).toHaveLength(0);

  // Cross-tenant claim and settle are invisible (RLS).
  expect(
    (
      await database.claimDispatchIntent(workspaceB, created.intentId, {
        leaseMs: 60_000,
      })
    ).kind,
  ).toBe("missing");

  // Concurrent claimers on independent connections: exactly one wins.
  const secondPool = new Pool({
    connectionString: runtimeUri,
    max: 1,
  });
  const database2 = createDatabase(secondPool);
  try {
    const [first, second] = await Promise.all([
      database.claimDispatchIntent(workspaceA, created.intentId, {
        leaseMs: 60_000,
      }),
      database2.claimDispatchIntent(workspaceA, created.intentId, {
        leaseMs: 60_000,
      }),
    ]);
    const claims = [first, second];
    expect(claims.filter((c) => c.kind === "claimed")).toHaveLength(1);
    expect(
      claims.filter((c) => c.kind === "notPending" || c.kind === "missing"),
    ).toHaveLength(1);
  } finally {
    await database2.close();
  }

  // Settle with the wrong fencing token is a stale no-op.
  const wrongFencing = await database.settleDispatch(workspaceA, {
    intentId: created.intentId,
    attemptId: randomUUID(),
    fencingToken: randomUUID(),
    outcome: "succeeded",
    providerMessageId: "fake",
  });
  expect(wrongFencing.kind).toBe("stale");

  // The real claim settles as sent with the provider message id.
  const claimAgain = await database.claimDispatchIntent(
    workspaceA,
    created.intentId,
    { leaseMs: 60_000 },
  );
  expect(claimAgain.kind).toBe("notPending");

  const active = await database.withWorkspace(workspaceA, async (tx) => {
    const rows = await tx.execute<{
      id: string;
      fencing_token: string;
    }>(
      sql`select id, fencing_token from dispatch_attempts where completed_at is null`,
    );
    return rows.rows[0]!;
  });
  const settled = await database.settleDispatch(workspaceA, {
    intentId: created.intentId,
    attemptId: active.id,
    fencingToken: active.fencing_token,
    outcome: "succeeded",
    providerMessageId: "waha-msg-1",
  });
  expect(settled.kind).toBe("settled");
  const sentMessage = await database
    .listMessages(workspaceA, conversationId)
    .then((rows) => rows.find((row) => row.id === created.messageId));
  expect(sentMessage?.status).toBe("sent");
  expect(sentMessage?.providerMessageId).toBe("waha-msg-1");

  // Expired leases become `unknown` — never silently retried (ADR 0010 §4).
  const expired = await database.createOutboundIntent(workspaceA, {
    conversationId,
    body: "might have sent",
  });
  if (expired.kind !== "created") throw new Error("not created");
  const expiredClaim = await database.claimDispatchIntent(
    workspaceA,
    expired.intentId,
    { leaseMs: -1 },
  );
  expect(expiredClaim.kind).toBe("claimed");
  const reaped = await database.reapExpiredDispatches(workspaceA);
  expect(reaped.reaped).toBe(1);
  const unknownMessage = await database
    .listMessages(workspaceA, conversationId)
    .then((rows) => rows.find((row) => row.id === expired.messageId));
  expect(unknownMessage?.status).toBe("unknown");
  expect(
    (
      await database.claimDispatchIntent(workspaceA, expired.intentId, {
        leaseMs: 60_000,
      })
    ).kind,
  ).toBe("notPending");

  // A pending intent whose conversation epoch moved on is cancelled at claim.
  const stale = await database.createOutboundIntent(workspaceA, {
    conversationId,
    body: "stale intent",
  });
  if (stale.kind !== "created") throw new Error("not created");
  await admin.query(
    "update conversations set epoch = epoch + 1 where id = $1",
    [conversationId],
  );
  expect(
    (
      await database.claimDispatchIntent(workspaceA, stale.intentId, {
        leaseMs: 60_000,
      })
    ).kind,
  ).toBe("stale");
  const staleMessage = await database
    .listMessages(workspaceA, conversationId)
    .then((rows) => rows.find((row) => row.id === stale.messageId));
  expect(staleMessage?.status).toBe("cancelled");

  // Inactive channel instances fail fast at claim.
  await admin.query(
    "update channel_instances set is_active = false where id = $1",
    [channelA!.id],
  );
  const deadChannel = await database.createOutboundIntent(workspaceA, {
    conversationId,
    body: "dead channel",
  });
  if (deadChannel.kind !== "created") throw new Error("not created");
  expect(
    (
      await database.claimDispatchIntent(workspaceA, deadChannel.intentId, {
        leaseMs: 60_000,
      })
    ).kind,
  ).toBe("failed");
});
