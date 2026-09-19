import type { FastifyInstance } from "fastify";
import { ROLE_RANK, type AuthPort, type WorkspaceRole } from "@maria/auth";
import {
  extractBearerToken,
  workspaceQuerySchema,
  workspaceRoleSchema,
  type AuthGuards,
} from "./shared.ts";

const invitationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "email", "role", "expiresAt", "createdAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    email: { type: "string" },
    role: workspaceRoleSchema,
    expiresAt: { type: "string", format: "date-time" },
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

/** Workspace team surface (ADR 0015 items 4-5): member listing plus
 * manager/admin membership mutations (rank-checked inside the workspace
 * advisory lock) and the invitation lifecycle — managers/admins issue
 * copyable links whose tokens are stored only as hashes; acceptance is public
 * because the token itself is the credential. `admin` is never invitable and
 * an invitation grant may not reach the inviter's own rank. */
export function registerInvitationRoutes(
  app: FastifyInstance,
  deps: {
    auth: AuthPort;
    requireWorkspaceRole: AuthGuards["requireWorkspaceRole"];
  },
) {
  const { auth, requireWorkspaceRole } = deps;

  app.get(
    "/members",
    {
      schema: {
        querystring: workspaceQuerySchema,
        response: {
          200: { type: "array", items: memberSchema },
          401: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply, "viewer");
      if (!authorized) return reply;
      return auth.listMembers(authorized.workspaceId);
    },
  );

  const memberParamsSchema = {
    type: "object",
    additionalProperties: false,
    required: ["id"],
    properties: { id: { type: "string", format: "uuid" } },
  } as const;

  app.patch(
    "/members/:id",
    {
      schema: {
        params: memberParamsSchema,
        querystring: workspaceQuerySchema,
        body: {
          type: "object",
          additionalProperties: false,
          required: ["role"],
          // ADR 0015 item 4: workspace admins may grant `admin` here even
          // though it is never invitable; the rank check lives in the auth
          // layer under the workspace advisory lock.
          properties: { role: workspaceRoleSchema },
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
      const authorized = await requireWorkspaceRole(request, reply, "manager");
      if (!authorized) return reply;
      const { id } = request.params as { id: string };
      const { role } = request.body as { role: WorkspaceRole };
      const result = await auth.updateMembershipRole(
        authorized.workspaceId,
        id,
        role,
        authorized.membership.role,
      );
      if (result === "not-found") return reply.code(404).send();
      if (result === "forbidden") return reply.code(403).send();
      if (result === "last-admin") return reply.code(409).send();
      return reply.code(204).send();
    },
  );

  app.delete(
    "/members/:id",
    {
      schema: {
        params: memberParamsSchema,
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
      const authorized = await requireWorkspaceRole(request, reply, "manager");
      if (!authorized) return reply;
      const { id } = request.params as { id: string };
      const result = await auth.removeMembership(
        authorized.workspaceId,
        id,
        authorized.membership.role,
      );
      if (result === "not-found") return reply.code(404).send();
      if (result === "forbidden") return reply.code(403).send();
      if (result === "last-admin") return reply.code(409).send();
      return reply.code(204).send();
    },
  );

  app.post(
    "/invitations",
    {
      schema: {
        querystring: workspaceQuerySchema,
        body: {
          type: "object",
          additionalProperties: false,
          required: ["email", "role"],
          properties: {
            email: { type: "string", format: "email" },
            // `admin` is not invitable through workspace invitation flows.
            role: { type: "string", enum: ["viewer", "agent", "manager"] },
          },
        },
        response: {
          201: {
            type: "object",
            additionalProperties: false,
            required: ["id", "token", "expiresAt"],
            properties: {
              id: { type: "string", format: "uuid" },
              token: { type: "string" },
              expiresAt: { type: "string", format: "date-time" },
            },
          },
          401: { type: "null" },
          403: { type: "null" },
          409: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply, "manager");
      if (!authorized) return reply;
      const { email, role } = request.body as {
        email: string;
        role: WorkspaceRole;
      };
      // ADR 0015: a grant must stay strictly below the inviter's rank —
      // managers invite agent/viewer only; admins invite up to manager.
      if (ROLE_RANK[role] >= ROLE_RANK[authorized.membership.role]) {
        return reply.code(403).send();
      }
      const result = await auth.createInvitation({
        workspaceId: authorized.workspaceId,
        email,
        role,
        invitedBy: authorized.session.userId,
      });
      if (result === "already-member" || result === "conflict") {
        return reply.code(409).send();
      }
      return reply.code(201).send(result);
    },
  );

  app.get(
    "/invitations",
    {
      schema: {
        querystring: workspaceQuerySchema,
        response: {
          200: { type: "array", items: invitationSchema },
          401: { type: "null" },
          403: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply, "manager");
      if (!authorized) return reply;
      return auth.listInvitations(authorized.workspaceId);
    },
  );

  app.delete(
    "/invitations/:id",
    {
      schema: {
        querystring: workspaceQuerySchema,
        params: {
          type: "object",
          additionalProperties: false,
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
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
      if (!authorized) return reply;
      const { id } = request.params as { id: string };
      const result = await auth.revokeInvitation(authorized.workspaceId, id);
      if (result === "not-found") return reply.code(404).send();
      return reply.code(204).send();
    },
  );

  app.get(
    "/invitations/:token",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        params: {
          type: "object",
          additionalProperties: false,
          required: ["token"],
          properties: { token: { type: "string", minLength: 1 } },
        },
        response: {
          200: {
            type: "object",
            additionalProperties: false,
            required: [
              "email",
              "workspaceId",
              "workspaceName",
              "role",
              "expiresAt",
            ],
            properties: {
              email: { type: "string" },
              workspaceId: { type: "string", format: "uuid" },
              workspaceName: { type: "string" },
              role: workspaceRoleSchema,
              expiresAt: { type: "string", format: "date-time" },
            },
          },
          404: { type: "null" },
          410: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const { token } = request.params as { token: string };
      const result = await auth.previewInvitation(token);
      if (result === "invalid") return reply.code(404).send();
      if (result === "unusable") return reply.code(410).send();
      return result;
    },
  );

  app.post(
    "/invitations/:token/accept",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      schema: {
        params: {
          type: "object",
          additionalProperties: false,
          required: ["token"],
          properties: { token: { type: "string", minLength: 1 } },
        },
        body: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string", minLength: 1 },
            password: { type: "string", minLength: 8 },
          },
        },
        response: {
          200: {
            type: "object",
            additionalProperties: false,
            required: ["status"],
            properties: {
              status: { type: "string", enum: ["attached", "already-member"] },
            },
          },
          201: {
            type: "object",
            additionalProperties: false,
            required: ["token"],
            properties: { token: { type: "string" } },
          },
          400: { type: "null" },
          403: { type: "null" },
          404: { type: "null" },
          409: { type: "null" },
          410: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const { token } = request.params as { token: string };
      const body = (request.body ?? {}) as {
        name?: string;
        password?: string;
      };
      const bearer = extractBearerToken(request);
      const session = bearer ? await auth.verifySession(bearer) : null;
      const input = session
        ? { userId: session.userId }
        : body.name && body.password
          ? { name: body.name, password: body.password }
          : null;
      if (!input) return reply.code(400).send();
      const result = await auth.acceptInvitation(token, input);
      if (result === "invalid") return reply.code(404).send();
      if (result === "unusable") return reply.code(410).send();
      if (result === "email-mismatch") return reply.code(403).send();
      if (result === "user-exists") return reply.code(409).send();
      if (result.kind === "created") {
        const session = await auth.login(result.email, body.password ?? "");
        if (!session) throw new Error("invitation login failed");
        return reply.code(201).send({ token: session.token });
      }
      return reply.code(200).send({ status: result.kind });
    },
  );
}
