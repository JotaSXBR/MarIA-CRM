import { randomUUID } from "node:crypto";
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
}, 120000);

afterAll(async () => {
  await database?.close();
  await admin?.end();
}, 30000);

test("messaging tables force RLS and are unaddressable without a workspace scope", async () => {
  const rls = await runtime.query(`
    select c.relname, c.relforcerowsecurity
    from pg_class c
    where c.relname in ('channel_instances', 'conversations', 'messages', 'webhook_events')
    order by c.relname
  `);
  expect(rls.rows).toEqual(
    ["channel_instances", "conversations", "messages", "webhook_events"].map(
      (relname) => ({ relname, relforcerowsecurity: true }),
    ),
  );
  await expect(
    runtime.query(
      "insert into channel_instances (workspace_id, provider, webhook_secret) values ($1, 'waha', 's')",
      [workspaceA],
    ),
  ).rejects.toMatchObject({ code: "42501" });
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
