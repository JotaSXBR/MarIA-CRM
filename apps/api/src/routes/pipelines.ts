import type { FastifyInstance } from "fastify";
import {
  dealSchema,
  entityDealSchema,
  idParamsSchema,
  noteSchema,
  taskSchema,
  workspaceQuerySchema,
  type AuthGuards,
  type RouteDatabase,
} from "./shared.ts";
import { registerEntityTagRoutes } from "./tags.ts";

export function registerPipelineRoutes(
  app: FastifyInstance,
  deps: {
    database: RouteDatabase;
    authorizeWorkspaceRequest: AuthGuards["authorizeWorkspaceRequest"];
  },
) {
  const { database, authorizeWorkspaceRequest } = deps;
  const pipelineSchema = {
    type: "object",
    additionalProperties: false,
    required: ["id", "name", "position", "createdAt"],
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
      position: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
    },
  } as const;

  const stageSchema = {
    type: "object",
    additionalProperties: false,
    required: ["id", "pipelineId", "name", "position", "createdAt"],
    properties: {
      id: { type: "string", format: "uuid" },
      pipelineId: { type: "string", format: "uuid" },
      name: { type: "string" },
      position: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
    },
  } as const;

  const nameBodySchema = {
    type: "object",
    additionalProperties: false,
    required: ["name"],
    properties: { name: { type: "string", minLength: 1 } },
  } as const;

  app.get(
    "/pipelines",
    {
      config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
      schema: {
        querystring: workspaceQuerySchema,
        response: {
          200: { type: "array", items: pipelineSchema },
          401: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      return database.listPipelines(authorized.workspaceId);
    },
  );

  app.post(
    "/pipelines",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        querystring: workspaceQuerySchema,
        body: nameBodySchema,
        response: { 201: pipelineSchema, 401: { type: "null" } },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const { name } = request.body as { name: string };
      const created = await database.createPipeline(authorized.workspaceId, {
        name,
      });
      return reply.code(201).send(created);
    },
  );

  app.patch(
    "/pipelines/:id",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        body: {
          type: "object",
          additionalProperties: false,
          minProperties: 1,
          properties: { name: { type: "string", minLength: 1 } },
        },
        response: {
          200: pipelineSchema,
          401: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const updated = await database.updatePipeline(
        authorized.workspaceId,
        id,
        request.body as { name?: string },
      );
      if (!updated) return reply.code(404).send();
      return updated;
    },
  );

  app.delete(
    "/pipelines/:id",
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
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      if (authorized.membership.role !== "admin") {
        return reply.code(403).send();
      }
      const { id } = request.params as { id: string };
      const result = await database.deletePipeline(authorized.workspaceId, id);
      if (result === "not-found") return reply.code(404).send();
      if (result === "has-deals") return reply.code(409).send();
      return reply.code(204).send();
    },
  );

  app.get(
    "/pipelines/:id/stages",
    {
      config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        response: {
          200: { type: "array", items: stageSchema },
          401: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const { id } = request.params as { id: string };
      return database.listStages(authorized.workspaceId, id);
    },
  );

  app.post(
    "/pipelines/:id/stages",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        body: nameBodySchema,
        response: {
          201: stageSchema,
          401: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const { name } = request.body as { name: string };
      const created = await database.createStage(authorized.workspaceId, id, {
        name,
      });
      if (!created) return reply.code(404).send();
      return reply.code(201).send(created);
    },
  );

  app.patch(
    "/stages/:id",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        body: {
          type: "object",
          additionalProperties: false,
          minProperties: 1,
          properties: { name: { type: "string", minLength: 1 } },
        },
        response: {
          200: stageSchema,
          401: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const updated = await database.updateStage(
        authorized.workspaceId,
        id,
        request.body as { name?: string },
      );
      if (!updated) return reply.code(404).send();
      return updated;
    },
  );

  app.delete(
    "/stages/:id",
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
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      if (authorized.membership.role !== "admin") {
        return reply.code(403).send();
      }
      const { id } = request.params as { id: string };
      const result = await database.deleteStage(authorized.workspaceId, id);
      if (result === "not-found") return reply.code(404).send();
      if (result === "has-deals") return reply.code(409).send();
      return reply.code(204).send();
    },
  );

  const dealsQuerySchema = {
    type: "object",
    additionalProperties: false,
    required: ["workspaceId", "pipelineId"],
    properties: {
      workspaceId: { type: "string", format: "uuid" },
      pipelineId: { type: "string", format: "uuid" },
    },
  } as const;

  app.get(
    "/deals",
    {
      config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
      schema: {
        querystring: dealsQuerySchema,
        response: {
          200: { type: "array", items: dealSchema },
          401: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const { pipelineId } = request.query as { pipelineId: string };
      return database.listDeals(authorized.workspaceId, pipelineId);
    },
  );

  app.post(
    "/deals",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        querystring: workspaceQuerySchema,
        body: {
          type: "object",
          additionalProperties: false,
          required: ["pipelineId", "stageId", "title"],
          properties: {
            pipelineId: { type: "string", format: "uuid" },
            stageId: { type: "string", format: "uuid" },
            title: { type: "string", minLength: 1 },
            valueCents: { type: ["integer", "null"] },
            contactId: { type: ["string", "null"], format: "uuid" },
            companyId: { type: ["string", "null"], format: "uuid" },
          },
        },
        response: {
          201: dealSchema,
          401: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const created = await database.createDeal(
        authorized.workspaceId,
        request.body as {
          pipelineId: string;
          stageId: string;
          title: string;
          valueCents?: number | null;
          contactId?: string | null;
          companyId?: string | null;
        },
      );
      if (!created) return reply.code(404).send();
      return reply.code(201).send(created);
    },
  );

  app.get(
    "/deals/:id",
    {
      config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        response: {
          200: entityDealSchema,
          401: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const deal = await database.getDeal(authorized.workspaceId, id);
      if (!deal) return reply.code(404).send();
      return deal;
    },
  );

  app.get(
    "/deals/:id/notes",
    {
      config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
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
      const deal = await database.getDeal(authorized.workspaceId, id);
      if (!deal) return reply.code(404).send();
      return database.listNotes(authorized.workspaceId, { dealId: id });
    },
  );

  app.get(
    "/deals/:id/tasks",
    {
      config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        response: {
          200: { type: "array", items: taskSchema },
          401: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const deal = await database.getDeal(authorized.workspaceId, id);
      if (!deal) return reply.code(404).send();
      return database.listTasks(authorized.workspaceId, { dealId: id });
    },
  );

  app.post(
    "/deals/:id/notes",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        body: {
          type: "object",
          additionalProperties: false,
          required: ["body"],
          properties: { body: { type: "string", minLength: 1 } },
        },
        response: {
          201: noteSchema,
          401: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const { body } = request.body as { body: string };
      const note = await database.createNote(authorized.workspaceId, {
        body,
        dealId: id,
        authorId: authorized.session.userId,
      });
      if (!note) return reply.code(404).send();
      return reply.code(201).send({ ...note, authorName: null });
    },
  );

  app.post(
    "/deals/:id/tasks",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        body: {
          type: "object",
          additionalProperties: false,
          required: ["title"],
          properties: {
            title: { type: "string", minLength: 1 },
            dueAt: { type: ["string", "null"], format: "date-time" },
          },
        },
        response: {
          201: taskSchema,
          401: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const input = request.body as { title: string; dueAt?: string | null };
      const task = await database.createTask(authorized.workspaceId, {
        title: input.title,
        dealId: id,
        assigneeId: authorized.session.userId,
        dueAt: input.dueAt ? new Date(input.dueAt) : null,
      });
      if (!task) return reply.code(404).send();
      return reply.code(201).send({ ...task, assigneeName: null });
    },
  );

  registerEntityTagRoutes(
    app,
    { authorizeWorkspaceRequest },
    {
      path: "deals",
      getParent: (workspaceId, id) => database.getDeal(workspaceId, id),
      listTags: (workspaceId, id) => database.listDealTags(workspaceId, id),
      setTags: (workspaceId, id, tagIds) =>
        database.setDealTags(workspaceId, id, tagIds),
    },
  );

  app.patch(
    "/deals/:id",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        body: {
          type: "object",
          additionalProperties: false,
          minProperties: 1,
          properties: {
            title: { type: "string", minLength: 1 },
            valueCents: { type: ["integer", "null"] },
            contactId: { type: ["string", "null"], format: "uuid" },
            companyId: { type: ["string", "null"], format: "uuid" },
          },
        },
        response: {
          200: dealSchema,
          401: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const updated = await database.updateDeal(
        authorized.workspaceId,
        id,
        request.body as {
          title?: string;
          valueCents?: number | null;
          contactId?: string | null;
          companyId?: string | null;
        },
      );
      if (!updated) return reply.code(404).send();
      return updated;
    },
  );

  app.post(
    "/deals/:id/move",
    {
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        body: {
          type: "object",
          additionalProperties: false,
          required: ["stageId"],
          properties: {
            stageId: { type: "string", format: "uuid" },
            prevDealId: { type: ["string", "null"], format: "uuid" },
            nextDealId: { type: ["string", "null"], format: "uuid" },
          },
        },
        response: {
          200: dealSchema,
          401: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const { stageId, prevDealId, nextDealId } = request.body as {
        stageId: string;
        prevDealId?: string | null;
        nextDealId?: string | null;
      };
      const moved = await database.moveDeal(authorized.workspaceId, id, {
        stageId,
        prevDealId: prevDealId ?? null,
        nextDealId: nextDealId ?? null,
      });
      if (!moved) return reply.code(404).send();
      return moved;
    },
  );

  app.delete(
    "/deals/:id",
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
      const deleted = await database.deleteDeal(authorized.workspaceId, id);
      if (!deleted) return reply.code(404).send();
      return reply.code(204).send();
    },
  );
}
