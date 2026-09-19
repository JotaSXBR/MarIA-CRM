import type { FastifyInstance } from "fastify";
import {
  idParamsSchema,
  workspaceQuerySchema,
  type AuthGuards,
  type RouteDatabase,
} from "./shared.ts";

const quickReplySchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "title",
    "shortcut",
    "body",
    "createdBy",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: { type: "string", format: "uuid" },
    title: { type: "string" },
    shortcut: { type: "string" },
    body: { type: "string" },
    createdBy: { type: ["string", "null"], format: "uuid" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

const quickReplyBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "shortcut", "body"],
  properties: {
    title: { type: "string", minLength: 1, maxLength: 80 },
    shortcut: { type: "string", minLength: 1, maxLength: 40 },
    body: { type: "string", minLength: 1, maxLength: 4096 },
  },
} as const;

const quickReplyPatchSchema = {
  type: "object",
  additionalProperties: false,
  minProperties: 1,
  properties: {
    title: { type: "string", minLength: 1, maxLength: 80 },
    shortcut: { type: "string", minLength: 1, maxLength: 40 },
    body: { type: "string", minLength: 1, maxLength: 4096 },
  },
} as const;

/** Workspace reply templates — the shared "canned responses" surface that the
 * composer reads and that later becomes the agent's editable knowledge base
 * (ADR 0016 direction). Shortcut conflicts map to 409. */
export function registerQuickReplyRoutes(
  app: FastifyInstance,
  deps: {
    database: RouteDatabase;
    requireWorkspaceRole: AuthGuards["requireWorkspaceRole"];
  },
) {
  const { database, requireWorkspaceRole } = deps;

  app.get(
    "/quick-replies",
    {
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
      schema: {
        querystring: workspaceQuerySchema,
        response: {
          200: { type: "array", items: quickReplySchema },
          401: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply);
      if (!authorized) return;
      return database.listQuickReplies(authorized.workspaceId);
    },
  );

  app.post(
    "/quick-replies",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        querystring: workspaceQuerySchema,
        body: quickReplyBodySchema,
        response: {
          201: quickReplySchema,
          401: { type: "null" },
          403: { type: "null" },
          409: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply, "agent");
      if (!authorized) return;
      const input = request.body as {
        title: string;
        shortcut: string;
        body: string;
      };
      const created = await database.createQuickReply(authorized.workspaceId, {
        ...input,
        createdBy: authorized.session.userId,
      });
      if (!created) return reply.code(409).send();
      return reply.code(201).send(created);
    },
  );

  app.patch(
    "/quick-replies/:id",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        body: quickReplyPatchSchema,
        response: {
          200: quickReplySchema,
          401: { type: "null" },
          403: { type: "null" },
          404: { type: "null" },
          409: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply, "agent");
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const existing = await database.getQuickReply(authorized.workspaceId, id);
      if (!existing) return reply.code(404).send();
      const input = request.body as {
        title?: string;
        shortcut?: string;
        body?: string;
      };
      const updated = await database.updateQuickReply(
        authorized.workspaceId,
        id,
        input,
      );
      if (!updated) return reply.code(409).send();
      return updated;
    },
  );

  app.delete(
    "/quick-replies/:id",
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
      const authorized = await requireWorkspaceRole(request, reply, "manager");
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const deleted = await database.deleteQuickReply(
        authorized.workspaceId,
        id,
      );
      if (!deleted) return reply.code(404).send();
      return reply.code(204).send();
    },
  );
}
