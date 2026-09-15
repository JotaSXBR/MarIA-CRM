import Fastify, { type FastifyRequest } from "fastify";
import rateLimit from "@fastify/rate-limit";

type ContactDependencies = {
  database: {
    listContacts: (workspaceId: string) => Promise<
      {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        createdAt: Date;
      }[]
    >;
  };
  authorizeWorkspace: (request: FastifyRequest) => Promise<string | undefined>;
};

export function buildApp(dependencies?: ContactDependencies) {
  const app = Fastify({ logger: true });
  
  // Register rate limiting plugin
  app.register(rateLimit, {
    max: 100, // limit each IP to 100 requests per windowMs
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
    app.get(
      "/contacts",
      {
        config: {
          rateLimit: {
            max: 50, // More restrictive limit for protected routes
            timeWindow: "1 minute",
          },
        },
        schema: {
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
        const workspaceId = await dependencies.authorizeWorkspace(request);
        if (!workspaceId) return reply.code(401).send();
        return dependencies.database.listContacts(workspaceId);
      },
    );
  }

  return app;
}
