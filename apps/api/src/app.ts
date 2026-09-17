import { PassThrough } from "node:stream";
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { createWahaProvider } from "@maria/channel-waha";
import type { MessagingProvider } from "@maria/messaging";
import { createDispatcher } from "./dispatch.ts";
import type { AuthPort } from "@maria/auth";

type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
};

type ContactInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
};

type ContactPatch = {
  name?: string;
  email?: string | null;
  phone?: string | null;
};

type Company = {
  id: string;
  name: string;
  createdAt: Date;
};

type CompanyInput = {
  name: string;
};

type CompanyPatch = {
  name?: string;
};

type Pipeline = {
  id: string;
  name: string;
  position: string;
  createdAt: Date;
};

type Stage = {
  id: string;
  pipelineId: string;
  name: string;
  position: string;
  createdAt: Date;
};

type Deal = {
  id: string;
  pipelineId: string;
  stageId: string;
  title: string;
  valueCents: number | null;
  contactId: string | null;
  companyId: string | null;
  position: string;
  createdAt: Date;
};

type AppDependencies = {
  database: {
    listContacts: (workspaceId: string) => Promise<Contact[]>;
    getContact: (
      workspaceId: string,
      id: string,
    ) => Promise<Contact | undefined>;
    createContact: (
      workspaceId: string,
      input: ContactInput,
    ) => Promise<Contact>;
    updateContact: (
      workspaceId: string,
      id: string,
      input: ContactPatch,
    ) => Promise<Contact | undefined>;
    deleteContact: (workspaceId: string, id: string) => Promise<boolean>;
    listCompanies: (workspaceId: string) => Promise<Company[]>;
    getCompany: (
      workspaceId: string,
      id: string,
    ) => Promise<Company | undefined>;
    createCompany: (
      workspaceId: string,
      input: CompanyInput,
    ) => Promise<Company>;
    updateCompany: (
      workspaceId: string,
      id: string,
      input: CompanyPatch,
    ) => Promise<Company | undefined>;
    deleteCompany: (workspaceId: string, id: string) => Promise<boolean>;
    listPipelines: (workspaceId: string) => Promise<Pipeline[]>;
    createPipeline: (
      workspaceId: string,
      input: { name: string },
    ) => Promise<Pipeline>;
    updatePipeline: (
      workspaceId: string,
      id: string,
      input: { name?: string },
    ) => Promise<Pipeline | undefined>;
    deletePipeline: (
      workspaceId: string,
      id: string,
    ) => Promise<"deleted" | "not-found" | "has-deals">;
    listStages: (workspaceId: string, pipelineId: string) => Promise<Stage[]>;
    createStage: (
      workspaceId: string,
      pipelineId: string,
      input: { name: string },
    ) => Promise<Stage | undefined>;
    updateStage: (
      workspaceId: string,
      id: string,
      input: { name?: string },
    ) => Promise<Stage | undefined>;
    deleteStage: (
      workspaceId: string,
      id: string,
    ) => Promise<"deleted" | "not-found" | "has-deals">;
    listDeals: (workspaceId: string, pipelineId: string) => Promise<Deal[]>;
    getDeal: (workspaceId: string, id: string) => Promise<Deal | undefined>;
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
    ) => Promise<Deal | undefined>;
    updateDeal: (
      workspaceId: string,
      id: string,
      input: {
        title?: string;
        valueCents?: number | null;
        contactId?: string | null;
        companyId?: string | null;
      },
    ) => Promise<Deal | undefined>;
    moveDeal: (
      workspaceId: string,
      id: string,
      input: {
        stageId: string;
        prevDealId?: string | null;
        nextDealId?: string | null;
      },
    ) => Promise<Deal | undefined>;
    deleteDeal: (workspaceId: string, id: string) => Promise<boolean>;
    listOrganizations: () => Promise<
      { id: string; name: string; createdAt: Date }[]
    >;
    createOrganization: (input: { name: string }) => Promise<{ id: string }>;
    listWorkspaces: () => Promise<
      { id: string; orgId: string; name: string; createdAt: Date }[]
    >;
    createWorkspace: (input: {
      orgId: string;
      name: string;
    }) => Promise<{ id: string } | undefined>;
    createChannelInstance: (
      workspaceId: string,
      input: {
        provider: string;
        providerInstanceId?: string | null;
        webhookSecret: string;
      },
    ) => Promise<
      | {
          id: string;
          workspaceId: string;
          provider: string;
          providerInstanceId: string | null;
          webhookSecret: string;
          isActive: boolean;
        }
      | undefined
    >;
    listChannelInstances: (workspaceId: string) => Promise<
      {
        id: string;
        workspaceId: string;
        provider: string;
        providerInstanceId: string | null;
        webhookSecret: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
      }[]
    >;
    getChannelInstance: (
      workspaceId: string,
      id: string,
    ) => Promise<
      | {
          id: string;
          workspaceId: string;
          provider: string;
          providerInstanceId: string | null;
          webhookSecret: string;
          isActive: boolean;
        }
      | undefined
    >;
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
    ) => Promise<
      | { kind: "received"; conversationId: string; messageId?: string }
      | { kind: "duplicate" }
    >;
    listConversations: (workspaceId: string) => Promise<
      {
        id: string;
        workspaceId: string;
        channelInstanceId: string;
        contactId: string | null;
        contactName: string | null;
        providerThreadId: string;
        epoch: number;
        createdAt: Date;
        updatedAt: Date;
      }[]
    >;
    getConversation: (
      workspaceId: string,
      id: string,
    ) => Promise<
      | {
          id: string;
          workspaceId: string;
          channelInstanceId: string;
          contactId: string | null;
          contactName: string | null;
          providerThreadId: string;
          epoch: number;
          createdAt: Date;
          updatedAt: Date;
        }
      | undefined
    >;
    listMessages: (
      workspaceId: string,
      conversationId: string,
    ) => Promise<
      {
        id: string;
        workspaceId: string;
        conversationId: string;
        providerMessageId: string | null;
        direction: string;
        status: string;
        contentType: string;
        body: string | null;
        createdAt: Date;
      }[]
    >;
    createOutboundIntent: (
      workspaceId: string,
      input: { conversationId: string; body: string },
    ) => Promise<
      | { kind: "missing" }
      | { kind: "created"; intentId: string; messageId: string }
    >;
    claimDispatchIntent: (
      workspaceId: string,
      intentId: string,
      options: { leaseMs: number },
    ) => Promise<
      | { kind: "missing" }
      | { kind: "notPending"; status: string }
      | { kind: "stale" }
      | { kind: "failed"; reason: string }
      | {
          kind: "claimed";
          attemptId: string;
          fencingToken: string;
          messageId: string;
          body: string;
          to: string;
          session: string;
        }
    >;
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
    ) => Promise<{ kind: "missing" } | { kind: "stale" } | { kind: "settled" }>;
    reapExpiredDispatches: (workspaceId: string) => Promise<{ reaped: number }>;
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
    ) => Promise<
      | { kind: "duplicate" }
      | { kind: "missing" }
      | { kind: "recorded" }
      | { kind: "applied"; messageId: string; status: string }
    >;
    listPendingIntents: (
      workspaceId: string,
      limit?: number,
    ) => Promise<{ id: string }[]>;
  };
  auth: AuthPort;
  /** Injectable provider registry; defaults to env-configured WAHA. */
  messaging?: { waha?: MessagingProvider };
};

