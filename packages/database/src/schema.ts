import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid().defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    name: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("workspaces_org_id_idx").on(table.orgId)],
);

export const contacts = pgTable(
  "contacts",
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    name: text().notNull(),
    email: text(),
    phone: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("contacts_workspace_id_idx").on(table.workspaceId),
    index("contacts_workspace_active_idx")
      .on(table.workspaceId)
      .where(sql`deleted_at is null`),
    uniqueIndex("contacts_workspace_phone_active_idx")
      .on(table.workspaceId, table.phone)
      .where(sql`deleted_at is null`),
  ],
);

export const companies = pgTable(
  "companies",
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    name: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("companies_workspace_id_idx").on(table.workspaceId),
    index("companies_workspace_active_idx")
      .on(table.workspaceId)
      .where(sql`deleted_at is null`),
  ],
);

export const users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  email: text().notNull().unique(),
  name: text().notNull(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  active: boolean().notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

export const memberships = pgTable(
  "memberships",
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    role: text().notNull().$type<"admin" | "member">(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("memberships_workspace_id_idx").on(table.workspaceId),
    uniqueIndex("memberships_user_workspace_key").on(
      table.userId,
      table.workspaceId,
    ),
  ],
);

export const pipelines = pgTable(
  "pipelines",
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    name: text().notNull(),
    position: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("pipelines_workspace_id_idx").on(table.workspaceId),
    index("pipelines_workspace_active_idx")
      .on(table.workspaceId)
      .where(sql`deleted_at is null`),
  ],
);

export const stages = pgTable(
  "stages",
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    pipelineId: uuid("pipeline_id")
      .references(() => pipelines.id, { onDelete: "cascade" })
      .notNull(),
    name: text().notNull(),
    position: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("stages_workspace_id_idx").on(table.workspaceId),
    index("stages_pipeline_active_idx")
      .on(table.pipelineId)
      .where(sql`deleted_at is null`),
  ],
);

export const deals = pgTable(
  "deals",
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    pipelineId: uuid("pipeline_id")
      .references(() => pipelines.id, { onDelete: "cascade" })
      .notNull(),
    stageId: uuid("stage_id")
      .references(() => stages.id, { onDelete: "cascade" })
      .notNull(),
    title: text().notNull(),
    valueCents: bigint("value_cents", { mode: "number" }),
    contactId: uuid("contact_id").references(() => contacts.id),
    companyId: uuid("company_id").references(() => companies.id),
    position: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("deals_workspace_id_idx").on(table.workspaceId),
    index("deals_stage_active_idx")
      .on(table.stageId)
      .where(sql`deleted_at is null`),
  ],
);

export const notes = pgTable(
  "notes",
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    contactId: uuid("contact_id").references(() => contacts.id),
    companyId: uuid("company_id").references(() => companies.id),
    dealId: uuid("deal_id").references(() => deals.id),
    authorId: uuid("author_id").references(() => users.id),
    body: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("notes_workspace_id_idx").on(table.workspaceId),
    index("notes_contact_active_idx")
      .on(table.contactId)
      .where(sql`deleted_at is null`),
    index("notes_company_active_idx")
      .on(table.companyId)
      .where(sql`deleted_at is null`),
    index("notes_deal_active_idx")
      .on(table.dealId)
      .where(sql`deleted_at is null`),
  ],
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    contactId: uuid("contact_id").references(() => contacts.id),
    companyId: uuid("company_id").references(() => companies.id),
    dealId: uuid("deal_id").references(() => deals.id),
    assigneeId: uuid("assignee_id").references(() => users.id),
    title: text().notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }),
    doneAt: timestamp("done_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("tasks_workspace_id_idx").on(table.workspaceId),
    index("tasks_contact_active_idx")
      .on(table.contactId)
      .where(sql`deleted_at is null`),
    index("tasks_company_active_idx")
      .on(table.companyId)
      .where(sql`deleted_at is null`),
    index("tasks_deal_active_idx")
      .on(table.dealId)
      .where(sql`deleted_at is null`),
  ],
);

export const invitations = pgTable(
  "invitations",
  {
    id: uuid().defaultRandom().primaryKey(),
    email: text().notNull(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    role: text().notNull().$type<"admin" | "member">(),
    token: text().notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("invitations_workspace_id_idx").on(table.workspaceId)],
);

export const channelInstances = pgTable(
  "channel_instances",
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    provider: text().notNull(),
    providerInstanceId: text("provider_instance_id"),
    webhookSecret: text("webhook_secret").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("channel_instances_workspace_id_idx").on(table.workspaceId),
    uniqueIndex("channel_instances_provider_key_idx").on(
      table.workspaceId,
      table.provider,
      table.providerInstanceId,
    ),
  ],
);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    channelInstanceId: uuid("channel_instance_id")
      .references(() => channelInstances.id, { onDelete: "cascade" })
      .notNull(),
    contactId: uuid("contact_id").references(() => contacts.id),
    providerThreadId: text("provider_thread_id").notNull(),
    epoch: integer().notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("conversations_workspace_id_idx").on(table.workspaceId),
    uniqueIndex("conversations_thread_key_idx").on(
      table.channelInstanceId,
      table.providerThreadId,
    ),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    providerMessageId: text("provider_message_id"),
    direction: text().notNull(),
    status: text().notNull().default("received"),
    contentType: text("content_type").notNull().default("text"),
    body: text(),
    /** Object-store key of the attachment bytes (MediaStore), when present. */
    mediaKey: text("media_key"),
    mediaMime: text("media_mime"),
    mediaFilename: text("media_filename"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("messages_conversation_id_idx").on(table.conversationId),
    uniqueIndex("messages_provider_id_idx").on(
      table.conversationId,
      table.providerMessageId,
    ),
  ],
);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    channelInstanceId: uuid("channel_instance_id")
      .references(() => channelInstances.id, { onDelete: "cascade" })
      .notNull(),
    providerEventId: text("provider_event_id").notNull(),
    providerEventKind: text("provider_event_kind").notNull(),
    payload: jsonb().notNull(),
    signatureVerified: boolean("signature_verified").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("webhook_events_channel_id_idx").on(table.channelInstanceId),
    uniqueIndex("webhook_events_unique_idx").on(
      table.channelInstanceId,
      table.providerEventId,
      table.providerEventKind,
    ),
  ],
);

export const dispatchIntents = pgTable(
  "dispatch_intents",
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    channelInstanceId: uuid("channel_instance_id")
      .references(() => channelInstances.id, { onDelete: "cascade" })
      .notNull(),
    messageId: uuid("message_id")
      .references(() => messages.id, { onDelete: "cascade" })
      .notNull(),
    epoch: integer().notNull(),
    status: text().notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("dispatch_intents_effect_key_idx").on(
      table.channelInstanceId,
      table.messageId,
    ),
    index("dispatch_intents_workspace_status_idx").on(
      table.workspaceId,
      table.status,
    ),
  ],
);

export const dispatchAttempts = pgTable(
  "dispatch_attempts",
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    intentId: uuid("intent_id")
      .references(() => dispatchIntents.id, { onDelete: "cascade" })
      .notNull(),
    fencingToken: uuid("fencing_token").defaultRandom().notNull(),
    leaseExpiresAt: timestamp("lease_expires_at", {
      withTimezone: true,
    }).notNull(),
    status: text().notNull().default("dispatching"),
    error: text(),
    startedAt: timestamp("started_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("dispatch_attempts_lease_idx")
      .on(table.leaseExpiresAt)
      .where(sql`${table.completedAt} IS NULL`),
  ],
);
