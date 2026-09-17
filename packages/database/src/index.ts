import { and, desc, eq, isNull, lt, sql, type SQLWrapper } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { generateKeyBetween } from "fractional-indexing";
import type { Pool } from "pg";
import {
  channelInstances,
  companies,
  contacts,
  conversations,
  deals,
  dispatchAttempts,
  dispatchIntents,
  messages,
  organizations,
  pipelines,
  stages,
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
    setting: { name: string; value: string },
    callback: (tx: DrizzleTx) => Promise<T>,
  ) => {
    if (!uuid.test(setting.value)) {
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

  const contactColumns = {
    id: contacts.id,
    name: contacts.name,
    email: contacts.email,
    phone: contacts.phone,
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
  ) => {
    const rows = await tx
      .select({ position: table.position })
      .from(table)
      .where(notDeleted(table.deletedAt))
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

  return {
    close: () => pool.end(),
    listContacts: (workspaceId: string) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select(contactColumns)
          .from(contacts)
          .where(notDeleted(contacts.deletedAt))
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
      input: { name: string; email?: string | null; phone?: string | null },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
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
      input: { name?: string; email?: string | null; phone?: string | null },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
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
        const last = await tx
          .select({ position: stages.position })
          .from(stages)
          .where(
            and(
              eq(stages.pipelineId, pipelineId),
              notDeleted(stages.deletedAt),
            ),
          )
          .orderBy(desc(stages.position))
          .limit(1);
        const rows = await tx
          .insert(stages)
          .values({
            workspaceId,
            pipelineId,
            name: input.name,
            position: generateKeyBetween(last[0]?.position ?? null, null),
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
        const rows = await tx
          .select(dealColumns)
          .from(deals)
          .where(and(eq(deals.id, id), notDeleted(deals.deletedAt)))
          .limit(1);
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
        const last = await tx
          .select({ position: deals.position })
          .from(deals)
          .where(
            and(eq(deals.stageId, input.stageId), notDeleted(deals.deletedAt)),
          )
          .orderBy(desc(deals.position))
          .limit(1);
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
            position: generateKeyBetween(last[0]?.position ?? null, null),
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
        const set: {
          title?: string;
          valueCents?: number | null;
          contactId?: string | null;
          companyId?: string | null;
        } = {};
        if (input.title !== undefined) set.title = input.title;
        if (input.valueCents !== undefined) set.valueCents = input.valueCents;
        if (input.contactId !== undefined) set.contactId = input.contactId;
        if (input.companyId !== undefined) set.companyId = input.companyId;
        if (Object.keys(set).length === 0) return undefined;
        const rows = await tx
          .update(deals)
          .set(set)
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
          .returning({
            id: channelInstances.id,
            workspaceId: channelInstances.workspaceId,
            provider: channelInstances.provider,
            providerInstanceId: channelInstances.providerInstanceId,
            webhookSecret: channelInstances.webhookSecret,
            isActive: channelInstances.isActive,
            createdAt: channelInstances.createdAt,
            updatedAt: channelInstances.updatedAt,
          });
        return rows[0];
      }),
    listChannelInstances: (workspaceId: string) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select({
            id: channelInstances.id,
            workspaceId: channelInstances.workspaceId,
            provider: channelInstances.provider,
            providerInstanceId: channelInstances.providerInstanceId,
            webhookSecret: channelInstances.webhookSecret,
            isActive: channelInstances.isActive,
            createdAt: channelInstances.createdAt,
            updatedAt: channelInstances.updatedAt,
          })
          .from(channelInstances)
          .where(eq(channelInstances.isActive, true))
          .orderBy(channelInstances.createdAt, channelInstances.id),
      ),
    getChannelInstance: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .select({
            id: channelInstances.id,
            workspaceId: channelInstances.workspaceId,
            provider: channelInstances.provider,
            providerInstanceId: channelInstances.providerInstanceId,
            webhookSecret: channelInstances.webhookSecret,
            isActive: channelInstances.isActive,
          })
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
        rawPayload: unknown;
        signatureVerified: boolean;
      },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const webhookRows = await tx
          .insert(webhookEvents)
          .values({
            workspaceId,
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
        if (webhookRows.length === 0) {
          return { kind: "duplicate" as const };
        }
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
            set: { updatedAt: new Date() },
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
    listConversations: (workspaceId: string) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select({
            id: conversations.id,
            workspaceId: conversations.workspaceId,
            channelInstanceId: conversations.channelInstanceId,
            contactId: conversations.contactId,
            contactName: contacts.name,
            providerThreadId: conversations.providerThreadId,
            epoch: conversations.epoch,
            createdAt: conversations.createdAt,
            updatedAt: conversations.updatedAt,
          })
          .from(conversations)
          .leftJoin(contacts, eq(conversations.contactId, contacts.id))
          .orderBy(conversations.updatedAt, conversations.id),
      ),
    getConversation: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .select({
            id: conversations.id,
            workspaceId: conversations.workspaceId,
            channelInstanceId: conversations.channelInstanceId,
            contactId: conversations.contactId,
            contactName: contacts.name,
            providerThreadId: conversations.providerThreadId,
            epoch: conversations.epoch,
            createdAt: conversations.createdAt,
            updatedAt: conversations.updatedAt,
          })
          .from(conversations)
          .leftJoin(contacts, eq(conversations.contactId, contacts.id))
          .where(eq(conversations.id, id))
          .limit(1);
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
        return tx
          .select({
            id: messages.id,
            workspaceId: messages.workspaceId,
            conversationId: messages.conversationId,
            providerMessageId: messages.providerMessageId,
            direction: messages.direction,
            status: messages.status,
            contentType: messages.contentType,
            body: messages.body,
            createdAt: messages.createdAt,
          })
          .from(messages)
          .where(eq(messages.conversationId, conversationId))
          .orderBy(messages.createdAt, messages.id);
      }),
    getMessage: (workspaceId: string, messageId: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .select({
            id: messages.id,
            workspaceId: messages.workspaceId,
            conversationId: messages.conversationId,
            providerMessageId: messages.providerMessageId,
            direction: messages.direction,
            status: messages.status,
            contentType: messages.contentType,
            body: messages.body,
            createdAt: messages.createdAt,
          })
          .from(messages)
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
      input: { conversationId: string; body: string },
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
            contentType: "text",
            body: input.body,
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
        const webhookRows = await tx
          .insert(webhookEvents)
          .values({
            workspaceId,
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
        if (webhookRows.length === 0) {
          return { kind: "duplicate" as const };
        }
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
  };
}

export type Database = ReturnType<typeof createDatabase>;
