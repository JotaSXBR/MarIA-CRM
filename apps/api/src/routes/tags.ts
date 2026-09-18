import type { FastifyInstance } from "fastify";
import {
  idParamsSchema,
  tagIdsBodySchema,
  tagSchema,
  workspaceQuerySchema,
  type AuthGuards,
  type RouteDatabase,
} from "./shared.ts";

const tagColorSchema = {
  type: ["string", "null"],
  pattern: "^#[0-9a-fA-F]{6}$",
} as const;

export function registerTagRoutes(
  app: FastifyInstance,
  deps: {
    database: RouteDatabase;
    requireWorkspaceRole: AuthGuards["requireWorkspaceRole"];
  },
) {
  const { database, requireWorkspaceRole } = deps;

  app.get(
    "/tags",
    {
      config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
      schema: {
        querystring: workspaceQuerySchema,
        response: {
          200: { type: "array", items: tagSchema },
          401: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply);
      if (!authorized) return;
      return database.listTags(authorized.workspaceId);
    },
  );

  app.post(
    "/tags",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        querystring: workspaceQuerySchema,
        body: {
          type: "object",
          additionalProperties: false,
          required: ["name"],
          properties: {
            name: { type: "string", minLength: 1 },
            color: tagColorSchema,
          },
        },
        response: {
          201: tagSchema,
          401: { type: "null" },
          403: { type: "null" },
          409: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply, "manager");
      if (!authorized) return;
      const input = request.body as {
        name: string;
        color?: string | null;
      };
      const tag = await database.createTag(authorized.workspaceId, input);
      if (!tag) return reply.code(409).send();
      return reply.code(201).send(tag);
    },
  );

  app.patch(
    "/tags/:id",
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
            name: { type: "string", minLength: 1 },
            color: tagColorSchema,
          },
        },
        response: {
          200: tagSchema,
          401: { type: "null" },
          403: { type: "null" },
          404: { type: "null" },
          409: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply, "manager");
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const existing = await database.getTag(authorized.workspaceId, id);
      if (!existing) return reply.code(404).send();
      const input = request.body as {
        name?: string;
        color?: string | null;
      };
      const tag = await database.updateTag(authorized.workspaceId, id, input);
      if (!tag) return reply.code(409).send();
      return tag;
    },
  );

  app.delete(
    "/tags/:id",
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
      const deleted = await database.deleteTag(authorized.workspaceId, id);
      if (!deleted) return reply.code(404).send();
      return reply.code(204).send();
    },
  );
}

type TagRow = Awaited<ReturnType<RouteDatabase["listTags"]>>[number];

/** Registers `GET/PUT /{entityPath}/:id/tags` for one entity kind; the entity
 * modules call it so tag routes stay registered next to their parents. */
export function registerEntityTagRoutes(
  app: FastifyInstance,
  deps: {
    requireWorkspaceRole: AuthGuards["requireWorkspaceRole"];
  },
  entity: {
    path: string;
    getParent: (workspaceId: string, id: string) => Promise<unknown>;
    listTags: (workspaceId: string, entityId: string) => Promise<TagRow[]>;
    setTags: (
      workspaceId: string,
      entityId: string,
      tagIds: string[],
    ) => Promise<TagRow[] | undefined>;
  },
) {
  const { requireWorkspaceRole } = deps;
  const base = `/${entity.path}/:id/tags`;

  app.get(
    base,
    {
      config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        response: {
          200: { type: "array", items: tagSchema },
          401: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply);
      if (!authorized) return;
      const { id } = request.params as { id: string };
      if (!(await entity.getParent(authorized.workspaceId, id))) {
        return reply.code(404).send();
      }
      return entity.listTags(authorized.workspaceId, id);
    },
  );

  app.put(
    base,
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        body: tagIdsBodySchema,
        response: {
          200: { type: "array", items: tagSchema },
          401: { type: "null" },
          403: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply, "agent");
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const { tagIds } = request.body as { tagIds: string[] };
      const assigned = await entity.setTags(authorized.workspaceId, id, tagIds);
      if (!assigned) return reply.code(404).send();
      return assigned;
    },
  );
}
