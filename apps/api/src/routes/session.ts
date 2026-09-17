import type { FastifyInstance } from "fastify";
import type { AuthPort } from "@maria/auth";
import { extractBearerToken } from "./shared.ts";

export function registerSessionRoutes(
  app: FastifyInstance,
  deps: { auth: AuthPort },
) {
  const { auth } = deps;
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

  const meResponseSchema = {
    type: "object",
    additionalProperties: false,
    required: ["userId", "email", "name", "isAdmin"],
    properties: {
      userId: { type: "string", format: "uuid" },
      email: { type: "string" },
      name: { type: "string" },
      isAdmin: { type: "boolean" },
    },
  } as const;

  app.get(
    "/me",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        response: {
          200: meResponseSchema,
          401: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const token = extractBearerToken(request);
      if (!token) return reply.code(401).send();
      const session = await auth.verifySession(token);
      if (!session) return reply.code(401).send();
      return session;
    },
  );

  app.patch(
    "/me",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          minProperties: 1,
          properties: {
            name: { type: "string", minLength: 1 },
            currentPassword: { type: "string", minLength: 1 },
            newPassword: { type: "string", minLength: 8 },
          },
        },
        response: {
          200: meResponseSchema,
          400: { type: "null" },
          401: { type: "null" },
          403: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const token = extractBearerToken(request);
      if (!token) return reply.code(401).send();
      const session = await auth.verifySession(token);
      if (!session) return reply.code(401).send();
      const input = request.body as {
        name?: string;
        currentPassword?: string;
        newPassword?: string;
      };
      // Password change requires both fields — a lone `currentPassword`
      // would otherwise be a silent no-op.
      if (
        (input.currentPassword === undefined) !==
        (input.newPassword === undefined)
      ) {
        return reply.code(400).send();
      }
      if (input.newPassword !== undefined) {
        const result = await auth.changePassword(session.userId, {
          currentPassword: input.currentPassword!,
          newPassword: input.newPassword,
          exceptToken: token,
        });
        if (result === "invalid-password") return reply.code(403).send();
        if (result === "not-found") return reply.code(401).send();
      }
      if (input.name !== undefined) {
        const result = await auth.updateUser(session.userId, {
          name: input.name,
        });
        if (result === "not-found") return reply.code(401).send();
      }
      return auth.verifySession(token);
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
}
