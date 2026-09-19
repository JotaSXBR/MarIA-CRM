import type { FastifyInstance } from "fastify";
import {
  workspaceQuerySchema,
  type AuthGuards,
  type RouteDatabase,
} from "./shared.ts";

const conversationRef = {
  type: "object",
  additionalProperties: false,
  required: ["id", "contactName", "providerThreadId"],
  properties: {
    id: { type: "string", format: "uuid" },
    contactName: { type: ["string", "null"] },
    providerThreadId: { type: "string" },
  },
} as const;

/** One read model for the operator work center — five actionable groups
 * assembled workspace-scoped by `listWorkQueue`. Viewer-readable: this is a
 * queue, not a mutation surface. */
export function registerWorkQueueRoutes(
  app: FastifyInstance,
  deps: {
    database: RouteDatabase;
    requireWorkspaceRole: AuthGuards["requireWorkspaceRole"];
  },
) {
  const { database, requireWorkspaceRole } = deps;

  app.get(
    "/work-queue",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        querystring: workspaceQuerySchema,
        response: {
          200: {
            type: "object",
            additionalProperties: false,
            required: [
              "unassigned",
              "awaitingReply",
              "sendIssues",
              "overdueTasks",
              "idleDeals",
            ],
            properties: {
              unassigned: {
                type: "array",
                items: {
                  ...conversationRef,
                  required: [...conversationRef.required, "updatedAt"],
                  properties: {
                    ...conversationRef.properties,
                    updatedAt: { type: "string", format: "date-time" },
                  },
                },
              },
              awaitingReply: {
                type: "array",
                items: {
                  ...conversationRef,
                  required: [...conversationRef.required, "lastInboundAt"],
                  properties: {
                    ...conversationRef.properties,
                    lastInboundAt: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
              },
              sendIssues: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "id",
                    "conversationId",
                    "contactName",
                    "status",
                    "createdAt",
                  ],
                  properties: {
                    id: { type: "string", format: "uuid" },
                    conversationId: { type: "string", format: "uuid" },
                    contactName: { type: ["string", "null"] },
                    status: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
              },
              overdueTasks: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "id",
                    "title",
                    "dueAt",
                    "assigneeName",
                    "contactId",
                    "contactName",
                    "dealId",
                  ],
                  properties: {
                    id: { type: "string", format: "uuid" },
                    title: { type: "string" },
                    dueAt: { type: "string", format: "date-time" },
                    assigneeName: { type: ["string", "null"] },
                    contactId: { type: ["string", "null"], format: "uuid" },
                    contactName: { type: ["string", "null"] },
                    dealId: { type: ["string", "null"], format: "uuid" },
                  },
                },
              },
              idleDeals: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "id",
                    "title",
                    "stageName",
                    "pipelineName",
                    "valueCents",
                  ],
                  properties: {
                    id: { type: "string", format: "uuid" },
                    title: { type: "string" },
                    stageName: { type: "string" },
                    pipelineName: { type: "string" },
                    valueCents: { type: ["integer", "null"] },
                  },
                },
              },
            },
          },
          401: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply);
      if (!authorized) return;
      return database.listWorkQueue(authorized.workspaceId);
    },
  );
}
