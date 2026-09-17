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
