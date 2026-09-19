import type { FastifyInstance } from "fastify";
import type { AuthPort, WorkspaceRole } from "@maria/auth";
import {
  idParamsSchema,
  workspaceQuerySchema,
  workspaceRoleSchema,
  type AuthGuards,
  type RouteDatabase,
} from "./shared.ts";

export function registerAdminRoutes(
  app: FastifyInstance,
  deps: {
    auth: AuthPort;
    database: RouteDatabase;
    requireAdmin: AuthGuards["requireAdmin"];
  },
) {
  const { auth, database, requireAdmin } = deps;
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
            role: workspaceRoleSchema,
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
        role?: WorkspaceRole;
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
      role: workspaceRoleSchema,
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
            role: workspaceRoleSchema,
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
        role: WorkspaceRole;
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
            role: workspaceRoleSchema,
          },
        },
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
      const session = await requireAdmin(request, reply);
      if (!session) return;
      const { id } = request.params as { id: string };
      const { workspaceId } = request.query as { workspaceId: string };
      const { role } = request.body as { role: WorkspaceRole };
      const result = await auth.updateMembershipRole(
        workspaceId,
        id,
        role,
        "admin",
      );
      if (result === "not-found") return reply.code(404).send();
      if (result === "last-admin") return reply.code(409).send();
      if (result === "forbidden") return reply.code(403).send();
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
          403: { type: "null" },
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
      const result = await auth.removeMembership(workspaceId, id, "admin");
      if (result === "not-found") return reply.code(404).send();
      if (result === "last-admin") return reply.code(409).send();
      if (result === "forbidden") return reply.code(403).send();
      return reply.code(204).send();
    },
  );
}
