import type { FastifyInstance } from "fastify";
import {
  workspaceQuerySchema,
  type AuthGuards,
  type RouteDatabase,
} from "./shared.ts";

const idNameItem = (extra: Record<string, unknown>) => ({
  type: "object",
  additionalProperties: false,
  required: ["id", ...Object.keys(extra)],
  properties: {
    id: { type: "string", format: "uuid" },
    ...extra,
  },
});

const searchResultSchema = {
  type: "object",
  additionalProperties: false,
  required: ["contacts", "companies", "deals"],
  properties: {
    contacts: {
      type: "array",
      items: idNameItem({
        name: { type: "string" },
        email: { type: ["string", "null"] },
      }),
    },
    companies: {
      type: "array",
      items: idNameItem({ name: { type: "string" } }),
    },
    deals: {
      type: "array",
      items: idNameItem({ title: { type: "string" } }),
    },
  },
} as const;

export function registerSearchRoutes(
  app: FastifyInstance,
  deps: {
    database: RouteDatabase;
    authorizeWorkspaceRequest: AuthGuards["authorizeWorkspaceRequest"];
  },
) {
  const { database, authorizeWorkspaceRequest } = deps;

  app.get(
    "/search",
    {
      config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
      schema: {
        querystring: {
          type: "object",
          additionalProperties: false,
          required: ["workspaceId", "q"],
          properties: {
            ...workspaceQuerySchema.properties,
            q: { type: "string", minLength: 1, maxLength: 100 },
          },
        },
        response: {
          200: searchResultSchema,
          401: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const { q } = request.query as { q: string };
      return database.searchEntities(authorized.workspaceId, q);
    },
  );
}
