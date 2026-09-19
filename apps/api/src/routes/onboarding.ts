import type { FastifyInstance } from "fastify";
import type { AuthPort } from "@maria/auth";
import type { AuthGuards } from "./shared.ts";
import { workspaceQuerySchema } from "./shared.ts";

const stepStatusSchema = {
  type: "string",
  enum: ["pending", "done", "skipped"],
} as const;

const onboardingResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["workspaceName", "onboardedAt", "steps"],
  properties: {
    workspaceName: { type: "string" },
    onboardedAt: { type: ["string", "null"], format: "date-time" },
    steps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "status"],
        properties: {
          id: {
            type: "string",
            enum: ["basics", "channel", "team", "review"],
          },
          status: stepStatusSchema,
          data: { type: "object" },
        },
      },
    },
  },
} as const;

/** Workspace onboarding wizard (ADR 0015 item 6): any member reads progress;
 * `manager`+ records steps and completes the wizard. */
export function registerOnboardingRoutes(
  app: FastifyInstance,
  deps: {
    auth: AuthPort;
    requireWorkspaceRole: AuthGuards["requireWorkspaceRole"];
  },
) {
  const { auth, requireWorkspaceRole } = deps;

  app.get(
    "/onboarding",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        querystring: workspaceQuerySchema,
        response: {
          200: onboardingResponseSchema,
          401: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply, "viewer");
      if (!authorized) return;
      const result = await auth.getOnboarding(authorized.workspaceId);
      if (!result) return reply.code(404).send();
      return result;
    },
  );

  app.patch(
    "/onboarding/steps/:step",
    {
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
      schema: {
        params: {
          type: "object",
          additionalProperties: false,
          required: ["step"],
          properties: {
            step: { type: "string", enum: ["basics", "channel", "team"] },
          },
        },
        querystring: workspaceQuerySchema,
        body: {
          type: "object",
          additionalProperties: false,
          required: ["status"],
          properties: {
            status: { type: "string", enum: ["done", "skipped"] },
            data: { type: "object" },
          },
        },
        response: {
          200: onboardingResponseSchema,
          400: { type: "null" },
          401: { type: "null" },
          403: { type: "null" },
          404: { type: "null" },
          409: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply, "manager");
      if (!authorized) return;
      const { step } = request.params as {
        step: "basics" | "channel" | "team";
      };
      const body = request.body as {
        status: "done" | "skipped";
        data?: Record<string, unknown>;
      };
      const result = await auth.updateOnboardingStep(
        authorized.workspaceId,
        step,
        body,
      );
      if (result === "not-found") return reply.code(404).send();
      if (result === "invalid-step") return reply.code(400).send();
      if (result === "already-onboarded") return reply.code(409).send();
      return auth.getOnboarding(authorized.workspaceId);
    },
  );

  app.post(
    "/onboarding/complete",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      schema: {
        querystring: workspaceQuerySchema,
        response: {
          200: {
            type: "object",
            additionalProperties: false,
            required: ["onboardedAt"],
            properties: {
              onboardedAt: { type: "string", format: "date-time" },
            },
          },
          401: { type: "null" },
          403: { type: "null" },
          404: { type: "null" },
          409: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply, "manager");
      if (!authorized) return;
      const result = await auth.completeOnboarding(authorized.workspaceId);
      if (result === "not-found") return reply.code(404).send();
      if (result === "incomplete") return reply.code(409).send();
      return result;
    },
  );
}