function extractBearerToken(request: FastifyRequest): string | undefined {
  const header = request.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return undefined;
  return header.slice(7);
}

const contactSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "name", "email", "phone", "createdAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    email: { type: ["string", "null"] },
    phone: { type: ["string", "null"] },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;

const companySchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "name", "createdAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;

const idParamsSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: { id: { type: "string", format: "uuid" } },
} as const;

const workspaceQuerySchema = {
  type: "object",
  additionalProperties: false,
  required: ["workspaceId"],
  properties: {
    workspaceId: { type: "string", format: "uuid" },
  },
} as const;

export function buildApp(dependencies?: AppDependencies) {
  const app = Fastify({ logger: true });
  const waha =
    dependencies?.messaging?.waha ??
    createWahaProvider({
      ...(process.env.WAHA_BASE_URL
        ? { baseUrl: process.env.WAHA_BASE_URL }
        : {}),
      ...(process.env.WAHA_API_KEY ? { apiKey: process.env.WAHA_API_KEY } : {}),
    });

  app.addHook(
    "preParsing",
    async (request, _reply, payload: NodeJS.ReadableStream) => {
      const chunks: Buffer[] = [];
      for await (const chunk of payload) {
        chunks.push(
          Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string, "utf8"),
        );
      }
      const raw = Buffer.concat(chunks);
      (request as unknown as { rawBody?: Buffer }).rawBody = raw;
      const pass = new PassThrough();
      pass.end(raw);
      return pass;
    },
  );

  // Register rate limiting plugin
  app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });
  app.get(
    "/health",
    {
      schema: {
        response: {
          200: {
            type: "object",
            additionalProperties: false,
            required: ["status"],
            properties: { status: { type: "string", const: "ok" } },
          },
        },
      },
    },
    async () => ({ status: "ok" }),
  );

  if (dependencies) {
    const { auth, database } = dependencies;
    const dispatcher = createDispatcher({
      database,
      provider: waha,
      onError: (error) => app.log.error(error),
    });

    const authorizeWorkspaceRequest = async (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      const token = extractBearerToken(request);
      if (!token) {
        await reply.code(401).send();
        return undefined;
      }
      const session = await auth.verifySession(token);
      if (!session) {
        await reply.code(401).send();
        return undefined;
      }
      const { workspaceId } = request.query as { workspaceId: string };
      const membership = await auth.authorizeWorkspace(
        session.userId,
        workspaceId,
      );
      if (!membership) {
        await reply.code(401).send();
        return undefined;
      }
      return { session, membership, workspaceId };
    };

    const requireAdmin = async (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      const token = extractBearerToken(request);
      if (!token) {
        await reply.code(401).send();
        return undefined;
      }
      const session = await auth.verifySession(token);
      if (!session || !session.isAdmin) {
        await reply.code(401).send();
        return undefined;
      }
      return session;
    };

    app.post(
      "/auth/login",
      {
        config: {
          rateLimit: {
            max: 10,
            timeWindow: "1 minute",
          },
        },
        schema: {
          body: {
            type: "object",
            additionalProperties: false,
            required: ["email", "password"],
            properties: {
              email: { type: "string", format: "email" },
              password: { type: "string", minLength: 1 },
            },
          },
          response: {
            200: {
              type: "object",
              additionalProperties: false,
              required: ["token"],
              properties: {
                token: { type: "string" },
              },
            },
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const { email, password } = request.body as {
          email: string;
          password: string;
        };
        const result = await auth.login(email, password);
        if (!result) return reply.code(401).send();
        return { token: result.token };
      },
    );

    app.get(
      "/me",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          response: {
            200: {
              type: "object",
              additionalProperties: false,
              required: ["userId", "email", "name", "isAdmin"],
              properties: {
                userId: { type: "string", format: "uuid" },
                email: { type: "string" },
                name: { type: "string" },
                isAdmin: { type: "boolean" },
              },
            },
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const token = extractBearerToken(request);
        if (!token) return reply.code(401).send();
        const session = await auth.verifySession(token);
        if (!session) return reply.code(401).send();
        return session;
      },
    );

    app.get(
      "/me/workspaces",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          response: {
            200: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["workspaceId", "workspaceName", "role"],
                properties: {
                  workspaceId: { type: "string", format: "uuid" },
                  workspaceName: { type: "string" },
                  role: { type: "string", enum: ["admin", "member"] },
                },
              },
            },
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const token = extractBearerToken(request);
        if (!token) return reply.code(401).send();
        const session = await auth.verifySession(token);
        if (!session) return reply.code(401).send();
        return auth.listUserWorkspaces(session.userId);
      },
    );

    app.post(
      "/admin/users",
      {
        config: {
          rateLimit: {
            max: 10,
            timeWindow: "1 minute",
          },
        },
        schema: {
          body: {
            type: "object",
            additionalProperties: false,
            required: ["email", "name", "password"],
            properties: {
              email: { type: "string", format: "email" },
              name: { type: "string", minLength: 1 },
              password: { type: "string", minLength: 1 },
              workspaceId: { type: "string", format: "uuid" },
              role: { type: "string", enum: ["admin", "member"] },
            },
          },
          response: {
            200: {
              type: "object",
              additionalProperties: false,
              required: ["userId"],
              properties: {
                userId: { type: "string", format: "uuid" },
              },
            },
            401: { type: "null" },
            409: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const session = await requireAdmin(request, reply);
        if (!session) return;
        const { email, name, password, workspaceId, role } = request.body as {
          email: string;
          name: string;
          password: string;
          workspaceId?: string;
          role?: "admin" | "member";
        };
        const result = await auth.createUser({
          email,
          name,
          password,
          workspaceId,
          role,
        });
        if (!result) return reply.code(409).send();
        return { userId: result.userId };
      },
    );

    const adminUserSchema = {
      type: "object",
      additionalProperties: false,
      required: ["id", "email", "name", "isAdmin", "active", "createdAt"],
      properties: {
        id: { type: "string", format: "uuid" },
        email: { type: "string" },
        name: { type: "string" },
        isAdmin: { type: "boolean" },
        active: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" },
      },
    } as const;

    const organizationSchema = {
      type: "object",
      additionalProperties: false,
      required: ["id", "name", "createdAt"],
      properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
      },
    } as const;

    const adminWorkspaceSchema = {
      type: "object",
      additionalProperties: false,
      required: ["id", "orgId", "name", "createdAt"],
      properties: {
        id: { type: "string", format: "uuid" },
        orgId: { type: "string", format: "uuid" },
        name: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
      },
    } as const;

    const memberSchema = {
      type: "object",
      additionalProperties: false,
      required: ["id", "userId", "role", "email", "name"],
      properties: {
        id: { type: "string", format: "uuid" },
        userId: { type: "string", format: "uuid" },
        role: { type: "string", enum: ["admin", "member"] },
        email: { type: "string" },
        name: { type: "string" },
      },
    } as const;

    app.get(
      "/admin/users",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          response: {
            200: { type: "array", items: adminUserSchema },
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const session = await requireAdmin(request, reply);
        if (!session) return;
        return auth.listUsers();
      },
    );

    app.patch(
      "/admin/users/:id",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          params: idParamsSchema,
          body: {
            type: "object",
            additionalProperties: false,
            minProperties: 1,
            properties: {
              name: { type: "string", minLength: 1 },
              active: { type: "boolean" },
            },
          },
          response: {
            204: { type: "null" },
            401: { type: "null" },
            404: { type: "null" },
            409: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const session = await requireAdmin(request, reply);
        if (!session) return;
        const { id } = request.params as { id: string };
        const { name, active } = request.body as {
          name?: string;
          active?: boolean;
        };
        const result = await auth.updateUser(id, { name, active });
        if (result === "not-found") return reply.code(404).send();
        if (result === "last-admin") return reply.code(409).send();
        return reply.code(204).send();
      },
    );

    app.get(
      "/admin/organizations",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          response: {
            200: { type: "array", items: organizationSchema },
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const session = await requireAdmin(request, reply);
        if (!session) return;
        return database.listOrganizations();
      },
    );

    app.post(
      "/admin/organizations",
      {
        config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
        schema: {
          body: {
            type: "object",
            additionalProperties: false,
            required: ["name"],
            properties: { name: { type: "string", minLength: 1 } },
          },
          response: {
            201: {
              type: "object",
              additionalProperties: false,
              required: ["id"],
              properties: { id: { type: "string", format: "uuid" } },
            },
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const session = await requireAdmin(request, reply);
        if (!session) return;
        const { name } = request.body as { name: string };
        const result = await database.createOrganization({ name });
        return reply.code(201).send({ id: result.id });
      },
    );

    app.get(
      "/admin/workspaces",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          response: {
            200: { type: "array", items: adminWorkspaceSchema },
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const session = await requireAdmin(request, reply);
        if (!session) return;
        return database.listWorkspaces();
      },
    );

    app.post(
      "/admin/workspaces",
      {
        config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
        schema: {
          body: {
            type: "object",
            additionalProperties: false,
            required: ["orgId", "name"],
            properties: {
              orgId: { type: "string", format: "uuid" },
              name: { type: "string", minLength: 1 },
            },
          },
          response: {
            201: {
              type: "object",
              additionalProperties: false,
              required: ["id"],
              properties: { id: { type: "string", format: "uuid" } },
            },
            401: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const session = await requireAdmin(request, reply);
        if (!session) return;
        const { orgId, name } = request.body as {
          orgId: string;
          name: string;
        };
        const result = await database.createWorkspace({ orgId, name });
        if (!result) return reply.code(404).send();
        return reply.code(201).send({ id: result.id });
      },
    );

    app.get(
      "/admin/workspaces/:id/members",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          params: idParamsSchema,
          response: {
            200: { type: "array", items: memberSchema },
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const session = await requireAdmin(request, reply);
        if (!session) return;
        const { id } = request.params as { id: string };
        return auth.listMembers(id);
      },
    );

    app.post(
      "/admin/memberships",
      {
        config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
        schema: {
          body: {
            type: "object",
            additionalProperties: false,
            required: ["userId", "workspaceId", "role"],
            properties: {
              userId: { type: "string", format: "uuid" },
              workspaceId: { type: "string", format: "uuid" },
              role: { type: "string", enum: ["admin", "member"] },
            },
          },
          response: {
            201: { type: "null" },
            401: { type: "null" },
            404: { type: "null" },
            409: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const session = await requireAdmin(request, reply);
        if (!session) return;
        const { userId, workspaceId, role } = request.body as {
          userId: string;
          workspaceId: string;
          role: "admin" | "member";
        };
        const result = await auth.addMembership({ userId, workspaceId, role });
        if (result === "not-found") return reply.code(404).send();
        if (result === "duplicate") return reply.code(409).send();
        return reply.code(201).send();
      },
    );

    app.patch(
      "/admin/memberships/:id",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          body: {
            type: "object",
            additionalProperties: false,
            required: ["role"],
            properties: {
              role: { type: "string", enum: ["admin", "member"] },
            },
          },
          response: {
            204: { type: "null" },
            401: { type: "null" },
            404: { type: "null" },
            409: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const session = await requireAdmin(request, reply);
        if (!session) return;
        const { id } = request.params as { id: string };
        const { workspaceId } = request.query as { workspaceId: string };
        const { role } = request.body as { role: "admin" | "member" };
        const result = await auth.updateMembershipRole(workspaceId, id, role);
        if (result === "not-found") return reply.code(404).send();
        if (result === "last-admin") return reply.code(409).send();
        return reply.code(204).send();
      },
    );

    app.delete(
      "/admin/memberships/:id",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          response: {
            204: { type: "null" },
            401: { type: "null" },
            404: { type: "null" },
            409: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const session = await requireAdmin(request, reply);
        if (!session) return;
        const { id } = request.params as { id: string };
        const { workspaceId } = request.query as { workspaceId: string };
        const result = await auth.removeMembership(workspaceId, id);
        if (result === "not-found") return reply.code(404).send();
        if (result === "last-admin") return reply.code(409).send();
        return reply.code(204).send();
      },
    );

    app.get(
      "/contacts",
      {
        config: {
          rateLimit: {
            max: 50,
            timeWindow: "1 minute",
          },
        },
        schema: {
          querystring: workspaceQuerySchema,
          response: {
            200: {
              type: "array",
              items: contactSchema,
            },
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        return database.listContacts(authorized.workspaceId);
      },
    );

    app.post(
      "/contacts",
      {
        config: {
          rateLimit: {
            max: 30,
            timeWindow: "1 minute",
          },
        },
        schema: {
          querystring: workspaceQuerySchema,
          body: {
            type: "object",
            additionalProperties: false,
            required: ["name"],
            properties: {
              name: { type: "string", minLength: 1 },
              email: { type: ["string", "null"], format: "email" },
              phone: { type: ["string", "null"] },
            },
          },
          response: {
            201: contactSchema,
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const input = request.body as ContactInput;
        const contact = await database.createContact(
          authorized.workspaceId,
          input,
        );
        return reply.code(201).send(contact);
      },
    );

    app.get(
      "/contacts/:id",
      {
        config: {
          rateLimit: {
            max: 50,
            timeWindow: "1 minute",
          },
        },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          response: {
            200: contactSchema,
            401: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const { id } = request.params as { id: string };
        const contact = await database.getContact(authorized.workspaceId, id);
        if (!contact) return reply.code(404).send();
        return contact;
      },
    );

    app.patch(
      "/contacts/:id",
      {
        config: {
          rateLimit: {
            max: 30,
            timeWindow: "1 minute",
          },
        },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          body: {
            type: "object",
            additionalProperties: false,
            minProperties: 1,
            properties: {
              name: { type: "string", minLength: 1 },
              email: { type: ["string", "null"], format: "email" },
              phone: { type: ["string", "null"] },
            },
          },
          response: {
            200: contactSchema,
            401: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const { id } = request.params as { id: string };
        const input = request.body as ContactPatch;
        const contact = await database.updateContact(
          authorized.workspaceId,
          id,
          input,
        );
        if (!contact) return reply.code(404).send();
        return contact;
      },
    );

    app.delete(
      "/contacts/:id",
      {
        config: {
          rateLimit: {
            max: 30,
            timeWindow: "1 minute",
          },
        },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          response: {
            204: { type: "null" },
            401: { type: "null" },
            403: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        if (authorized.membership.role !== "admin") {
          return reply.code(403).send();
        }
        const { id } = request.params as { id: string };
        const deleted = await database.deleteContact(
          authorized.workspaceId,
          id,
        );
        if (!deleted) return reply.code(404).send();
        return reply.code(204).send();
      },
    );

    app.get(
      "/companies",
      {
        config: {
          rateLimit: {
            max: 50,
            timeWindow: "1 minute",
          },
        },
        schema: {
          querystring: workspaceQuerySchema,
          response: {
            200: {
              type: "array",
              items: companySchema,
            },
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        return database.listCompanies(authorized.workspaceId);
      },
    );

    app.post(
      "/companies",
      {
        config: {
          rateLimit: {
            max: 30,
            timeWindow: "1 minute",
          },
        },
        schema: {
          querystring: workspaceQuerySchema,
          body: {
            type: "object",
            additionalProperties: false,
            required: ["name"],
            properties: {
              name: { type: "string", minLength: 1 },
            },
          },
          response: {
            201: companySchema,
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const input = request.body as CompanyInput;
        const company = await database.createCompany(
          authorized.workspaceId,
          input,
        );
        return reply.code(201).send(company);
      },
    );

    app.get(
      "/companies/:id",
      {
        config: {
          rateLimit: {
            max: 50,
            timeWindow: "1 minute",
          },
        },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          response: {
            200: companySchema,
            401: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const { id } = request.params as { id: string };
        const company = await database.getCompany(authorized.workspaceId, id);
        if (!company) return reply.code(404).send();
        return company;
      },
    );

    app.patch(
      "/companies/:id",
      {
        config: {
          rateLimit: {
            max: 30,
            timeWindow: "1 minute",
          },
        },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          body: {
            type: "object",
            additionalProperties: false,
            minProperties: 1,
            properties: {
              name: { type: "string", minLength: 1 },
            },
          },
          response: {
            200: companySchema,
            401: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const { id } = request.params as { id: string };
        const input = request.body as CompanyPatch;
        const company = await database.updateCompany(
          authorized.workspaceId,
          id,
          input,
        );
        if (!company) return reply.code(404).send();
        return company;
      },
    );

    app.delete(
      "/companies/:id",
      {
        config: {
          rateLimit: {
            max: 30,
            timeWindow: "1 minute",
          },
        },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          response: {
            204: { type: "null" },
            401: { type: "null" },
            403: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        if (authorized.membership.role !== "admin") {
          return reply.code(403).send();
        }
        const { id } = request.params as { id: string };
        const deleted = await database.deleteCompany(
          authorized.workspaceId,
          id,
        );
        if (!deleted) return reply.code(404).send();
        return reply.code(204).send();
      },
    );

    const pipelineSchema = {
      type: "object",
      additionalProperties: false,
      required: ["id", "name", "position", "createdAt"],
      properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string" },
        position: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
      },
    } as const;

    const stageSchema = {
      type: "object",
      additionalProperties: false,
      required: ["id", "pipelineId", "name", "position", "createdAt"],
      properties: {
        id: { type: "string", format: "uuid" },
        pipelineId: { type: "string", format: "uuid" },
        name: { type: "string" },
        position: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
      },
    } as const;

    const dealSchema = {
      type: "object",
      additionalProperties: false,
      required: [
        "id",
        "pipelineId",
        "stageId",
        "title",
        "valueCents",
        "contactId",
        "companyId",
        "position",
        "createdAt",
      ],
      properties: {
        id: { type: "string", format: "uuid" },
        pipelineId: { type: "string", format: "uuid" },
        stageId: { type: "string", format: "uuid" },
        title: { type: "string" },
        valueCents: { type: ["integer", "null"] },
        contactId: { type: ["string", "null"], format: "uuid" },
        companyId: { type: ["string", "null"], format: "uuid" },
        position: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
      },
    } as const;

    const nameBodySchema = {
      type: "object",
      additionalProperties: false,
      required: ["name"],
      properties: { name: { type: "string", minLength: 1 } },
    } as const;

    app.get(
      "/pipelines",
      {
        config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
        schema: {
          querystring: workspaceQuerySchema,
          response: {
            200: { type: "array", items: pipelineSchema },
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        return database.listPipelines(authorized.workspaceId);
      },
    );

    app.post(
      "/pipelines",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          querystring: workspaceQuerySchema,
          body: nameBodySchema,
          response: { 201: pipelineSchema, 401: { type: "null" } },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const { name } = request.body as { name: string };
        const created = await database.createPipeline(authorized.workspaceId, {
          name,
        });
        return reply.code(201).send(created);
      },
    );

    app.patch(
      "/pipelines/:id",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          body: {
            type: "object",
            additionalProperties: false,
            minProperties: 1,
            properties: { name: { type: "string", minLength: 1 } },
          },
          response: {
            200: pipelineSchema,
            401: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const { id } = request.params as { id: string };
        const updated = await database.updatePipeline(
          authorized.workspaceId,
          id,
          request.body as { name?: string },
        );
        if (!updated) return reply.code(404).send();
        return updated;
      },
    );

    app.delete(
      "/pipelines/:id",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          response: {
            204: { type: "null" },
            401: { type: "null" },
            403: { type: "null" },
            404: { type: "null" },
            409: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        if (authorized.membership.role !== "admin") {
          return reply.code(403).send();
        }
        const { id } = request.params as { id: string };
        const result = await database.deletePipeline(
          authorized.workspaceId,
          id,
        );
        if (result === "not-found") return reply.code(404).send();
        if (result === "has-deals") return reply.code(409).send();
        return reply.code(204).send();
      },
    );

    app.get(
      "/pipelines/:id/stages",
      {
        config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          response: {
            200: { type: "array", items: stageSchema },
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const { id } = request.params as { id: string };
        return database.listStages(authorized.workspaceId, id);
      },
    );

    app.post(
      "/pipelines/:id/stages",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          body: nameBodySchema,
          response: {
            201: stageSchema,
            401: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const { id } = request.params as { id: string };
        const { name } = request.body as { name: string };
        const created = await database.createStage(authorized.workspaceId, id, {
          name,
        });
        if (!created) return reply.code(404).send();
        return reply.code(201).send(created);
      },
    );

    app.patch(
      "/stages/:id",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          body: {
            type: "object",
            additionalProperties: false,
            minProperties: 1,
            properties: { name: { type: "string", minLength: 1 } },
          },
          response: {
            200: stageSchema,
            401: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const { id } = request.params as { id: string };
        const updated = await database.updateStage(
          authorized.workspaceId,
          id,
          request.body as { name?: string },
        );
        if (!updated) return reply.code(404).send();
        return updated;
      },
    );

    app.delete(
      "/stages/:id",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          response: {
            204: { type: "null" },
            401: { type: "null" },
            403: { type: "null" },
            404: { type: "null" },
            409: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        if (authorized.membership.role !== "admin") {
          return reply.code(403).send();
        }
        const { id } = request.params as { id: string };
        const result = await database.deleteStage(authorized.workspaceId, id);
        if (result === "not-found") return reply.code(404).send();
        if (result === "has-deals") return reply.code(409).send();
        return reply.code(204).send();
      },
    );

    const dealsQuerySchema = {
      type: "object",
      additionalProperties: false,
      required: ["workspaceId", "pipelineId"],
      properties: {
        workspaceId: { type: "string", format: "uuid" },
        pipelineId: { type: "string", format: "uuid" },
      },
    } as const;

    app.get(
      "/deals",
      {
        config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
        schema: {
          querystring: dealsQuerySchema,
          response: {
            200: { type: "array", items: dealSchema },
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const { pipelineId } = request.query as { pipelineId: string };
        return database.listDeals(authorized.workspaceId, pipelineId);
      },
    );

    app.post(
      "/deals",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          querystring: workspaceQuerySchema,
          body: {
            type: "object",
            additionalProperties: false,
            required: ["pipelineId", "stageId", "title"],
            properties: {
              pipelineId: { type: "string", format: "uuid" },
              stageId: { type: "string", format: "uuid" },
              title: { type: "string", minLength: 1 },
              valueCents: { type: ["integer", "null"] },
              contactId: { type: ["string", "null"], format: "uuid" },
              companyId: { type: ["string", "null"], format: "uuid" },
            },
          },
          response: {
            201: dealSchema,
            401: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const created = await database.createDeal(
          authorized.workspaceId,
          request.body as {
            pipelineId: string;
            stageId: string;
            title: string;
            valueCents?: number | null;
            contactId?: string | null;
            companyId?: string | null;
          },
        );
        if (!created) return reply.code(404).send();
        return reply.code(201).send(created);
      },
    );

    app.get(
      "/deals/:id",
      {
        config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          response: {
            200: dealSchema,
            401: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const { id } = request.params as { id: string };
        const deal = await database.getDeal(authorized.workspaceId, id);
        if (!deal) return reply.code(404).send();
        return deal;
      },
    );

    app.patch(
      "/deals/:id",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          body: {
            type: "object",
            additionalProperties: false,
            minProperties: 1,
            properties: {
              title: { type: "string", minLength: 1 },
              valueCents: { type: ["integer", "null"] },
              contactId: { type: ["string", "null"], format: "uuid" },
              companyId: { type: ["string", "null"], format: "uuid" },
            },
          },
          response: {
            200: dealSchema,
            401: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const { id } = request.params as { id: string };
        const updated = await database.updateDeal(
          authorized.workspaceId,
          id,
          request.body as {
            title?: string;
            valueCents?: number | null;
            contactId?: string | null;
            companyId?: string | null;
          },
        );
        if (!updated) return reply.code(404).send();
        return updated;
      },
    );

    app.post(
      "/deals/:id/move",
      {
        config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          body: {
            type: "object",
            additionalProperties: false,
            required: ["stageId"],
            properties: {
              stageId: { type: "string", format: "uuid" },
              prevDealId: { type: ["string", "null"], format: "uuid" },
              nextDealId: { type: ["string", "null"], format: "uuid" },
            },
          },
          response: {
            200: dealSchema,
            401: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const { id } = request.params as { id: string };
        const { stageId, prevDealId, nextDealId } = request.body as {
          stageId: string;
          prevDealId?: string | null;
          nextDealId?: string | null;
        };
        const moved = await database.moveDeal(authorized.workspaceId, id, {
          stageId,
          prevDealId: prevDealId ?? null,
          nextDealId: nextDealId ?? null,
        });
        if (!moved) return reply.code(404).send();
        return moved;
      },
    );

    app.delete(
      "/deals/:id",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          response: {
            204: { type: "null" },
            401: { type: "null" },
            403: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        if (authorized.membership.role !== "admin") {
          return reply.code(403).send();
        }
        const { id } = request.params as { id: string };
        const deleted = await database.deleteDeal(authorized.workspaceId, id);
        if (!deleted) return reply.code(404).send();
        return reply.code(204).send();
      },
    );

    const channelInstanceSchema = {
      type: "object",
      additionalProperties: false,
      required: [
        "id",
        "workspaceId",
        "provider",
        "providerInstanceId",
        "webhookSecret",
        "isActive",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        id: { type: "string", format: "uuid" },
        workspaceId: { type: "string", format: "uuid" },
        provider: { type: "string" },
        providerInstanceId: { type: ["string", "null"] },
        webhookSecret: { type: "string" },
        isActive: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    } as const;

    const conversationSchema = {
      type: "object",
      additionalProperties: false,
      required: [
        "id",
        "workspaceId",
        "channelInstanceId",
        "contactId",
        "contactName",
        "providerThreadId",
        "epoch",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        id: { type: "string", format: "uuid" },
        workspaceId: { type: "string", format: "uuid" },
        channelInstanceId: { type: "string", format: "uuid" },
        contactId: { type: ["string", "null"] },
        contactName: { type: ["string", "null"] },
        providerThreadId: { type: "string" },
        epoch: { type: "integer" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    } as const;

    const messageSchema = {
      type: "object",
      additionalProperties: false,
      required: [
        "id",
        "workspaceId",
        "conversationId",
        "providerMessageId",
        "direction",
        "status",
        "contentType",
        "body",
        "createdAt",
      ],
      properties: {
        id: { type: "string", format: "uuid" },
        workspaceId: { type: "string", format: "uuid" },
        conversationId: { type: "string", format: "uuid" },
        providerMessageId: { type: ["string", "null"] },
        direction: { type: "string" },
        status: { type: "string" },
        contentType: { type: "string" },
        body: { type: ["string", "null"] },
        createdAt: { type: "string", format: "date-time" },
      },
    } as const;

    app.get(
      "/channel-instances",
      {
        config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
        schema: {
          querystring: workspaceQuerySchema,
          response: {
            200: { type: "array", items: channelInstanceSchema },
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        return database.listChannelInstances(authorized.workspaceId);
      },
    );

    app.post(
      "/channel-instances",
      {
        config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
        schema: {
          querystring: workspaceQuerySchema,
          body: {
            type: "object",
            additionalProperties: false,
            required: ["provider", "webhookSecret"],
            properties: {
              provider: { type: "string", minLength: 1 },
              providerInstanceId: { type: ["string", "null"] },
              webhookSecret: { type: "string", minLength: 1 },
            },
          },
          response: {
            201: channelInstanceSchema,
            401: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const input = request.body as {
          provider: string;
          providerInstanceId?: string | null;
          webhookSecret: string;
        };
        const instance = await database.createChannelInstance(
          authorized.workspaceId,
          input,
        );
        if (!instance) return reply.code(404).send();
        return reply.code(201).send(instance);
      },
    );

    app.get(
      "/conversations",
      {
        config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
        schema: {
          querystring: workspaceQuerySchema,
          response: {
            200: { type: "array", items: conversationSchema },
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        // Lazy dispatch maintenance: expired leases become `unknown` so the
        // list reflects blocked sends, and orphaned `pending` intents (e.g.
        // after a crash between commit and claim) are resumed safely — a
        // pending intent was never sent to the provider (ADR 0010 §2,§4).
        await database.reapExpiredDispatches(authorized.workspaceId);
        void dispatcher.dispatchPending(authorized.workspaceId);
        return database.listConversations(authorized.workspaceId);
      },
    );

    app.post(
      "/conversations/:id/messages",
      {
        config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          body: {
            type: "object",
            additionalProperties: false,
            required: ["body"],
            properties: {
              body: { type: "string", minLength: 1, maxLength: 4096 },
            },
          },
          response: {
            201: messageSchema,
            401: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const { id } = request.params as { id: string };
        const { body } = request.body as { body: string };
        // Commit message + intent in one transaction, then claim/send/settle
        // synchronously so the response carries the final status (ADR 0010).
        const created = await database.createOutboundIntent(
          authorized.workspaceId,
          { conversationId: id, body },
        );
        if (created.kind === "missing") return reply.code(404).send();
        await dispatcher.dispatchIntent(
          authorized.workspaceId,
          created.intentId,
        );
        void dispatcher.maintainWorkspace(authorized.workspaceId);
        const messages = await database.listMessages(
          authorized.workspaceId,
          id,
        );
        const message = messages.find((row) => row.id === created.messageId);
        if (!message) return reply.code(404).send();
        return reply.code(201).send(message);
      },
    );

    app.get(
      "/conversations/:id/messages",
      {
        config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
        schema: {
          params: idParamsSchema,
          querystring: workspaceQuerySchema,
          response: {
            200: { type: "array", items: messageSchema },
            401: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeWorkspaceRequest(request, reply);
        if (!authorized) return;
        const { id } = request.params as { id: string };
        const conversation = await database.getConversation(
          authorized.workspaceId,
          id,
        );
        if (!conversation) return reply.code(404).send();
        return database.listMessages(authorized.workspaceId, id);
      },
    );

    app.post(
      "/webhooks/waha/:workspaceId/:channelInstanceId",
      {
        config: {
          rateLimit: {
            max: 120,
            timeWindow: "1 minute",
          },
        },
        schema: {
          params: {
            type: "object",
            additionalProperties: false,
            required: ["workspaceId", "channelInstanceId"],
            properties: {
              workspaceId: { type: "string", format: "uuid" },
              channelInstanceId: { type: "string", format: "uuid" },
            },
          },
          response: {
            200: {
              type: "object",
              additionalProperties: false,
              required: ["received"],
              properties: { received: { type: "boolean" } },
            },
            400: { type: "null" },
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const { workspaceId, channelInstanceId } = request.params as {
          workspaceId: string;
          channelInstanceId: string;
        };
        const instance = await database.getChannelInstance(
          workspaceId,
          channelInstanceId,
        );
        if (!instance) {
          return reply.code(401).send();
        }
        const rawBody = (request as unknown as { rawBody?: Buffer }).rawBody;
        if (!rawBody) {
          return reply.code(401).send();
        }
        const signature = String(
          request.headers["x-webhook-hmac"] ?? "",
        ).trim();
        if (
          !waha.verifyWebhook({
            rawBody,
            signatureHeader: signature,
            secret: instance.webhookSecret,
          })
        ) {
          return reply.code(401).send();
        }
        let parsed: unknown;
        try {
          parsed = JSON.parse(rawBody.toString("utf8"));
        } catch {
          return reply.code(400).send();
        }
        // A WAHA webhook URL receives events for every session it is
        // subscribed to; drop events that do not belong to this channel
        // instance's WAHA session.
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "session" in parsed &&
          typeof parsed.session === "string" &&
          instance.providerInstanceId &&
          parsed.session !== instance.providerInstanceId
        ) {
          return reply.code(200).send({ received: true });
        }
        const event = waha.normalizeEvent(parsed);
        if (event.kind === "message") {
          const result = await database.receiveInboundMessage(workspaceId, {
            channelInstanceId,
            providerThreadId: event.providerThreadId,
            providerMessageId: event.providerMessageId,
            providerEventId: event.providerEventId,
            providerEventKind: event.providerEventKind,
            senderPhone: event.sender.phone ?? null,
            contentType: event.content.type,
            body: event.content.text,
            rawPayload: parsed,
            signatureVerified: true,
          });
          return reply.code(200).send({
            received: result.kind === "received",
          });
        }
        if (event.kind === "status") {
          const result = await database.recordDeliveryStatus(workspaceId, {
            channelInstanceId,
            providerMessageId: event.providerMessageId,
            providerEventId: event.providerEventId,
            providerEventKind: event.providerEventKind,
            status: event.status,
            rawPayload: parsed,
            signatureVerified: true,
          });
          return reply.code(200).send({
            received: result.kind === "applied",
          });
        }
        return reply.code(200).send({ received: true });
      },
    );
  }

  return app;
}
