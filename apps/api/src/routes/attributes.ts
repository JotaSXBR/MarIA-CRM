import type { FastifyInstance } from "fastify";
import {
  attributeDefinitionSchema,
  attributeEntityTypeSchema,
  attributeTypeSchema,
  entityAttributeSchema,
  entityAttributesBodySchema,
  idParamsSchema,
  workspaceQuerySchema,
  type AuthGuards,
  type RouteDatabase,
} from "./shared.ts";

const optionsSchema = {
  type: ["array", "null"],
  items: { type: "string", minLength: 1 },
  maxItems: 50,
} as const;

export function registerAttributeRoutes(
  app: FastifyInstance,
  deps: {
    database: RouteDatabase;
    authorizeWorkspaceRequest: AuthGuards["authorizeWorkspaceRequest"];
  },
) {
  const { database, authorizeWorkspaceRequest } = deps;

  app.get(
    "/attributes",
    {
      config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
      schema: {
        querystring: {
          type: "object",
          additionalProperties: false,
          required: ["workspaceId"],
          properties: {
            ...workspaceQuerySchema.properties,
            entityType: attributeEntityTypeSchema,
          },
        },
        response: {
          200: { type: "array", items: attributeDefinitionSchema },
          401: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const { entityType } = request.query as {
        entityType?: "contact" | "company" | "deal";
      };
      return database.listAttributes(authorized.workspaceId, entityType);
    },
  );

  app.post(
    "/attributes",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        querystring: workspaceQuerySchema,
        body: {
          type: "object",
          additionalProperties: false,
          required: ["entityType", "label", "type"],
          properties: {
            entityType: attributeEntityTypeSchema,
            label: { type: "string", minLength: 1 },
            type: attributeTypeSchema,
            options: optionsSchema,
            key: { type: "string", minLength: 1, maxLength: 64 },
          },
        },
        response: {
          201: attributeDefinitionSchema,
          401: { type: "null" },
          409: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const input = request.body as {
        entityType: "contact" | "company" | "deal";
        label: string;
        type: "text" | "number" | "date" | "boolean" | "select";
        options?: string[] | null;
        key?: string;
      };
      const attribute = await database.createAttribute(
        authorized.workspaceId,
        input,
      );
      if (!attribute) return reply.code(409).send();
      return reply.code(201).send(attribute);
    },
  );

  app.patch(
    "/attributes/:id",
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
            label: { type: "string", minLength: 1 },
            options: optionsSchema,
          },
        },
        response: {
          200: attributeDefinitionSchema,
          401: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const input = request.body as {
        label?: string;
        options?: string[] | null;
      };
      const attribute = await database.updateAttribute(
        authorized.workspaceId,
        id,
        input,
      );
      if (!attribute) return reply.code(404).send();
      return attribute;
    },
  );

  app.delete(
    "/attributes/:id",
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
      const deleted = await database.deleteAttribute(
        authorized.workspaceId,
        id,
      );
      if (!deleted) return reply.code(404).send();
      return reply.code(204).send();
    },
  );
}

type AttributeEntityType = "contact" | "company" | "deal";

/** Registers `GET/PUT /{entityPath}/:id/attributes` for one entity kind; the
 * entity modules call it so attribute routes stay next to their parents. */
export function registerEntityAttributeRoutes(
  app: FastifyInstance,
  deps: {
    database: RouteDatabase;
    authorizeWorkspaceRequest: AuthGuards["authorizeWorkspaceRequest"];
  },
  entity: {
    path: string;
    entityType: AttributeEntityType;
    getParent: (workspaceId: string, id: string) => Promise<unknown>;
  },
) {
  const { database, authorizeWorkspaceRequest } = deps;
  const base = `/${entity.path}/:id/attributes`;

  app.get(
    base,
    {
      config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        response: {
          200: { type: "array", items: entityAttributeSchema },
          401: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const { id } = request.params as { id: string };
      if (!(await entity.getParent(authorized.workspaceId, id))) {
        return reply.code(404).send();
      }
      return database.listEntityAttributes(
        authorized.workspaceId,
        entity.entityType,
        id,
      );
    },
  );

  app.put(
    base,
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        body: entityAttributesBodySchema,
        response: {
          200: { type: "array", items: entityAttributeSchema },
          401: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const { values } = request.body as {
        values: {
          attributeId: string;
          value: string | number | boolean | null;
        }[];
      };
      const assigned = await database.setEntityAttributes(
        authorized.workspaceId,
        entity.entityType,
        id,
        values,
      );
      if (!assigned) return reply.code(404).send();
      return assigned;
    },
  );
}
