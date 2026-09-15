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

    const authorizeContactRequest = async (
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
        const token = extractBearerToken(request);
        if (!token) return reply.code(401).send();
        const session = await auth.verifySession(token);
        if (!session || !session.isAdmin) return reply.code(401).send();
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
        const authorized = await authorizeContactRequest(request, reply);
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
        const authorized = await authorizeContactRequest(request, reply);
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
          params: {
            type: "object",
            additionalProperties: false,
            required: ["id"],
            properties: { id: { type: "string", format: "uuid" } },
          },
          querystring: workspaceQuerySchema,
          response: {
            200: contactSchema,
            401: { type: "null" },
            404: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const authorized = await authorizeContactRequest(request, reply);
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
          params: {
            type: "object",
            additionalProperties: false,
            required: ["id"],
            properties: { id: { type: "string", format: "uuid" } },
          },
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
        const authorized = await authorizeContactRequest(request, reply);
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
          params: {
            type: "object",
            additionalProperties: false,
            required: ["id"],
            properties: { id: { type: "string", format: "uuid" } },
          },
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
        const authorized = await authorizeContactRequest(request, reply);
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
  }

  return app;
}
