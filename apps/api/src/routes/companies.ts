import type { FastifyInstance } from "fastify";
import {
  contactSchema,
  entityDealSchema,
  idParamsSchema,
  noteSchema,
  workspaceQuerySchema,
  type AuthGuards,
  type RouteDatabase,
} from "./shared.ts";

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

export function registerCompanyRoutes(
  app: FastifyInstance,
  deps: {
    database: RouteDatabase;
    authorizeWorkspaceRequest: AuthGuards["authorizeWorkspaceRequest"];
  },
) {
  const { database, authorizeWorkspaceRequest } = deps;
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
      const input = request.body as { name: string };
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
      const input = request.body as { name?: string };
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
      const deleted = await database.deleteCompany(authorized.workspaceId, id);
      if (!deleted) return reply.code(404).send();
      return reply.code(204).send();
    },
  );

  app.get(
    "/companies/:id/contacts",
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
          200: { type: "array", items: contactSchema },
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
      return database.listContacts(authorized.workspaceId, { companyId: id });
    },
  );

  app.get(
    "/companies/:id/deals",
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
          200: { type: "array", items: entityDealSchema },
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
      return database.listDealsForCompany(authorized.workspaceId, id);
    },
  );

  app.get(
    "/companies/:id/notes",
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
          200: { type: "array", items: noteSchema },
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
      return database.listNotes(authorized.workspaceId, { companyId: id });
    },
  );
}
