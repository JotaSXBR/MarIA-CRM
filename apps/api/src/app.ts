import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import rateLimit from "@fastify/rate-limit";
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
  };
  auth: AuthPort;
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
  }

  return app;
}
