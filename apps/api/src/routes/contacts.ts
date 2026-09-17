import type { FastifyInstance } from "fastify";
import {
  dealSchema,
  idParamsSchema,
  workspaceQuerySchema,
  type AuthGuards,
  type RouteDatabase,
} from "./shared.ts";

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

export function registerContactRoutes(
  app: FastifyInstance,
  deps: {
    database: RouteDatabase;
    authorizeWorkspaceRequest: AuthGuards["authorizeWorkspaceRequest"];
  },
) {
  const { database, authorizeWorkspaceRequest } = deps;
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
      const input = request.body as {
        name: string;
        email?: string | null;
        phone?: string | null;
      };
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
      const input = request.body as {
        name?: string;
        email?: string | null;
        phone?: string | null;
      };
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
      const deleted = await database.deleteContact(authorized.workspaceId, id);
      if (!deleted) return reply.code(404).send();
      return reply.code(204).send();
    },
  );
  const contactDealSchema = {
    ...dealSchema,
    required: [...dealSchema.required, "stageName", "pipelineName"],
    properties: {
      ...dealSchema.properties,
      stageName: { type: "string" },
      pipelineName: { type: "string" },
    },
  } as const;

  const entityLinkProperties = {
    contactId: { type: ["string", "null"], format: "uuid" },
    companyId: { type: ["string", "null"], format: "uuid" },
    dealId: { type: ["string", "null"], format: "uuid" },
  } as const;

  const noteSchema = {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "contactId",
      "companyId",
      "dealId",
      "authorId",
      "authorName",
      "body",
      "createdAt",
    ],
    properties: {
      id: { type: "string", format: "uuid" },
      ...entityLinkProperties,
      authorId: { type: ["string", "null"], format: "uuid" },
      authorName: { type: ["string", "null"] },
      body: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
    },
  } as const;

  const taskSchema = {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "contactId",
      "companyId",
      "dealId",
      "assigneeId",
      "assigneeName",
      "title",
      "dueAt",
      "doneAt",
      "createdAt",
    ],
    properties: {
      id: { type: "string", format: "uuid" },
      ...entityLinkProperties,
      assigneeId: { type: ["string", "null"], format: "uuid" },
      assigneeName: { type: ["string", "null"] },
      title: { type: "string" },
      dueAt: { type: ["string", "null"], format: "date-time" },
      doneAt: { type: ["string", "null"], format: "date-time" },
      createdAt: { type: "string", format: "date-time" },
    },
  } as const;

  app.get(
    "/contacts/:id/deals",
    {
      config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        response: {
          200: { type: "array", items: contactDealSchema },
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
      return database.listDealsForContact(authorized.workspaceId, id);
    },
  );

  app.get(
    "/contacts/:id/notes",
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
      const contact = await database.getContact(authorized.workspaceId, id);
      if (!contact) return reply.code(404).send();
      return database.listNotes(authorized.workspaceId, { contactId: id });
    },
  );

  app.post(
    "/contacts/:id/notes",
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
        contactId: id,
        authorId: authorized.session.userId,
      });
      if (!note) return reply.code(404).send();
      return reply.code(201).send({ ...note, authorName: null });
    },
  );

  app.get(
    "/contacts/:id/tasks",
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
      const contact = await database.getContact(authorized.workspaceId, id);
      if (!contact) return reply.code(404).send();
      return database.listTasks(authorized.workspaceId, { contactId: id });
    },
  );

  app.post(
    "/contacts/:id/tasks",
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
        contactId: id,
        assigneeId: authorized.session.userId,
        dueAt: input.dueAt ? new Date(input.dueAt) : null,
      });
      if (!task) return reply.code(404).send();
      return reply.code(201).send({ ...task, assigneeName: null });
    },
  );

  app.patch(
    "/tasks/:id",
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
            dueAt: { type: ["string", "null"], format: "date-time" },
            done: { type: "boolean" },
          },
        },
        response: {
          200: taskSchema,
          401: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await authorizeWorkspaceRequest(request, reply);
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const input = request.body as {
        title?: string;
        dueAt?: string | null;
        done?: boolean;
      };
      const task = await database.updateTask(authorized.workspaceId, id, {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.dueAt !== undefined
          ? { dueAt: input.dueAt ? new Date(input.dueAt) : null }
          : {}),
        ...(input.done !== undefined ? { done: input.done } : {}),
      });
      if (!task) return reply.code(404).send();
      return { ...task, assigneeName: null };
    },
  );

  app.delete(
    "/tasks/:id",
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
      const deleted = await database.deleteTask(authorized.workspaceId, id);
      if (!deleted) return reply.code(404).send();
      return reply.code(204).send();
    },
  );

  app.delete(
    "/notes/:id",
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
      const deleted = await database.deleteNote(authorized.workspaceId, id);
      if (!deleted) return reply.code(404).send();
      return reply.code(204).send();
    },
  );
}
