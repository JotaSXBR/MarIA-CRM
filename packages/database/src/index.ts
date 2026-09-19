import { alias } from "drizzle-orm/pg-core";
import {
  and,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  lt,
  ne,
  or,
  sql,
  type SQLWrapper,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { generateKeyBetween } from "fractional-indexing";
import type { Pool } from "pg";
import {
  attributeDefinitions,
  channelInstances,
  companies,
  companyTags,
  contacts,
  contactTags,
  conversationAssignments,
  conversations,
  deals,
  dealTags,
  dispatchAttempts,
  dispatchIntents,
  entityAttributeValues,
  memberships,
  messages,
  notes,
  organizations,
  pipelines,
  quickReplies,
  stages,
  tags,
  tasks,
  users,
  webhookEvents,
  workspaces,
} from "./schema.ts";

const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// WAHA `message.ack` names → message status (ADR 0010 reconciliation).
const ACK_STATUS_TARGETS: Record<string, string> = {
  SERVER: "sent",
  DEVICE: "delivered",
  READ: "read",
  PLAYED: "read",
  ERROR: "failed",
};

// Monotonic delivery ranks: an ack only moves a message forward. `unknown`,
// `failed` and `cancelled` rank below `sent` so a later authoritative ack can
// still reconcile them; `read` is the ceiling and never regresses.
const DELIVERY_RANK: Record<string, number> = {
  pending: 0,
  unknown: 1,
  failed: 1,
  cancelled: 1,
  sent: 2,
  delivered: 3,
  read: 4,
};

export function createDatabase(pool: Pool) {
  const db = drizzle({ client: pool });
  type DrizzleTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

  const scopedTransaction = async <T>(
    setting: { name: string; value: string; uuid?: boolean },
    callback: (tx: DrizzleTx) => Promise<T>,
  ) => {
    if (setting.uuid !== false && !uuid.test(setting.value)) {
      throw new TypeError(`${setting.name} must be a UUID`);
    }

    return db.transaction(async (tx) => {
      const { rows } = await tx.execute<{ unsafe: boolean }>(sql`
        select coalesce(bool_or(rolsuper or rolbypassrls), true) as unsafe
        from pg_roles
        where rolname = current_user
      `);
      const isUnsafe = rows[0]?.unsafe ?? true;
      if (isUnsafe) {
        throw new Error("database role must not be superuser or BYPASSRLS");
      }
      await tx.execute(
        sql`select set_config(${setting.name}, ${setting.value}, true)`,
      );
      return callback(tx);
    });
  };

  const withWorkspace = <T>(
    workspaceId: string,
    callback: (tx: DrizzleTx) => Promise<T>,
  ) =>
    scopedTransaction(
      { name: "app.workspace_id", value: workspaceId },
      callback,
    );

  const withUser = <T>(
    userId: string,
    callback: (tx: DrizzleTx) => Promise<T>,
  ) => scopedTransaction({ name: "app.user_id", value: userId }, callback);

  /** Invite-token scope: the token hash itself authorizes reading exactly
   * its own invitation row (ADR 0015 item 5); the value is always bound as
   * a parameter, never interpolated. */
  const withInvitation = <T>(
    tokenHash: string,
    callback: (tx: DrizzleTx) => Promise<T>,
  ) =>
    scopedTransaction(
      { name: "app.invite_token_hash", value: tokenHash, uuid: false },
      callback,
    );

  const contactColumns = {
    id: contacts.id,
    name: contacts.name,
    email: contacts.email,
    phone: contacts.phone,
    companyId: contacts.companyId,
    createdAt: contacts.createdAt,
  };

  const companyColumns = {
    id: companies.id,
    name: companies.name,
    createdAt: companies.createdAt,
  };

  const pipelineColumns = {
    id: pipelines.id,
    name: pipelines.name,
    position: pipelines.position,
    createdAt: pipelines.createdAt,
  };

  const stageColumns = {
    id: stages.id,
    pipelineId: stages.pipelineId,
    name: stages.name,
    position: stages.position,
    createdAt: stages.createdAt,
  };

  const dealColumns = {
    id: deals.id,
    pipelineId: deals.pipelineId,
    stageId: deals.stageId,
    title: deals.title,
    valueCents: deals.valueCents,
    contactId: deals.contactId,
    companyId: deals.companyId,
    position: deals.position,
    createdAt: deals.createdAt,
  };

  const notDeleted = (deletedAt: SQLWrapper) => isNull(deletedAt);

  const lastPosition = async (
    tx: DrizzleTx,
    table: typeof pipelines | typeof stages | typeof deals,
    parent?: SQLWrapper,
  ) => {
    const rows = await tx
      .select({ position: table.position })
      .from(table)
      .where(and(parent, notDeleted(table.deletedAt)))
      .orderBy(desc(table.position))
      .limit(1);
    return rows[0]?.position ?? null;
  };

  const dealRefsValid = async (
    tx: DrizzleTx,
    input: {
      pipelineId: string;
      stageId: string;
      contactId?: string | null | undefined;
      companyId?: string | null | undefined;
    },
  ) => {
    const stage = await tx
      .select({ pipelineId: stages.pipelineId })
      .from(stages)
      .where(and(eq(stages.id, input.stageId), notDeleted(stages.deletedAt)))
      .limit(1);
    if (!stage[0] || stage[0].pipelineId !== input.pipelineId) return false;
    return contactCompanyRefsValid(tx, input);
  };

  const contactCompanyRefsValid = async (
    tx: DrizzleTx,
    input: {
      contactId?: string | null | undefined;
      companyId?: string | null | undefined;
    },
  ) => {
    if (input.contactId) {
      const contact = await tx
        .select({ id: contacts.id })
        .from(contacts)
        .where(
          and(eq(contacts.id, input.contactId), notDeleted(contacts.deletedAt)),
        )
        .limit(1);
      if (!contact[0]) return false;
    }
    if (input.companyId) {
      const company = await tx
        .select({ id: companies.id })
        .from(companies)
        .where(
          and(
            eq(companies.id, input.companyId),
            notDeleted(companies.deletedAt),
          ),
        )
        .limit(1);
      if (!company[0]) return false;
    }
    return true;
  };

  const dealRefValid = async (tx: DrizzleTx, dealId: string) => {
    const deal = await tx
      .select({ id: deals.id })
      .from(deals)
      .where(and(eq(deals.id, dealId), notDeleted(deals.deletedAt)))
      .limit(1);
    return Boolean(deal[0]);
  };

  const entityRefsValid = async (
    tx: DrizzleTx,
    input: {
      contactId?: string | null | undefined;
      companyId?: string | null | undefined;
      dealId?: string | null | undefined;
    },
  ) => {
    if (input.dealId && !(await dealRefValid(tx, input.dealId))) return false;
    return contactCompanyRefsValid(tx, input);
  };

  const noteColumns = {
    id: notes.id,
    contactId: notes.contactId,
    companyId: notes.companyId,
    dealId: notes.dealId,
    authorId: notes.authorId,
    body: notes.body,
    createdAt: notes.createdAt,
  };

  const taskColumns = {
    id: tasks.id,
    contactId: tasks.contactId,
    companyId: tasks.companyId,
    dealId: tasks.dealId,
    assigneeId: tasks.assigneeId,
    title: tasks.title,
    dueAt: tasks.dueAt,
    doneAt: tasks.doneAt,
    createdAt: tasks.createdAt,
  };

  const tagColumns = {
    id: tags.id,
    name: tags.name,
    color: tags.color,
    createdAt: tags.createdAt,
  };

  const quickReplyColumns = {
    id: quickReplies.id,
    title: quickReplies.title,
    shortcut: quickReplies.shortcut,
    body: quickReplies.body,
    createdBy: quickReplies.createdBy,
    createdAt: quickReplies.createdAt,
    updatedAt: quickReplies.updatedAt,
  };

  /** `/saudacao` → `saudacao`: lowercase, no leading slash, collapsed spaces. */
  const normalizeShortcut = (input: string) =>
    input.trim().toLowerCase().replace(/^\/+/, "").replace(/\s+/g, "-");

  type EntityTagTable =
    typeof contactTags | typeof companyTags | typeof dealTags;
  type EntityTagColumn =
    | (typeof contactTags)["contactId"]
    | (typeof companyTags)["companyId"]
    | (typeof dealTags)["dealId"];

  const tagsForEntity = (
    tx: DrizzleTx,
    joinTable: EntityTagTable,
    entityColumn: EntityTagColumn,
    entityId: string,
  ) =>
    tx
      .select(tagColumns)
      .from(joinTable)
      .innerJoin(tags, eq(joinTable.tagId, tags.id))
      .where(and(eq(entityColumn, entityId), notDeleted(tags.deletedAt)))
      .orderBy(tags.name, tags.id);

  // Wipe-and-rewrite assignment: every supplied tag must be an active tag of
  // the caller's workspace — a bare FK would not prove tenant equality.
  const setEntityTags = async (
    tx: DrizzleTx,
    joinTable: EntityTagTable,
    entityColumn: EntityTagColumn,
    entityId: string,
    tagIds: string[],
    insertRows: (tagIds: string[]) => Promise<unknown>,
  ) => {
    const uniqueTagIds = [...new Set(tagIds)];
    if (uniqueTagIds.length > 0) {
      const found = await tx
        .select({ id: tags.id })
        .from(tags)
        .where(and(inArray(tags.id, uniqueTagIds), notDeleted(tags.deletedAt)));
      if (found.length !== uniqueTagIds.length) return undefined;
    }
    await tx.delete(joinTable).where(eq(entityColumn, entityId));
    if (uniqueTagIds.length > 0) await insertRows(uniqueTagIds);
    return tagsForEntity(tx, joinTable, entityColumn, entityId);
  };

  const attributeColumns = {
    id: attributeDefinitions.id,
    entityType: attributeDefinitions.entityType,
    key: attributeDefinitions.key,
    label: attributeDefinitions.label,
    type: attributeDefinitions.type,
    options: attributeDefinitions.options,
    createdAt: attributeDefinitions.createdAt,
    updatedAt: attributeDefinitions.updatedAt,
  };

  type AttributeEntityType = "contact" | "company" | "deal";
  type AttributeValue = string | number | boolean | null;

  const entityExists = (
    tx: DrizzleTx,
    entityType: AttributeEntityType,
    entityId: string,
  ) =>
    entityType === "deal"
      ? dealRefValid(tx, entityId)
      : contactCompanyRefsValid(
          tx,
          entityType === "contact"
            ? { contactId: entityId }
            : { companyId: entityId },
        );

  const attributesForEntity = (
    tx: DrizzleTx,
    entityType: AttributeEntityType,
    entityId: string,
  ) =>
    tx
      .select({ ...attributeColumns, value: entityAttributeValues.value })
      .from(attributeDefinitions)
      .leftJoin(
        entityAttributeValues,
        and(
          eq(entityAttributeValues.attributeId, attributeDefinitions.id),
          eq(entityAttributeValues.entityId, entityId),
        ),
      )
      .where(
        and(
          eq(attributeDefinitions.entityType, entityType),
          notDeleted(attributeDefinitions.deletedAt),
        ),
      )
      .orderBy(attributeDefinitions.label, attributeDefinitions.id);

  const attributeValueMatches = (
    value: AttributeValue,
    definition: {
      type: "text" | "number" | "date" | "boolean" | "select";
      options: string[] | null;
    },
  ) => {
    switch (definition.type) {
      case "text":
        return typeof value === "string";
      case "number":
        return typeof value === "number" && Number.isFinite(value);
      case "date":
        return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
      case "boolean":
        return typeof value === "boolean";
      case "select":
        return (
          typeof value === "string" &&
          Array.isArray(definition.options) &&
          definition.options.includes(value)
        );
    }
  };

  const slugifyKey = (label: string) =>
    label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "field";

  // Wipe-and-rewrite: every supplied attribute must be an active definition
  // of this workspace and entity type, and each value must match the
  // definition type — FKs cannot prove tenant or type equality.
  const setEntityAttributeValues = async (
    tx: DrizzleTx,
    workspaceId: string,
    entityType: AttributeEntityType,
    entityId: string,
    values: { attributeId: string; value: AttributeValue }[],
  ) => {
    const byAttribute = new Map(
      values.map((entry) => [entry.attributeId, entry.value]),
    );
    const attributeIds = [...byAttribute.keys()];
    if (attributeIds.length > 0) {
      const definitions = await tx
        .select({
          id: attributeDefinitions.id,
          type: attributeDefinitions.type,
          options: attributeDefinitions.options,
        })
        .from(attributeDefinitions)
        .where(
          and(
            inArray(attributeDefinitions.id, attributeIds),
            eq(attributeDefinitions.entityType, entityType),
            notDeleted(attributeDefinitions.deletedAt),
          ),
        );
      if (definitions.length !== attributeIds.length) return undefined;
      for (const definition of definitions) {
        const value = byAttribute.get(definition.id);
        if (value === null || value === undefined) continue;
        if (!attributeValueMatches(value, definition)) return undefined;
      }
    }
    await tx
      .delete(entityAttributeValues)
      .where(
        and(
          eq(entityAttributeValues.entityId, entityId),
          eq(entityAttributeValues.entityType, entityType),
        ),
      );
    const rows = attributeIds
      .map((attributeId) => ({
        workspaceId,
        attributeId,
        entityType,
        entityId,
        value: byAttribute.get(attributeId) ?? null,
      }))
      .filter((row) => row.value !== null);
    if (rows.length > 0) await tx.insert(entityAttributeValues).values(rows);
    return attributesForEntity(tx, entityType, entityId);
  };

  const channelInstanceColumns = {
    id: channelInstances.id,
    workspaceId: channelInstances.workspaceId,
    provider: channelInstances.provider,
    providerInstanceId: channelInstances.providerInstanceId,
    webhookSecret: channelInstances.webhookSecret,
    isActive: channelInstances.isActive,
    createdAt: channelInstances.createdAt,
    updatedAt: channelInstances.updatedAt,
  };

  const conversationColumns = {
    id: conversations.id,
    workspaceId: conversations.workspaceId,
    channelInstanceId: conversations.channelInstanceId,
    contactId: conversations.contactId,
    contactName: contacts.name,
    providerThreadId: conversations.providerThreadId,
    assignedUserId: conversations.assignedUserId,
    assignedUserName: users.name,
    assignedAt: conversations.assignedAt,
    epoch: conversations.epoch,
    createdAt: conversations.createdAt,
    updatedAt: conversations.updatedAt,
  };

  const messageColumns = {
    id: messages.id,
    workspaceId: messages.workspaceId,
    conversationId: messages.conversationId,
    providerMessageId: messages.providerMessageId,
    kind: messages.kind,
    direction: messages.direction,
    status: messages.status,
    authorUserId: messages.authorUserId,
    contentType: messages.contentType,
    body: messages.body,
    mediaKey: messages.mediaKey,
    mediaMime: messages.mediaMime,
    mediaFilename: messages.mediaFilename,
    createdAt: messages.createdAt,
  };

  /** Message rows + the author's display name (null for provider-authored
   * inbound). Both message reads share the join. */
  const messagesWithAuthor = (tx: DrizzleTx) =>
    tx
      .select({ ...messageColumns, authorName: users.name })
      .from(messages)
      .leftJoin(users, eq(messages.authorUserId, users.id));

  type EntityFilter = {
    contactId?: string | undefined;
    companyId?: string | undefined;
    dealId?: string | undefined;
  };

  const entityFilterClauses = (
    table: {
      contactId: SQLWrapper;
      companyId: SQLWrapper;
      dealId: SQLWrapper;
    },
    filter: EntityFilter,
  ) => [
    filter.contactId ? eq(table.contactId, filter.contactId) : undefined,
    filter.companyId ? eq(table.companyId, filter.companyId) : undefined,
    filter.dealId ? eq(table.dealId, filter.dealId) : undefined,
  ];

  const dealsWithNames = (tx: DrizzleTx, parent: SQLWrapper) =>
    tx
      .select({
        ...dealColumns,
        stageName: stages.name,
        pipelineName: pipelines.name,
        contactName: contacts.name,
        companyName: companies.name,
      })
      .from(deals)
      .innerJoin(stages, eq(deals.stageId, stages.id))
      .innerJoin(pipelines, eq(deals.pipelineId, pipelines.id))
      .leftJoin(contacts, eq(deals.contactId, contacts.id))
      .leftJoin(companies, eq(deals.companyId, companies.id))
      .where(and(parent, notDeleted(deals.deletedAt)))
      .orderBy(desc(deals.createdAt), deals.id);

  // Provider-event dedup (ADR 0010): the insert is the receipt — a conflict
  // means this (channel, event id, kind) was already processed.
  const recordWebhookEvent = async (
    tx: DrizzleTx,
    input: {
      workspaceId: string;
      channelInstanceId: string;
      providerEventId: string;
      providerEventKind: string;
      rawPayload: unknown;
      signatureVerified: boolean;
    },
  ) => {
    const rows = await tx
      .insert(webhookEvents)
      .values({
        workspaceId: input.workspaceId,
        channelInstanceId: input.channelInstanceId,
        providerEventId: input.providerEventId,
        providerEventKind: input.providerEventKind,
        payload: input.rawPayload as Record<string, unknown>,
        signatureVerified: input.signatureVerified,
        processedAt: new Date(),
      })
      .onConflictDoNothing({
        target: [
          webhookEvents.channelInstanceId,
          webhookEvents.providerEventId,
          webhookEvents.providerEventKind,
        ],
      })
      .returning({ id: webhookEvents.id });
    return rows.length > 0;
  };

  return {
    close: () => pool.end(),
    listContacts: (
      workspaceId: string,
      filter: { companyId?: string | undefined } = {},
    ) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select(contactColumns)
          .from(contacts)
          .where(
            and(
              notDeleted(contacts.deletedAt),
              filter.companyId
                ? eq(contacts.companyId, filter.companyId)
                : undefined,
            ),
          )
          .orderBy(contacts.createdAt, contacts.id),
      ),
    getContact: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .select(contactColumns)
          .from(contacts)
          .where(and(eq(contacts.id, id), notDeleted(contacts.deletedAt)))
          .limit(1);
        return rows[0];
      }),
    createContact: (
      workspaceId: string,
      input: {
        name: string;
        email?: string | null;
        phone?: string | null;
        companyId?: string | null;
      },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const refsValid = await contactCompanyRefsValid(tx, {
          companyId: input.companyId,
        });
        if (!refsValid) return undefined;
        const rows = await tx
          .insert(contacts)
          .values({ workspaceId, ...input })
          .returning(contactColumns);
        const row = rows[0];
        if (!row) throw new Error("contact insert returned no row");
        return row;
      }),
    updateContact: (
      workspaceId: string,
      id: string,
      input: {
        name?: string;
        email?: string | null;
        phone?: string | null;
        companyId?: string | null;
      },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const refsValid = await contactCompanyRefsValid(tx, {
          companyId: input.companyId,
        });
        if (!refsValid) return undefined;
        const rows = await tx
          .update(contacts)
          .set(input)
          .where(and(eq(contacts.id, id), notDeleted(contacts.deletedAt)))
          .returning(contactColumns);
        return rows[0];
      }),
    deleteContact: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .update(contacts)
          .set({ deletedAt: new Date() })
          .where(and(eq(contacts.id, id), notDeleted(contacts.deletedAt)))
          .returning({ id: contacts.id });
        return rows.length > 0;
      }),
    listCompanies: (workspaceId: string) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select(companyColumns)
          .from(companies)
          .where(notDeleted(companies.deletedAt))
          .orderBy(companies.createdAt, companies.id),
      ),
    getCompany: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .select(companyColumns)
          .from(companies)
          .where(and(eq(companies.id, id), notDeleted(companies.deletedAt)))
          .limit(1);
        return rows[0];
      }),
    createCompany: (workspaceId: string, input: { name: string }) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .insert(companies)
          .values({ workspaceId, ...input })
          .returning(companyColumns);
        const row = rows[0];
        if (!row) throw new Error("company insert returned no row");
        return row;
      }),
    updateCompany: (
      workspaceId: string,
      id: string,
      input: { name?: string },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .update(companies)
          .set(input)
          .where(and(eq(companies.id, id), notDeleted(companies.deletedAt)))
          .returning(companyColumns);
        return rows[0];
      }),
    deleteCompany: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .update(companies)
          .set({ deletedAt: new Date() })
          .where(and(eq(companies.id, id), notDeleted(companies.deletedAt)))
          .returning({ id: companies.id });
        return rows.length > 0;
      }),
    listOrganizations: () =>
      db
        .select({
          id: organizations.id,
          name: organizations.name,
          createdAt: organizations.createdAt,
        })
        .from(organizations)
        .orderBy(organizations.createdAt, organizations.id),
    createOrganization: async (input: { name: string }) => {
      const rows = await db
        .insert(organizations)
        .values(input)
        .returning({ id: organizations.id });
      const row = rows[0];
      if (!row) throw new Error("organization insert returned no row");
      return row;
    },
    listWorkspaces: () =>
      db
        .select({
          id: workspaces.id,
          orgId: workspaces.orgId,
          name: workspaces.name,
          createdAt: workspaces.createdAt,
        })
        .from(workspaces)
        .orderBy(workspaces.createdAt, workspaces.id),
    createWorkspace: async (input: { orgId: string; name: string }) => {
      const org = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.id, input.orgId))
        .limit(1);
      if (!org[0]) return undefined;
      const rows = await db
        .insert(workspaces)
        .values(input)
        .returning({ id: workspaces.id });
      const row = rows[0];
      if (!row) throw new Error("workspace insert returned no row");
      return row;
    },
    listPipelines: (workspaceId: string) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select(pipelineColumns)
          .from(pipelines)
          .where(notDeleted(pipelines.deletedAt))
          .orderBy(pipelines.position, pipelines.id),
      ),
    createPipeline: (workspaceId: string, input: { name: string }) =>
      withWorkspace(workspaceId, async (tx) => {
        const position = generateKeyBetween(
          await lastPosition(tx, pipelines),
          null,
        );
        const rows = await tx
          .insert(pipelines)
          .values({ workspaceId, name: input.name, position })
          .returning(pipelineColumns);
        const row = rows[0];
        if (!row) throw new Error("pipeline insert returned no row");
        return row;
      }),
    updatePipeline: (
      workspaceId: string,
      id: string,
      input: { name?: string },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .update(pipelines)
          .set(input)
          .where(and(eq(pipelines.id, id), notDeleted(pipelines.deletedAt)))
          .returning(pipelineColumns);
        return rows[0];
      }),
    deletePipeline: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const pipeline = await tx
          .select({ id: pipelines.id })
          .from(pipelines)
          .where(and(eq(pipelines.id, id), notDeleted(pipelines.deletedAt)))
          .limit(1);
        if (!pipeline[0]) return "not-found";
        const activeDeals = await tx
          .select({ id: deals.id })
          .from(deals)
          .where(and(eq(deals.pipelineId, id), notDeleted(deals.deletedAt)))
          .limit(1);
        if (activeDeals[0]) return "has-deals";
        await tx
          .update(pipelines)
          .set({ deletedAt: new Date() })
          .where(eq(pipelines.id, id));
        return "deleted";
      }),
    listStages: (workspaceId: string, pipelineId: string) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select(stageColumns)
          .from(stages)
          .where(
            and(
              eq(stages.pipelineId, pipelineId),
              notDeleted(stages.deletedAt),
            ),
          )
          .orderBy(stages.position, stages.id),
      ),
    createStage: (
      workspaceId: string,
      pipelineId: string,
      input: { name: string },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const pipeline = await tx
          .select({ id: pipelines.id })
          .from(pipelines)
          .where(
            and(eq(pipelines.id, pipelineId), notDeleted(pipelines.deletedAt)),
          )
          .limit(1);
        if (!pipeline[0]) return undefined;
        const position = generateKeyBetween(
          await lastPosition(tx, stages, eq(stages.pipelineId, pipelineId)),
          null,
        );
        const rows = await tx
          .insert(stages)
          .values({
            workspaceId,
            pipelineId,
            name: input.name,
            position,
          })
          .returning(stageColumns);
        const row = rows[0];
        if (!row) throw new Error("stage insert returned no row");
        return row;
      }),
    updateStage: (workspaceId: string, id: string, input: { name?: string }) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .update(stages)
          .set(input)
          .where(and(eq(stages.id, id), notDeleted(stages.deletedAt)))
          .returning(stageColumns);
        return rows[0];
      }),
    deleteStage: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const stage = await tx
          .select({ id: stages.id })
          .from(stages)
          .where(and(eq(stages.id, id), notDeleted(stages.deletedAt)))
          .limit(1);
        if (!stage[0]) return "not-found";
        const activeDeals = await tx
          .select({ id: deals.id })
          .from(deals)
          .where(and(eq(deals.stageId, id), notDeleted(deals.deletedAt)))
          .limit(1);
        if (activeDeals[0]) return "has-deals";
        await tx
          .update(stages)
          .set({ deletedAt: new Date() })
          .where(eq(stages.id, id));
        return "deleted";
      }),
    listDeals: (workspaceId: string, pipelineId: string) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select(dealColumns)
          .from(deals)
          .where(
            and(eq(deals.pipelineId, pipelineId), notDeleted(deals.deletedAt)),
          )
          .orderBy(deals.position, deals.id),
      ),
    getDeal: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await dealsWithNames(tx, eq(deals.id, id)).limit(1);
        return rows[0];
      }),
    createDeal: (
      workspaceId: string,
      input: {
        pipelineId: string;
        stageId: string;
        title: string;
        valueCents?: number | null;
        contactId?: string | null;
        companyId?: string | null;
      },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const refsValid = await dealRefsValid(tx, input);
        if (!refsValid) return undefined;
        const position = generateKeyBetween(
          await lastPosition(tx, deals, eq(deals.stageId, input.stageId)),
          null,
        );
        const rows = await tx
          .insert(deals)
          .values({
            workspaceId,
            pipelineId: input.pipelineId,
            stageId: input.stageId,
            title: input.title,
            valueCents: input.valueCents ?? null,
            contactId: input.contactId ?? null,
            companyId: input.companyId ?? null,
            position,
          })
          .returning(dealColumns);
        const row = rows[0];
        if (!row) throw new Error("deal insert returned no row");
        return row;
      }),
    updateDeal: (
      workspaceId: string,
      id: string,
      input: {
        title?: string;
        valueCents?: number | null;
        contactId?: string | null;
        companyId?: string | null;
      },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const deal = await tx
          .select({ id: deals.id })
          .from(deals)
          .where(and(eq(deals.id, id), notDeleted(deals.deletedAt)))
          .limit(1);
        if (!deal[0]) return undefined;
        const refsValid = await contactCompanyRefsValid(tx, {
          contactId: input.contactId,
          companyId: input.companyId,
        });
        if (!refsValid) return undefined;
        // Drizzle skips `undefined` values in .set(); bail before emitting an
        // empty UPDATE when the patch carries no field.
        if (Object.values(input).every((value) => value === undefined)) {
          return undefined;
        }
        const rows = await tx
          .update(deals)
          .set(input)
          .where(and(eq(deals.id, id), notDeleted(deals.deletedAt)))
          .returning(dealColumns);
        return rows[0];
      }),
    moveDeal: (
      workspaceId: string,
      id: string,
      input: {
        stageId: string;
        prevDealId?: string | null;
        nextDealId?: string | null;
      },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const deal = await tx
          .select({ pipelineId: deals.pipelineId })
          .from(deals)
          .where(and(eq(deals.id, id), notDeleted(deals.deletedAt)))
          .limit(1);
        if (!deal[0]) return undefined;
        const stage = await tx
          .select({ pipelineId: stages.pipelineId })
          .from(stages)
          .where(
            and(eq(stages.id, input.stageId), notDeleted(stages.deletedAt)),
          )
          .limit(1);
        if (!stage[0]) return undefined;
        const neighbor = async (dealId: string | null | undefined) => {
          if (!dealId) return null;
          const rows = await tx
            .select({ position: deals.position })
            .from(deals)
            .where(
              and(
                eq(deals.id, dealId),
                eq(deals.stageId, input.stageId),
                notDeleted(deals.deletedAt),
              ),
            )
            .limit(1);
          return rows[0]?.position ?? undefined;
        };
        const prev = await neighbor(input.prevDealId);
        const next = await neighbor(input.nextDealId);
        if (prev === undefined || next === undefined) return undefined;
        const rows = await tx
          .update(deals)
          .set({
            stageId: input.stageId,
            pipelineId: stage[0].pipelineId,
            position: generateKeyBetween(prev, next),
          })
          .where(and(eq(deals.id, id), notDeleted(deals.deletedAt)))
          .returning(dealColumns);
        return rows[0];
      }),
    deleteDeal: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .update(deals)
          .set({ deletedAt: new Date() })
          .where(and(eq(deals.id, id), notDeleted(deals.deletedAt)))
          .returning({ id: deals.id });
        return rows.length > 0;
      }),
    listDealsForContact: (workspaceId: string, contactId: string) =>
      withWorkspace(workspaceId, (tx) =>
        dealsWithNames(tx, eq(deals.contactId, contactId)),
      ),
    listDealsForCompany: (workspaceId: string, companyId: string) =>
      withWorkspace(workspaceId, (tx) =>
        dealsWithNames(tx, eq(deals.companyId, companyId)),
      ),
    listNotes: (workspaceId: string, filter: EntityFilter = {}) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select({ ...noteColumns, authorName: users.name })
          .from(notes)
          .leftJoin(users, eq(notes.authorId, users.id))
          .where(
            and(
              notDeleted(notes.deletedAt),
              ...entityFilterClauses(notes, filter),
            ),
          )
          .orderBy(desc(notes.createdAt), notes.id),
      ),
    createNote: (
      workspaceId: string,
      input: {
        body: string;
        authorId?: string | null;
        contactId?: string | null;
        companyId?: string | null;
        dealId?: string | null;
      },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const refsValid = await entityRefsValid(tx, input);
        if (!refsValid) return undefined;
        const rows = await tx
          .insert(notes)
          .values({
            workspaceId,
            body: input.body,
            authorId: input.authorId ?? null,
            contactId: input.contactId ?? null,
            companyId: input.companyId ?? null,
            dealId: input.dealId ?? null,
          })
          .returning(noteColumns);
        return rows[0];
      }),
    deleteNote: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .update(notes)
          .set({ deletedAt: new Date() })
          .where(and(eq(notes.id, id), notDeleted(notes.deletedAt)))
          .returning({ id: notes.id });
        return rows.length > 0;
      }),
    listTasks: (workspaceId: string, filter: EntityFilter = {}) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select({ ...taskColumns, assigneeName: users.name })
          .from(tasks)
          .leftJoin(users, eq(tasks.assigneeId, users.id))
          .where(
            and(
              notDeleted(tasks.deletedAt),
              ...entityFilterClauses(tasks, filter),
            ),
          )
          // Open tasks first (doneAt IS NULL), then most recently completed.
          .orderBy(desc(tasks.doneAt), tasks.dueAt, tasks.createdAt, tasks.id),
      ),
    createTask: (
      workspaceId: string,
      input: {
        title: string;
        assigneeId?: string | null;
        dueAt?: Date | null;
        contactId?: string | null;
        companyId?: string | null;
        dealId?: string | null;
      },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const refsValid = await entityRefsValid(tx, input);
        if (!refsValid) return undefined;
        if (input.assigneeId) {
          const member = await tx
            .select({ id: memberships.id })
            .from(memberships)
            .where(
              and(
                eq(memberships.userId, input.assigneeId),
                eq(memberships.workspaceId, workspaceId),
              ),
            )
            .limit(1);
          if (!member[0]) return undefined;
        }
        const rows = await tx
          .insert(tasks)
          .values({
            workspaceId,
            title: input.title,
            assigneeId: input.assigneeId ?? null,
            dueAt: input.dueAt ?? null,
            contactId: input.contactId ?? null,
            companyId: input.companyId ?? null,
            dealId: input.dealId ?? null,
          })
          .returning(taskColumns);
        return rows[0];
      }),
    updateTask: (
      workspaceId: string,
      id: string,
      input: {
        title?: string;
        dueAt?: Date | null;
        done?: boolean;
      },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const { done, ...fields } = input;
        const rows = await tx
          .update(tasks)
          .set({
            ...fields,
            ...(done !== undefined ? { doneAt: done ? new Date() : null } : {}),
          })
          .where(and(eq(tasks.id, id), notDeleted(tasks.deletedAt)))
          .returning(taskColumns);
        return rows[0];
      }),
    deleteTask: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .update(tasks)
          .set({ deletedAt: new Date() })
          .where(and(eq(tasks.id, id), notDeleted(tasks.deletedAt)))
          .returning({ id: tasks.id });
        return rows.length > 0;
      }),
    listTags: (workspaceId: string) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select(tagColumns)
          .from(tags)
          .where(notDeleted(tags.deletedAt))
          .orderBy(tags.name, tags.id),
      ),
    getTag: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .select(tagColumns)
          .from(tags)
          .where(and(eq(tags.id, id), notDeleted(tags.deletedAt)))
          .limit(1);
        return rows[0];
      }),
    // undefined when another active tag already uses the name (routes → 409).
    createTag: (
      workspaceId: string,
      input: { name: string; color?: string | null },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const existing = await tx
          .select({ id: tags.id })
          .from(tags)
          .where(and(eq(tags.name, input.name), notDeleted(tags.deletedAt)))
          .limit(1);
        if (existing[0]) return undefined;
        const rows = await tx
          .insert(tags)
          .values({
            workspaceId,
            name: input.name,
            color: input.color ?? null,
          })
          .returning(tagColumns);
        const row = rows[0];
        if (!row) throw new Error("tag insert returned no row");
        return row;
      }),
    // undefined when another active tag already uses the name — callers
    // resolve the tag first for 404 vs 409.
    updateTag: (
      workspaceId: string,
      id: string,
      input: { name?: string; color?: string | null },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        if (input.name !== undefined) {
          const conflict = await tx
            .select({ id: tags.id })
            .from(tags)
            .where(
              and(
                eq(tags.name, input.name),
                ne(tags.id, id),
                notDeleted(tags.deletedAt),
              ),
            )
            .limit(1);
          if (conflict[0]) return undefined;
        }
        const rows = await tx
          .update(tags)
          .set(input)
          .where(and(eq(tags.id, id), notDeleted(tags.deletedAt)))
          .returning(tagColumns);
        return rows[0];
      }),
    deleteTag: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .update(tags)
          .set({ deletedAt: new Date() })
          .where(and(eq(tags.id, id), notDeleted(tags.deletedAt)))
          .returning({ id: tags.id });
        return rows.length > 0;
      }),
    listQuickReplies: (workspaceId: string) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select(quickReplyColumns)
          .from(quickReplies)
          .where(notDeleted(quickReplies.deletedAt))
          .orderBy(quickReplies.shortcut, quickReplies.id),
      ),
    getQuickReply: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .select(quickReplyColumns)
          .from(quickReplies)
          .where(
            and(eq(quickReplies.id, id), notDeleted(quickReplies.deletedAt)),
          )
          .limit(1);
        return rows[0];
      }),
    // undefined when another active reply already uses the shortcut (→ 409).
    createQuickReply: (
      workspaceId: string,
      input: {
        title: string;
        shortcut: string;
        body: string;
        createdBy?: string | null;
      },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const shortcut = normalizeShortcut(input.shortcut);
        const existing = await tx
          .select({ id: quickReplies.id })
          .from(quickReplies)
          .where(
            and(
              eq(quickReplies.shortcut, shortcut),
              notDeleted(quickReplies.deletedAt),
            ),
          )
          .limit(1);
        if (existing[0]) return undefined;
        const rows = await tx
          .insert(quickReplies)
          .values({
            workspaceId,
            title: input.title,
            shortcut,
            body: input.body,
            createdBy: input.createdBy ?? null,
          })
          .returning(quickReplyColumns);
        const row = rows[0];
        if (!row) throw new Error("quick reply insert returned no row");
        return row;
      }),
    // undefined when another active reply already uses the shortcut — callers
    // resolve the row first for 404 vs 409.
    updateQuickReply: (
      workspaceId: string,
      id: string,
      input: { title?: string; shortcut?: string; body?: string },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const patch = {
          ...input,
          ...(input.shortcut !== undefined
            ? { shortcut: normalizeShortcut(input.shortcut) }
            : {}),
          updatedAt: new Date(),
        };
        if (patch.shortcut !== undefined) {
          const conflict = await tx
            .select({ id: quickReplies.id })
            .from(quickReplies)
            .where(
              and(
                eq(quickReplies.shortcut, patch.shortcut),
                ne(quickReplies.id, id),
                notDeleted(quickReplies.deletedAt),
              ),
            )
            .limit(1);
          if (conflict[0]) return undefined;
        }
        const rows = await tx
          .update(quickReplies)
          .set(patch)
          .where(
            and(eq(quickReplies.id, id), notDeleted(quickReplies.deletedAt)),
          )
          .returning(quickReplyColumns);
        return rows[0];
      }),
    deleteQuickReply: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .update(quickReplies)
          .set({ deletedAt: new Date() })
          .where(
            and(eq(quickReplies.id, id), notDeleted(quickReplies.deletedAt)),
          )
          .returning({ id: quickReplies.id });
        return rows.length > 0;
      }),
    listContactTags: (workspaceId: string, contactId: string) =>
      withWorkspace(workspaceId, (tx) =>
        tagsForEntity(tx, contactTags, contactTags.contactId, contactId),
      ),
    listCompanyTags: (workspaceId: string, companyId: string) =>
      withWorkspace(workspaceId, (tx) =>
        tagsForEntity(tx, companyTags, companyTags.companyId, companyId),
      ),
    listDealTags: (workspaceId: string, dealId: string) =>
      withWorkspace(workspaceId, (tx) =>
        tagsForEntity(tx, dealTags, dealTags.dealId, dealId),
      ),
    setContactTags: (
      workspaceId: string,
      contactId: string,
      tagIds: string[],
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        if (!(await contactCompanyRefsValid(tx, { contactId })))
          return undefined;
        return setEntityTags(
          tx,
          contactTags,
          contactTags.contactId,
          contactId,
          tagIds,
          (uniqueTagIds) =>
            tx.insert(contactTags).values(
              uniqueTagIds.map((tagId) => ({
                workspaceId,
                tagId,
                contactId,
              })),
            ),
        );
      }),
    setCompanyTags: (
      workspaceId: string,
      companyId: string,
      tagIds: string[],
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        if (!(await contactCompanyRefsValid(tx, { companyId })))
          return undefined;
        return setEntityTags(
          tx,
          companyTags,
          companyTags.companyId,
          companyId,
          tagIds,
          (uniqueTagIds) =>
            tx.insert(companyTags).values(
              uniqueTagIds.map((tagId) => ({
                workspaceId,
                tagId,
                companyId,
              })),
            ),
        );
      }),
    setDealTags: (workspaceId: string, dealId: string, tagIds: string[]) =>
      withWorkspace(workspaceId, async (tx) => {
        if (!(await dealRefValid(tx, dealId))) return undefined;
        return setEntityTags(
          tx,
          dealTags,
          dealTags.dealId,
          dealId,
          tagIds,
          (uniqueTagIds) =>
            tx.insert(dealTags).values(
              uniqueTagIds.map((tagId) => ({
                workspaceId,
                tagId,
                dealId,
              })),
            ),
        );
      }),
    listAttributes: (
      workspaceId: string,
      entityType?: "contact" | "company" | "deal",
    ) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select(attributeColumns)
          .from(attributeDefinitions)
          .where(
            and(
              entityType
                ? eq(attributeDefinitions.entityType, entityType)
                : undefined,
              notDeleted(attributeDefinitions.deletedAt),
            ),
          )
          .orderBy(attributeDefinitions.label, attributeDefinitions.id),
      ),
    getAttribute: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .select(attributeColumns)
          .from(attributeDefinitions)
          .where(
            and(
              eq(attributeDefinitions.id, id),
              notDeleted(attributeDefinitions.deletedAt),
            ),
          )
          .limit(1);
        return rows[0];
      }),
    // undefined when an active definition already uses the key for this
    // entity type (routes → 409).
    createAttribute: (
      workspaceId: string,
      input: {
        entityType: "contact" | "company" | "deal";
        label: string;
        type: "text" | "number" | "date" | "boolean" | "select";
        options?: string[] | null;
        key?: string;
      },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const key = slugifyKey(input.key ?? input.label);
        const existing = await tx
          .select({ id: attributeDefinitions.id })
          .from(attributeDefinitions)
          .where(
            and(
              eq(attributeDefinitions.entityType, input.entityType),
              eq(attributeDefinitions.key, key),
              notDeleted(attributeDefinitions.deletedAt),
            ),
          )
          .limit(1);
        if (existing[0]) return undefined;
        const rows = await tx
          .insert(attributeDefinitions)
          .values({
            workspaceId,
            entityType: input.entityType,
            key,
            label: input.label,
            type: input.type,
            options: input.options ?? null,
          })
          .returning(attributeColumns);
        const row = rows[0];
        if (!row)
          throw new Error("attribute definition insert returned no row");
        return row;
      }),
    // entityType/key/type are immutable — label and options only.
    updateAttribute: (
      workspaceId: string,
      id: string,
      input: { label?: string; options?: string[] | null },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .update(attributeDefinitions)
          .set({ ...input, updatedAt: new Date() })
          .where(
            and(
              eq(attributeDefinitions.id, id),
              notDeleted(attributeDefinitions.deletedAt),
            ),
          )
          .returning(attributeColumns);
        return rows[0];
      }),
    deleteAttribute: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .update(attributeDefinitions)
          .set({ deletedAt: new Date() })
          .where(
            and(
              eq(attributeDefinitions.id, id),
              notDeleted(attributeDefinitions.deletedAt),
            ),
          )
          .returning({ id: attributeDefinitions.id });
        return rows.length > 0;
      }),
    listEntityAttributes: (
      workspaceId: string,
      entityType: "contact" | "company" | "deal",
      entityId: string,
    ) =>
      withWorkspace(workspaceId, (tx) =>
        attributesForEntity(tx, entityType, entityId),
      ),
    setEntityAttributes: (
      workspaceId: string,
      entityType: "contact" | "company" | "deal",
      entityId: string,
      values: {
        attributeId: string;
        value: string | number | boolean | null;
      }[],
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        if (!(await entityExists(tx, entityType, entityId))) return undefined;
        return setEntityAttributeValues(
          tx,
          workspaceId,
          entityType,
          entityId,
          values,
        );
      }),
    // Case-insensitive substring search across the three CRM entities.
    // Backslash is LIKE's default escape in PostgreSQL — user-supplied
    // wildcards must be escaped so `%`/`_` stay literal.
    searchEntities: (workspaceId: string, query: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const pattern = `%${query.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
        const contactRows = await tx
          .select({
            id: contacts.id,
            name: contacts.name,
            email: contacts.email,
          })
          .from(contacts)
          .where(
            and(
              notDeleted(contacts.deletedAt),
              or(
                ilike(contacts.name, pattern),
                ilike(contacts.email, pattern),
                ilike(contacts.phone, pattern),
              ),
            ),
          )
          .orderBy(contacts.name, contacts.id)
          .limit(10);
        const companyRows = await tx
          .select({ id: companies.id, name: companies.name })
          .from(companies)
          .where(
            and(
              notDeleted(companies.deletedAt),
              ilike(companies.name, pattern),
            ),
          )
          .orderBy(companies.name, companies.id)
          .limit(10);
        const dealRows = await tx
          .select({ id: deals.id, title: deals.title })
          .from(deals)
          .where(and(notDeleted(deals.deletedAt), ilike(deals.title, pattern)))
          .orderBy(deals.title, deals.id)
          .limit(10);
        return {
          contacts: contactRows,
          companies: companyRows,
          deals: dealRows,
        };
      }),
    createChannelInstance: (
      workspaceId: string,
      input: {
        provider: string;
        providerInstanceId?: string | null;
        webhookSecret: string;
      },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .insert(channelInstances)
          .values({
            workspaceId,
            provider: input.provider,
            providerInstanceId: input.providerInstanceId ?? null,
            webhookSecret: input.webhookSecret,
          })
          .returning(channelInstanceColumns);
        return rows[0];
      }),
    listChannelInstances: (workspaceId: string) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select(channelInstanceColumns)
          .from(channelInstances)
          .where(eq(channelInstances.isActive, true))
          .orderBy(channelInstances.createdAt, channelInstances.id),
      ),
    getChannelInstance: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .select(channelInstanceColumns)
          .from(channelInstances)
          .where(
            and(
              eq(channelInstances.id, id),
              eq(channelInstances.isActive, true),
            ),
          )
          .limit(1);
        return rows[0];
      }),
    receiveInboundMessage: (
      workspaceId: string,
      input: {
        channelInstanceId: string;
        providerThreadId: string;
        providerMessageId: string;
        providerEventId: string;
        providerEventKind: string;
        senderPhone?: string | null;
        contentType: string;
        body: string;
        media?: { key: string; mime: string; filename?: string | null } | null;
        rawPayload: unknown;
        signatureVerified: boolean;
      },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const recorded = await recordWebhookEvent(tx, {
          workspaceId,
          ...input,
        });
        if (!recorded) return { kind: "duplicate" as const };
        let contactId: string | null = null;
        if (input.senderPhone) {
          const contactRows = await tx
            .select({ id: contacts.id })
            .from(contacts)
            .where(
              and(
                eq(contacts.workspaceId, workspaceId),
                eq(contacts.phone, input.senderPhone),
                notDeleted(contacts.deletedAt),
              ),
            )
            .orderBy(contacts.createdAt)
            .limit(1);
          if (contactRows[0]) {
            contactId = contactRows[0].id;
          } else {
            const newContact = await tx
              .insert(contacts)
              .values({
                workspaceId,
                name: input.senderPhone,
                phone: input.senderPhone,
              })
              .returning({ id: contacts.id });
            const created = newContact[0];
            if (created) contactId = created.id;
          }
        }
        const conversationRows = await tx
          .insert(conversations)
          .values({
            workspaceId,
            channelInstanceId: input.channelInstanceId,
            contactId,
            providerThreadId: input.providerThreadId,
          })
          .onConflictDoUpdate({
            target: [
              conversations.channelInstanceId,
              conversations.providerThreadId,
            ],
            // Backfill the contact when a later event resolves the sender
            // (e.g. first LID message carries no phone); never re-link.
            set: {
              updatedAt: new Date(),
              contactId: sql`coalesce(${conversations.contactId}, excluded.contact_id)`,
            },
          })
          .returning({ id: conversations.id });
        const conversation = conversationRows[0];
        if (!conversation) throw new Error("conversation upsert failed");
        const messageRows = await tx
          .insert(messages)
          .values({
            workspaceId,
            conversationId: conversation.id,
            providerMessageId: input.providerMessageId,
            direction: "inbound",
            contentType: input.contentType,
            body: input.body,
            mediaKey: input.media?.key ?? null,
            mediaMime: input.media?.mime ?? null,
            mediaFilename: input.media?.filename ?? null,
          })
          .onConflictDoNothing({
            target: [messages.conversationId, messages.providerMessageId],
          })
          .returning({ id: messages.id });
        const messageId = messageRows[0]?.id;
        return {
          kind: "received" as const,
          conversationId: conversation.id,
          ...(messageId ? { messageId } : {}),
        };
      }),
    listConversations: (
      workspaceId: string,
      queue: { filter?: "all" | "mine" | "unassigned"; userId?: string } = {},
    ) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select(conversationColumns)
          .from(conversations)
          .leftJoin(contacts, eq(conversations.contactId, contacts.id))
          .leftJoin(users, eq(conversations.assignedUserId, users.id))
          .where(
            queue.filter === "unassigned"
              ? isNull(conversations.assignedUserId)
              : queue.filter === "mine" && queue.userId
                ? eq(conversations.assignedUserId, queue.userId)
                : undefined,
          )
          // Inbox ordering: most recently active conversation first.
          .orderBy(desc(conversations.updatedAt), conversations.id),
      ),
    getConversation: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .select(conversationColumns)
          .from(conversations)
          .leftJoin(contacts, eq(conversations.contactId, contacts.id))
          .leftJoin(users, eq(conversations.assignedUserId, users.id))
          .where(eq(conversations.id, id))
          .limit(1);
        return rows[0];
      }),
    // Ownership transitions run under FOR UPDATE so a racing assign/unassign
    // cannot interleave with the actor's rule check. Delegation rule:
    // managers/admins set any assignee; agents may only claim an unassigned
    // conversation for themselves or release their own. Assignees must be
    // workspace members able to operate the inbox (role >= agent — a viewer
    // cannot own a conversation). Every change appends an audit row.
    assignConversation: (
      workspaceId: string,
      input: {
        conversationId: string;
        assigneeId: string | null;
        actorId: string;
        canDelegate: boolean;
      },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .select({
            id: conversations.id,
            assignedUserId: conversations.assignedUserId,
          })
          .from(conversations)
          .where(
            and(
              eq(conversations.id, input.conversationId),
              eq(conversations.workspaceId, workspaceId),
            ),
          )
          .for("update");
        const conversation = rows[0];
        if (!conversation) return { kind: "not-found" as const };
        if (!input.canDelegate) {
          const claim =
            input.assigneeId === input.actorId &&
            conversation.assignedUserId === null;
          const release =
            input.assigneeId === null &&
            conversation.assignedUserId === input.actorId;
          if (!claim && !release) return { kind: "forbidden" as const };
        }
        if (input.assigneeId) {
          const member = await tx
            .select({ id: memberships.id })
            .from(memberships)
            .where(
              and(
                eq(memberships.userId, input.assigneeId),
                eq(memberships.workspaceId, workspaceId),
                inArray(memberships.role, ["agent", "manager", "admin"]),
              ),
            )
            .limit(1);
          if (!member[0]) return { kind: "not-member" as const };
        }
        if (conversation.assignedUserId === input.assigneeId) {
          return { kind: "ok" as const };
        }
        await tx
          .update(conversations)
          .set({
            assignedUserId: input.assigneeId,
            assignedAt: input.assigneeId ? new Date() : null,
          })
          .where(eq(conversations.id, conversation.id));
        await tx.insert(conversationAssignments).values({
          workspaceId,
          conversationId: conversation.id,
          assignedUserId: input.assigneeId,
          assignedBy: input.actorId,
        });
        return { kind: "ok" as const };
      }),
    listConversationAssignments: (
      workspaceId: string,
      conversationId: string,
    ) =>
      withWorkspace(workspaceId, (tx) => {
        const assignee = alias(users, "assignee");
        const actor = alias(users, "actor");
        return tx
          .select({
            id: conversationAssignments.id,
            conversationId: conversationAssignments.conversationId,
            assignedUserId: conversationAssignments.assignedUserId,
            assignedUserName: assignee.name,
            assignedBy: conversationAssignments.assignedBy,
            assignedByName: actor.name,
            createdAt: conversationAssignments.createdAt,
          })
          .from(conversationAssignments)
          .leftJoin(
            assignee,
            eq(conversationAssignments.assignedUserId, assignee.id),
          )
          .leftJoin(actor, eq(conversationAssignments.assignedBy, actor.id))
          .where(
            and(
              eq(conversationAssignments.conversationId, conversationId),
              eq(conversationAssignments.workspaceId, workspaceId),
            ),
          )
          .orderBy(
            desc(conversationAssignments.createdAt),
            conversationAssignments.id,
          )
          .limit(50);
      }),
    // Links the conversation to a CRM contact (or clears it). undefined when
    // the conversation is missing/out of scope or the contact is not an
    // active row in this workspace — callers map both to 404, matching the
    // updateContact foreign-ref convention.
    setConversationContact: (
      workspaceId: string,
      conversationId: string,
      contactId: string | null,
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        if (contactId && !(await contactCompanyRefsValid(tx, { contactId })))
          return undefined;
        const rows = await tx
          .update(conversations)
          .set({ contactId, updatedAt: new Date() })
          .where(eq(conversations.id, conversationId))
          .returning({ id: conversations.id });
        return rows[0];
      }),
    listMessages: (workspaceId: string, conversationId: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const conversation = await tx
          .select({ id: conversations.id })
          .from(conversations)
          .where(
            and(
              eq(conversations.id, conversationId),
              eq(conversations.workspaceId, workspaceId),
            ),
          )
          .limit(1);
        if (!conversation[0]) return [];
        return messagesWithAuthor(tx)
          .where(eq(messages.conversationId, conversationId))
          .orderBy(messages.createdAt, messages.id);
      }),
    getMessage: (workspaceId: string, messageId: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await messagesWithAuthor(tx)
          .where(
            and(
              eq(messages.id, messageId),
              eq(messages.workspaceId, workspaceId),
            ),
          )
          .limit(1);
        return rows[0];
      }),
    /**
     * Internal note: a thread-visible row that never leaves the workspace —
     * `kind`/`direction` keep it out of the dispatch path entirely (no intent
     * row is written), so no provider ever sees it.
     */
    createConversationNote: (
      workspaceId: string,
      input: { conversationId: string; authorUserId: string; body: string },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .select({ id: conversations.id })
          .from(conversations)
          .where(eq(conversations.id, input.conversationId))
          .limit(1);
        if (!rows[0]) return { kind: "missing" } as const;
        const [note] = await tx
          .insert(messages)
          .values({
            workspaceId,
            conversationId: rows[0].id,
            kind: "note",
            direction: "internal",
            status: "note",
            authorUserId: input.authorUserId,
            contentType: "text",
            body: input.body,
          })
          .returning(messageColumns);
        return { kind: "created" as const, message: note! };
      }),
    /**
     * ADR 0010 operator resolution for `unknown` sends: the provider may have
     * accepted the message, so a human must confirm the outcome — `sent` (it
     * arrived) or `not_sent` (cancelled, safe to retry as a new intent).
     * Only `unknown` outbound messages are eligible; anything else is a
     * state violation and rejected.
     */
    resolveUnknownMessage: (
      workspaceId: string,
      input: { messageId: string; resolution: "sent" | "not_sent" },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .select({ status: messages.status, direction: messages.direction })
          .from(messages)
          .where(
            and(
              eq(messages.id, input.messageId),
              eq(messages.workspaceId, workspaceId),
            ),
          )
          .limit(1);
        const row = rows[0];
        if (!row) return { kind: "missing" as const };
        if (row.direction !== "outbound" || row.status !== "unknown") {
          return { kind: "invalidState" as const, status: row.status };
        }
        const status = input.resolution === "sent" ? "sent" : "cancelled";
        await tx
          .update(messages)
          .set({ status })
          .where(eq(messages.id, input.messageId));
        return { kind: "applied" as const, status };
      }),
    // ADR 0010: outbound send commits the message and its dispatch intent in one
    // transaction. The (channel_instance_id, message_id) unique is the stable
    // effect identity; epoch is captured for stale-intent cancellation.
    createOutboundIntent: (
      workspaceId: string,
      input: {
        conversationId: string;
        authorUserId?: string | null;
        body?: string | null;
        contentType?: string;
        media?: { key: string; mime: string; filename?: string | null } | null;
      },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .select({
            id: conversations.id,
            channelInstanceId: conversations.channelInstanceId,
            providerThreadId: conversations.providerThreadId,
            epoch: conversations.epoch,
          })
          .from(conversations)
          .where(eq(conversations.id, input.conversationId))
          .limit(1);
        const conversation = rows[0];
        if (!conversation) return { kind: "missing" } as const;
        const [message] = await tx
          .insert(messages)
          .values({
            workspaceId,
            conversationId: conversation.id,
            direction: "outbound",
            status: "pending",
            authorUserId: input.authorUserId ?? null,
            contentType: input.contentType ?? "text",
            body: input.body ?? null,
            mediaKey: input.media?.key ?? null,
            mediaMime: input.media?.mime ?? null,
            mediaFilename: input.media?.filename ?? null,
          })
          .returning();
        if (!message) return { kind: "missing" } as const;
        const [intent] = await tx
          .insert(dispatchIntents)
          .values({
            workspaceId,
            conversationId: conversation.id,
            channelInstanceId: conversation.channelInstanceId,
            messageId: message.id,
            epoch: conversation.epoch,
            status: "pending",
          })
          .returning({ id: dispatchIntents.id });
        return {
          kind: "created",
          intentId: intent!.id,
          messageId: message.id,
        } as const;
      }),
    // Atomic claim: only a pending intent whose conversation epoch still matches
    // can move to dispatching, and the claim writes a fencing token + lease.
    claimDispatchIntent: (
      workspaceId: string,
      intentId: string,
      options: { leaseMs: number },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .select({
            intentId: dispatchIntents.id,
            intentStatus: dispatchIntents.status,
            intentEpoch: dispatchIntents.epoch,
            intentMessageId: dispatchIntents.messageId,
            conversationEpoch: conversations.epoch,
            providerThreadId: conversations.providerThreadId,
            channelActive: channelInstances.isActive,
            providerInstanceId: channelInstances.providerInstanceId,
            messageBody: messages.body,
            messageContentType: messages.contentType,
            messageMediaKey: messages.mediaKey,
            messageMediaMime: messages.mediaMime,
            messageMediaFilename: messages.mediaFilename,
          })
          .from(dispatchIntents)
          .innerJoin(
            conversations,
            eq(dispatchIntents.conversationId, conversations.id),
          )
          .innerJoin(
            channelInstances,
            eq(dispatchIntents.channelInstanceId, channelInstances.id),
          )
          .innerJoin(messages, eq(dispatchIntents.messageId, messages.id))
          .where(eq(dispatchIntents.id, intentId))
          .for("update")
          .limit(1);
        const row = rows[0];
        if (!row) return { kind: "missing" } as const;
        if (row.intentStatus !== "pending") {
          return { kind: "notPending", status: row.intentStatus } as const;
        }
        if (row.conversationEpoch !== row.intentEpoch) {
          const now = new Date();
          await tx
            .update(dispatchIntents)
            .set({ status: "cancelled", updatedAt: now })
            .where(eq(dispatchIntents.id, intentId));
          await tx
            .update(messages)
            .set({ status: "cancelled" })
            .where(eq(messages.id, row.intentMessageId));
          return { kind: "stale" } as const;
        }
        if (!row.channelActive || !row.providerInstanceId) {
          const now = new Date();
          await tx
            .update(dispatchIntents)
            .set({ status: "failed", updatedAt: now })
            .where(eq(dispatchIntents.id, intentId));
          await tx
            .update(messages)
            .set({ status: "failed" })
            .where(eq(messages.id, row.intentMessageId));
          return {
            kind: "failed",
            reason: "channel instance inactive",
          } as const;
        }
        const [attempt] = await tx
          .insert(dispatchAttempts)
          .values({
            workspaceId,
            intentId,
            leaseExpiresAt: new Date(Date.now() + options.leaseMs),
          })
          .returning({
            id: dispatchAttempts.id,
            fencingToken: dispatchAttempts.fencingToken,
          });
        await tx
          .update(dispatchIntents)
          .set({ status: "dispatching", updatedAt: new Date() })
          .where(eq(dispatchIntents.id, intentId));
        return {
          kind: "claimed",
          attemptId: attempt!.id,
          fencingToken: attempt!.fencingToken,
          messageId: row.intentMessageId,
          body: row.messageBody ?? "",
          contentType: row.messageContentType,
          media: row.messageMediaKey
            ? {
                key: row.messageMediaKey,
                mime: row.messageMediaMime ?? "application/octet-stream",
                filename: row.messageMediaFilename,
              }
            : null,
          to: row.providerThreadId,
          session: row.providerInstanceId,
        } as const;
      }),
    // Completion must match the live attempt (fencing token + not completed);
    // anything else is a stale claimer and must not mutate state (ADR 0010 §2-3).
    settleDispatch: (
      workspaceId: string,
      input: {
        intentId: string;
        attemptId: string;
        fencingToken: string;
        outcome: "succeeded" | "unknown" | "failed";
        providerMessageId?: string;
        error?: string;
      },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const intentRows = await tx
          .select({
            id: dispatchIntents.id,
            status: dispatchIntents.status,
            messageId: dispatchIntents.messageId,
          })
          .from(dispatchIntents)
          .where(eq(dispatchIntents.id, input.intentId))
          .for("update")
          .limit(1);
        const intent = intentRows[0];
        if (!intent) return { kind: "missing" } as const;
        const attemptRows = await tx
          .select({
            id: dispatchAttempts.id,
            fencingToken: dispatchAttempts.fencingToken,
          })
          .from(dispatchAttempts)
          .where(
            and(
              eq(dispatchAttempts.intentId, input.intentId),
              isNull(dispatchAttempts.completedAt),
            ),
          )
          .limit(1);
        const attempt = attemptRows[0];
        if (
          !attempt ||
          attempt.id !== input.attemptId ||
          attempt.fencingToken !== input.fencingToken ||
          intent.status !== "dispatching"
        ) {
          return { kind: "stale" } as const;
        }
        const now = new Date();
        await tx
          .update(dispatchAttempts)
          .set({
            status: input.outcome,
            completedAt: now,
            error: input.error ?? null,
          })
          .where(eq(dispatchAttempts.id, attempt.id));
        await tx
          .update(dispatchIntents)
          .set({ status: input.outcome, updatedAt: now })
          .where(eq(dispatchIntents.id, intent.id));
        await tx
          .update(messages)
          .set({
            status: input.outcome === "succeeded" ? "sent" : input.outcome,
            ...(input.providerMessageId
              ? { providerMessageId: input.providerMessageId }
              : {}),
          })
          .where(eq(messages.id, intent.messageId));
        return { kind: "settled" } as const;
      }),
    // Expired leases are ambiguous: the provider may have accepted. They become
    // `unknown` (blocked for reconciliation), never silently retried (ADR 0010 §4).
    reapExpiredDispatches: (workspaceId: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const now = new Date();
        const expired = await tx
          .select({
            attemptId: dispatchAttempts.id,
            intentId: dispatchIntents.id,
            messageId: dispatchIntents.messageId,
          })
          .from(dispatchAttempts)
          .innerJoin(
            dispatchIntents,
            eq(dispatchAttempts.intentId, dispatchIntents.id),
          )
          .where(
            and(
              isNull(dispatchAttempts.completedAt),
              lt(dispatchAttempts.leaseExpiresAt, sql`now()`),
            ),
          );
        for (const row of expired) {
          await tx
            .update(dispatchAttempts)
            .set({
              status: "unknown",
              completedAt: now,
              error: "dispatch lease expired",
            })
            .where(eq(dispatchAttempts.id, row.attemptId));
          await tx
            .update(dispatchIntents)
            .set({ status: "unknown", updatedAt: now })
            .where(eq(dispatchIntents.id, row.intentId));
          await tx
            .update(messages)
            .set({ status: "unknown" })
            .where(eq(messages.id, row.messageId));
        }
        return { reaped: expired.length } as const;
      }),
    listPendingIntents: (workspaceId: string, limit = 25) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select({ id: dispatchIntents.id })
          .from(dispatchIntents)
          .where(eq(dispatchIntents.status, "pending"))
          .orderBy(dispatchIntents.createdAt, dispatchIntents.id)
          .limit(limit),
      ),
    // Delivery reconciliation: authenticated `message.ack` webhooks are the
    // authoritative signal (ADR 0010). Acks arrive out of order, so a status
    // only moves forward and `read` never regresses; an ack is also what
    // resolves a `unknown` dispatch (the provider did accept the send).
    recordDeliveryStatus: (
      workspaceId: string,
      input: {
        channelInstanceId: string;
        providerMessageId: string;
        providerEventId: string;
        providerEventKind: string;
        status: string;
        rawPayload: unknown;
        signatureVerified: boolean;
      },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const recorded = await recordWebhookEvent(tx, {
          workspaceId,
          ...input,
        });
        if (!recorded) return { kind: "duplicate" as const };
        const target = ACK_STATUS_TARGETS[input.status];
        if (!target) return { kind: "recorded" as const };
        const rows = await tx
          .select({ id: messages.id, status: messages.status })
          .from(messages)
          .innerJoin(
            conversations,
            eq(messages.conversationId, conversations.id),
          )
          .where(
            and(
              eq(conversations.channelInstanceId, input.channelInstanceId),
              eq(messages.providerMessageId, input.providerMessageId),
              eq(messages.direction, "outbound"),
            ),
          )
          .for("update")
          .limit(1);
        const message = rows[0];
        if (!message) return { kind: "missing" as const };
        const currentRank = DELIVERY_RANK[message.status] ?? 0;
        const targetRank = DELIVERY_RANK[target] ?? 0;
        const applicable =
          target === "failed"
            ? currentRank < (DELIVERY_RANK.read ?? 4) &&
              message.status !== "failed"
            : targetRank > currentRank;
        if (!applicable) return { kind: "recorded" as const };
        await tx
          .update(messages)
          .set({ status: target })
          .where(eq(messages.id, message.id));
        return {
          kind: "applied" as const,
          messageId: message.id,
          status: target,
        };
      }),
    // Callers must already authorize this workspace. This scopes a transaction; it is not auth.
    withWorkspace,
    // Same contract for user-scoped reads (e.g. own memberships via app.user_id).
    withUser,
    // Same contract for invitation-token-scoped reads (token IS the credential).
    withInvitation,
  };
}

export type Database = ReturnType<typeof createDatabase>;
