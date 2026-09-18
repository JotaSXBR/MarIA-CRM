import type { FastifyReply, FastifyRequest } from "fastify";
import type { AuthPort } from "@maria/auth";
import type { Database } from "@maria/database";

/** Business persistence surface exposed to routes; lifecycle (`close`) and
 * internal scoping helpers (`withWorkspace`/`withUser`) belong to the
 * composition root. */
export type RouteDatabase = Omit<
  Database,
  "close" | "withWorkspace" | "withUser"
>;

export function extractBearerToken(
  request: FastifyRequest,
): string | undefined {
  const header = request.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return undefined;
  return header.slice(7);
}

export function createAuthGuards(auth: AuthPort) {
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

  const requireAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
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

  return { authorizeWorkspaceRequest, requireAdmin };
}

export type AuthGuards = ReturnType<typeof createAuthGuards>;

export const idParamsSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: { id: { type: "string", format: "uuid" } },
} as const;

export const workspaceQuerySchema = {
  type: "object",
  additionalProperties: false,
  required: ["workspaceId"],
  properties: {
    workspaceId: { type: "string", format: "uuid" },
  },
} as const;

export const contactSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "name", "email", "phone", "companyId", "createdAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    email: { type: ["string", "null"] },
    phone: { type: ["string", "null"] },
    companyId: { type: ["string", "null"], format: "uuid" },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;

export const dealSchema = {
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

export const entityLinkProperties = {
  contactId: { type: ["string", "null"], format: "uuid" },
  companyId: { type: ["string", "null"], format: "uuid" },
  dealId: { type: ["string", "null"], format: "uuid" },
} as const;

export const entityDealSchema = {
  ...dealSchema,
  required: [
    ...dealSchema.required,
    "stageName",
    "pipelineName",
    "contactName",
    "companyName",
  ],
  properties: {
    ...dealSchema.properties,
    stageName: { type: "string" },
    pipelineName: { type: "string" },
    contactName: { type: ["string", "null"] },
    companyName: { type: ["string", "null"] },
  },
} as const;

export const tagSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "name", "color", "createdAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    color: { type: ["string", "null"] },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;

export const tagIdsBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["tagIds"],
  properties: {
    tagIds: {
      type: "array",
      items: { type: "string", format: "uuid" },
      maxItems: 50,
    },
  },
} as const;

export const attributeEntityTypeSchema = {
  type: "string",
  enum: ["contact", "company", "deal"],
} as const;

export const attributeTypeSchema = {
  type: "string",
  enum: ["text", "number", "date", "boolean", "select"],
} as const;

export const attributeDefinitionSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "entityType",
    "key",
    "label",
    "type",
    "options",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: { type: "string", format: "uuid" },
    entityType: attributeEntityTypeSchema,
    key: { type: "string" },
    label: { type: "string" },
    type: attributeTypeSchema,
    options: {
      type: ["array", "null"],
      items: { type: "string" },
    },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const entityAttributeSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "entityType",
    "key",
    "label",
    "type",
    "options",
    "createdAt",
    "updatedAt",
    "value",
  ],
  properties: {
    ...attributeDefinitionSchema.properties,
    value: { type: ["string", "number", "boolean", "null"] },
  },
} as const;

export const entityAttributesBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["values"],
  properties: {
    values: {
      type: "array",
      maxItems: 100,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["attributeId", "value"],
        properties: {
          attributeId: { type: "string", format: "uuid" },
          value: { type: ["string", "number", "boolean", "null"] },
        },
      },
    },
  },
} as const;

export const noteSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "contactId",
    "companyId",
    "dealId",
    "authorId",
    "authorName",
    "body",
    "createdAt",
  ],
  properties: {
    id: { type: "string", format: "uuid" },
    ...entityLinkProperties,
    authorId: { type: ["string", "null"], format: "uuid" },
    authorName: { type: ["string", "null"] },
    body: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;

export const taskSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "contactId",
    "companyId",
    "dealId",
    "assigneeId",
    "assigneeName",
    "title",
    "dueAt",
    "doneAt",
    "createdAt",
  ],
  properties: {
    id: { type: "string", format: "uuid" },
    ...entityLinkProperties,
    assigneeId: { type: ["string", "null"], format: "uuid" },
    assigneeName: { type: ["string", "null"] },
    title: { type: "string" },
    dueAt: { type: ["string", "null"], format: "date-time" },
    doneAt: { type: ["string", "null"], format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;
