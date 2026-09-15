import Fastify, { type FastifyRequest } from "fastify";
import rateLimit from "@fastify/rate-limit";
import type { AuthPort } from "@maria/auth";

type ContactListItem = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
};

type AppDependencies = {
  database: {
    listContacts: (workspaceId: string) => Promise<ContactListItem[]>;
  };
  auth: AuthPort;
};

function extractBearerToken(request: FastifyRequest): string | undefined {
  const header = request.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return undefined;
  return header.slice(7);
}

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
        const result = await dependencies.auth.login(email, password);
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
        const session = await dependencies.auth.verifySession(token);
        if (!session || !session.isAdmin) return reply.code(401).send();
        const { email, name, password, workspaceId, role } = request.body as {
          email: string;
          name: string;
          password: string;
          workspaceId?: string;
          role?: "admin" | "member";
        };
        const result = await dependencies.auth.createUser({
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
          querystring: {
            type: "object",
            additionalProperties: false,
            required: ["workspaceId"],
            properties: {
              workspaceId: { type: "string", format: "uuid" },
            },
          },
          response: {
            200: {
              type: "array",
              items: {
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
              },
            },
            401: { type: "null" },
          },
        },
      },
      async (request, reply) => {
        const token = extractBearerToken(request);
        if (!token) return reply.code(401).send();
        const session = await dependencies.auth.verifySession(token);
        if (!session) return reply.code(401).send();
        const { workspaceId } = request.query as { workspaceId: string };
        const membership = await dependencies.auth.authorizeWorkspace(
          session.userId,
          workspaceId,
        );
        if (!membership) return reply.code(401).send();
        return dependencies.database.listContacts(workspaceId);
      },
    );
  }

  return app;
}
