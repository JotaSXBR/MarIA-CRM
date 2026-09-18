import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
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
    companyId: uuid("company_id").references(() => companies.id),
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
    index("contacts_company_active_idx")
      .on(table.companyId)
      .where(sql`deleted_at is null`),
    // NULLs-distinct is intended here: contacts without a phone may coexist.
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
    role: text().notNull().$type<"viewer" | "agent" | "manager" | "admin">(),
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

export const tags = pgTable(
  "tags",
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    name: text().notNull(),
    color: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("tags_workspace_id_idx").on(table.workspaceId),
    index("tags_workspace_active_idx")
      .on(table.workspaceId)
      .where(sql`deleted_at is null`),
    uniqueIndex("tags_workspace_name_active_idx")
      .on(table.workspaceId, table.name)
      .where(sql`deleted_at is null`),
  ],
);

const entityTagColumns = {
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  tagId: uuid("tag_id")
    .references(() => tags.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const contactTags = pgTable(
  "contact_tags",
  {
    ...entityTagColumns,
    contactId: uuid("contact_id")
      .references(() => contacts.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.tagId, table.contactId] }),
    index("contact_tags_contact_idx").on(table.contactId),
  ],
);

export const companyTags = pgTable(
  "company_tags",
  {
    ...entityTagColumns,
    companyId: uuid("company_id")
      .references(() => companies.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.tagId, table.companyId] }),
    index("company_tags_company_idx").on(table.companyId),
  ],
);

export const dealTags = pgTable(
  "deal_tags",
  {
    ...entityTagColumns,
    dealId: uuid("deal_id")
      .references(() => deals.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.tagId, table.dealId] }),
    index("deal_tags_deal_idx").on(table.dealId),
  ],
);

export const attributeDefinitions = pgTable(
  "attribute_definitions",
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    entityType: text("entity_type")
      .notNull()
      .$type<"contact" | "company" | "deal">(),
    key: text().notNull(),
    label: text().notNull(),
    type: text()
      .notNull()
      .$type<"text" | "number" | "date" | "boolean" | "select">(),
    options: jsonb().$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("attribute_definitions_workspace_id_idx").on(table.workspaceId),
    index("attribute_definitions_entity_idx").on(
      table.workspaceId,
      table.entityType,
    ),
    uniqueIndex("attribute_definitions_workspace_entity_key_active_idx")
      .on(table.workspaceId, table.entityType, table.key)
      .where(sql`deleted_at is null`),
  ],
);

export const entityAttributeValues = pgTable(
  "entity_attribute_values",
  {
    id: uuid().defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    attributeId: uuid("attribute_id")
      .references(() => attributeDefinitions.id, { onDelete: "cascade" })
      .notNull(),
    entityType: text("entity_type")
      .notNull()
      .$type<"contact" | "company" | "deal">(),
    entityId: uuid("entity_id").notNull(),
    value: jsonb().$type<string | number | boolean | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("entity_attribute_values_attribute_entity_idx").on(
      table.attributeId,
      table.entityId,
    ),
    index("entity_attribute_values_entity_idx").on(
      table.workspaceId,
      table.entityType,
      table.entityId,
    ),
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
    role: text().notNull().$type<"viewer" | "agent" | "manager" | "admin">(),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    invitedBy: uuid("invited_by").references(() => users.id, {
      onDelete: "set null",
    }),
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
    // Postgres treats NULLs as distinct in unique indexes, so a single index
    // would allow duplicate default (NULL) instances per workspace+provider.
    uniqueIndex("channel_instances_provider_key_idx")
      .on(table.workspaceId, table.provider, table.providerInstanceId)
      .where(sql`${table.providerInstanceId} is not null`),
    uniqueIndex("channel_instances_default_provider_key_idx")
      .on(table.workspaceId, table.provider)
      .where(sql`${table.providerInstanceId} is null`),
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
    // NULLs-distinct is intended here: local messages without a provider id
    // may coexist; only provider-identified messages deduplicate.
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
