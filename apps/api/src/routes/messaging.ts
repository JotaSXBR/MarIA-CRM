import { PassThrough } from "node:stream";
import type { FastifyInstance } from "fastify";
import type { Database } from "@maria/database";
import type { MessagingProvider } from "@maria/messaging";
import type { Dispatcher } from "../dispatch.ts";
import type { MediaStore } from "../media-store.ts";
import {
  idParamsSchema,
  workspaceQuerySchema,
  type AuthGuards,
  type RouteDatabase,
} from "./shared.ts";

type StoredMessage = NonNullable<Awaited<ReturnType<Database["getMessage"]>>>;

/** Decoded attachment cap (~24 MiB covers WhatsApp media limits for v1). */
const MAX_ATTACHMENT_BYTES = 24 * 1024 * 1024;
/** Base64 inflates ~33%; allow headroom over the decoded cap. */
const MESSAGE_BODY_LIMIT = 40 * 1024 * 1024;

function attachmentContentType(mimetype: string): string {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("audio/")) return "audio";
  return "document";
}

function mediaExtension(
  filename: string | undefined,
  mimetype: string,
): string | undefined {
  const fromName = filename?.split(".").pop();
  if (fromName && /^[a-z0-9]{1,10}$/i.test(fromName)) return fromName;
  const subtype = mimetype.split("/")[1]?.split(";")[0];
  return subtype && /^[a-z0-9]{1,10}$/i.test(subtype) ? subtype : undefined;
}

function escapeVcard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r?\n/g, "\\n");
}

function buildVcard(contact: {
  fullName: string;
  phoneNumber: string;
  organization?: string;
}): string {
  const digits = contact.phoneNumber.replace(/\D/g, "");
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVcard(contact.fullName)}`,
    ...(contact.organization
      ? [`ORG:${escapeVcard(contact.organization)};`]
      : []),
    `TEL;type=CELL;type=VOICE;waid=${digits}:${contact.phoneNumber}`,
    "END:VCARD",
  ].join("\n");
}

function safeDownloadName(filename: string | null): string {
  return (filename ?? "attachment").replace(/[^\w. -]/g, "_");
}

export function registerMessagingRoutes(
  app: FastifyInstance,
  deps: {
    database: RouteDatabase;
    waha: MessagingProvider;
    mediaStore: MediaStore;
    dispatcher: Dispatcher;
    requireWorkspaceRole: AuthGuards["requireWorkspaceRole"];
  },
) {
  const { database, waha, mediaStore, dispatcher, requireWorkspaceRole } = deps;
  const channelInstanceSchema = {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "workspaceId",
      "provider",
      "providerInstanceId",
      "webhookSecret",
      "isActive",
      "createdAt",
      "updatedAt",
    ],
    properties: {
      id: { type: "string", format: "uuid" },
      workspaceId: { type: "string", format: "uuid" },
      provider: { type: "string" },
      providerInstanceId: { type: ["string", "null"] },
      webhookSecret: { type: "string" },
      isActive: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  } as const;

  const conversationSchema = {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "workspaceId",
      "channelInstanceId",
      "contactId",
      "contactName",
      "providerThreadId",
      "epoch",
      "createdAt",
      "updatedAt",
    ],
    properties: {
      id: { type: "string", format: "uuid" },
      workspaceId: { type: "string", format: "uuid" },
      channelInstanceId: { type: "string", format: "uuid" },
      contactId: { type: ["string", "null"] },
      contactName: { type: ["string", "null"] },
      providerThreadId: { type: "string" },
      epoch: { type: "integer" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  } as const;

  const messageSchema = {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "workspaceId",
      "conversationId",
      "providerMessageId",
      "direction",
      "status",
      "contentType",
      "body",
      "hasMedia",
      "mediaMime",
      "mediaFilename",
      "createdAt",
    ],
    properties: {
      id: { type: "string", format: "uuid" },
      workspaceId: { type: "string", format: "uuid" },
      conversationId: { type: "string", format: "uuid" },
      providerMessageId: { type: ["string", "null"] },
      direction: { type: "string" },
      status: { type: "string" },
      contentType: { type: "string" },
      body: { type: ["string", "null"] },
      hasMedia: { type: "boolean" },
      mediaMime: { type: ["string", "null"] },
      mediaFilename: { type: ["string", "null"] },
      createdAt: { type: "string", format: "date-time" },
    },
  } as const;

  // Responses expose `hasMedia` instead of the internal storage key; bytes
  // are served by GET /messages/:id/media under workspace auth.
  const messageJson = (message: StoredMessage) => ({
    id: message.id,
    workspaceId: message.workspaceId,
    conversationId: message.conversationId,
    providerMessageId: message.providerMessageId,
    direction: message.direction,
    status: message.status,
    contentType: message.contentType,
    body: message.body,
    hasMedia: message.mediaKey !== null,
    mediaMime: message.mediaMime,
    mediaFilename: message.mediaFilename,
    createdAt: message.createdAt,
  });

  app.get(
    "/channel-instances",
    {
      config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
      schema: {
        querystring: workspaceQuerySchema,
        response: {
          200: { type: "array", items: channelInstanceSchema },
          401: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply);
      if (!authorized) return;
      return database.listChannelInstances(authorized.workspaceId);
    },
  );

  app.post(
    "/channel-instances",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      schema: {
        querystring: workspaceQuerySchema,
        body: {
          type: "object",
          additionalProperties: false,
          required: ["provider", "webhookSecret"],
          properties: {
            provider: { type: "string", minLength: 1 },
            providerInstanceId: { type: ["string", "null"] },
            webhookSecret: { type: "string", minLength: 1 },
          },
        },
        response: {
          201: channelInstanceSchema,
          401: { type: "null" },
          403: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply, "manager");
      if (!authorized) return;
      const input = request.body as {
        provider: string;
        providerInstanceId?: string | null;
        webhookSecret: string;
      };
      const instance = await database.createChannelInstance(
        authorized.workspaceId,
        input,
      );
      if (!instance) return reply.code(404).send();
      return reply.code(201).send(instance);
    },
  );

  app.get(
    "/conversations",
    {
      config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
      schema: {
        querystring: workspaceQuerySchema,
        response: {
          200: { type: "array", items: conversationSchema },
          401: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply);
      if (!authorized) return;
      // Lazy dispatch maintenance: expired leases become `unknown` so the
      // list reflects blocked sends, and orphaned `pending` intents (e.g.
      // after a crash between commit and claim) are resumed safely — a
      // pending intent was never sent to the provider (ADR 0010 §2,§4).
      await database.reapExpiredDispatches(authorized.workspaceId);
      void dispatcher.dispatchPending(authorized.workspaceId);
      return database.listConversations(authorized.workspaceId);
    },
  );

  app.post(
    "/conversations/:id/messages",
    {
      // Attachment payloads arrive base64-encoded inside JSON.
      bodyLimit: MESSAGE_BODY_LIMIT,
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        body: {
          type: "object",
          additionalProperties: false,
          anyOf: [
            { required: ["body"] },
            { required: ["attachment"] },
            { required: ["contact"] },
          ],
          properties: {
            body: { type: "string", maxLength: 4096 },
            attachment: {
              type: "object",
              additionalProperties: false,
              required: ["data", "mimetype"],
              properties: {
                data: { type: "string" },
                mimetype: {
                  type: "string",
                  minLength: 3,
                  maxLength: 255,
                },
                filename: { type: "string", maxLength: 255 },
              },
            },
            contact: {
              type: "object",
              additionalProperties: false,
              required: ["fullName", "phoneNumber"],
              properties: {
                fullName: { type: "string", minLength: 1, maxLength: 200 },
                phoneNumber: {
                  type: "string",
                  minLength: 1,
                  maxLength: 40,
                },
                organization: { type: "string", maxLength: 200 },
              },
            },
          },
        },
        response: {
          201: messageSchema,
          401: { type: "null" },
          403: { type: "null" },
          404: { type: "null" },
          413: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply, "agent");
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const { body, attachment, contact } = request.body as {
        body?: string;
        attachment?: {
          data: string;
          mimetype: string;
          filename?: string;
        };
        contact?: {
          fullName: string;
          phoneNumber: string;
          organization?: string;
        };
      };
      // Persist attachment bytes before committing the intent — the ledger
      // stores the storage key, and dispatch reads bytes off the request
      // path so `pending` survives restarts (ADR 0010).
      let contentType = "text";
      let media: {
        key: string;
        mime: string;
        filename?: string | null;
      } | null = null;
      let messageBody = body ?? null;
      if (attachment) {
        const bytes = Buffer.from(attachment.data, "base64");
        if (bytes.length === 0 || bytes.length > MAX_ATTACHMENT_BYTES) {
          return reply.code(413).send();
        }
        contentType = attachmentContentType(attachment.mimetype);
        const key = await mediaStore.put(
          authorized.workspaceId,
          bytes,
          mediaExtension(attachment.filename, attachment.mimetype),
        );
        media = {
          key,
          mime: attachment.mimetype,
          filename: attachment.filename ?? null,
        };
      } else if (contact) {
        // Contact cards travel as stored vCard 3.0 payloads — the dispatcher
        // hands them to sendContactVcard verbatim.
        const key = await mediaStore.put(
          authorized.workspaceId,
          Buffer.from(buildVcard(contact), "utf8"),
          "vcf",
        );
        media = {
          key,
          mime: "text/vcard",
          filename: `${contact.fullName}.vcf`,
        };
        contentType = "contact";
        messageBody = body ?? `${contact.fullName} · ${contact.phoneNumber}`;
      }
      // Commit message + intent in one transaction, then hand the send to
      // the dispatcher: claim → presence choreography → send → settle runs
      // off the request path (ADR 0010/0013), so the response carries the
      // `pending` message and status advances asynchronously.
      const created = await database.createOutboundIntent(
        authorized.workspaceId,
        { conversationId: id, body: messageBody, contentType, media },
      );
      if (created.kind === "missing") return reply.code(404).send();
      void dispatcher.dispatchPending(authorized.workspaceId);
      const message = await database.getMessage(
        authorized.workspaceId,
        created.messageId,
      );
      if (!message) return reply.code(404).send();
      return reply.code(201).send(messageJson(message));
    },
  );

  // Attachment bytes are served workspace-scoped — the internal storage key
  // is never exposed to clients.
  app.get(
    "/messages/:id/media",
    {
      config: { rateLimit: { max: 120, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        response: {
          401: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply);
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const message = await database.getMessage(authorized.workspaceId, id);
      if (!message?.mediaKey) return reply.code(404).send();
      const data = await mediaStore.read(
        authorized.workspaceId,
        message.mediaKey,
      );
      if (!data) return reply.code(404).send();
      return reply
        .type(message.mediaMime ?? "application/octet-stream")
        .header(
          "content-disposition",
          `inline; filename="${safeDownloadName(message.mediaFilename)}"`,
        )
        .send(Buffer.from(data));
    },
  );

  // ADR 0010: retrying a failed/cancelled send is a NEW outbound message
  // with its own effect identity — the failed bubble stays as history.
  // `unknown` can never be resent blindly (the provider may have accepted
  // it); it must be resolved first via /messages/:id/resolve.
  app.post(
    "/messages/:id/retry",
    {
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        response: {
          201: messageSchema,
          401: { type: "null" },
          403: { type: "null" },
          404: { type: "null" },
          409: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply, "agent");
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const original = await database.getMessage(authorized.workspaceId, id);
      if (!original) return reply.code(404).send();
      if (
        original.direction !== "outbound" ||
        (!original.body && !original.mediaKey)
      ) {
        return reply.code(409).send();
      }
      if (!["failed", "cancelled"].includes(original.status)) {
        return reply.code(409).send();
      }
      // The retry reuses the same stored attachment — the media key is
      // immutable, so both messages can safely share the bytes.
      const created = await database.createOutboundIntent(
        authorized.workspaceId,
        {
          conversationId: original.conversationId,
          body: original.body,
          contentType: original.contentType,
          media: original.mediaKey
            ? {
                key: original.mediaKey,
                mime: original.mediaMime ?? "application/octet-stream",
                filename: original.mediaFilename,
              }
            : null,
        },
      );
      if (created.kind === "missing") return reply.code(404).send();
      void dispatcher.dispatchPending(authorized.workspaceId);
      const message = await database.getMessage(
        authorized.workspaceId,
        created.messageId,
      );
      if (!message) return reply.code(404).send();
      return reply.code(201).send(messageJson(message));
    },
  );

  // Operator resolution for `unknown` sends: confirm the provider outcome
  // — `sent` (it arrived on the device) or `not_sent` (cancelled, freeing
  // the message for retry). Only `unknown` outbound messages are eligible.
  app.post(
    "/messages/:id/resolve",
    {
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        body: {
          type: "object",
          additionalProperties: false,
          required: ["resolution"],
          properties: {
            resolution: { type: "string", enum: ["sent", "not_sent"] },
          },
        },
        response: {
          200: messageSchema,
          401: { type: "null" },
          403: { type: "null" },
          404: { type: "null" },
          409: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply, "agent");
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const { resolution } = request.body as {
        resolution: "sent" | "not_sent";
      };
      const result = await database.resolveUnknownMessage(
        authorized.workspaceId,
        { messageId: id, resolution },
      );
      if (result.kind === "missing") return reply.code(404).send();
      if (result.kind === "invalidState") return reply.code(409).send();
      const message = await database.getMessage(authorized.workspaceId, id);
      if (!message) return reply.code(404).send();
      return reply.code(200).send(messageJson(message));
    },
  );

  app.get(
    "/conversations/:id/messages",
    {
      config: { rateLimit: { max: 50, timeWindow: "1 minute" } },
      schema: {
        params: idParamsSchema,
        querystring: workspaceQuerySchema,
        response: {
          200: { type: "array", items: messageSchema },
          401: { type: "null" },
          404: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const authorized = await requireWorkspaceRole(request, reply);
      if (!authorized) return;
      const { id } = request.params as { id: string };
      const conversation = await database.getConversation(
        authorized.workspaceId,
        id,
      );
      if (!conversation) return reply.code(404).send();
      const messages = await database.listMessages(authorized.workspaceId, id);
      return messages.map(messageJson);
    },
  );

  app.post(
    "/webhooks/waha/:workspaceId/:channelInstanceId",
    {
      config: {
        rateLimit: {
          max: 120,
          timeWindow: "1 minute",
        },
      },
      // Buffer the exact bytes here — and only here — because the HMAC
      // signature covers the raw payload. Scoped to this route so other
      // endpoints (e.g. 40MB message uploads) are not double-buffered.
      preParsing: async (request, _reply, payload) => {
        const chunks: Buffer[] = [];
        for await (const chunk of payload) {
          chunks.push(
            Buffer.isBuffer(chunk)
              ? chunk
              : Buffer.from(chunk as string, "utf8"),
          );
        }
        const raw = Buffer.concat(chunks);
        (request as unknown as { rawBody?: Buffer }).rawBody = raw;
        const pass = new PassThrough();
        pass.end(raw);
        return pass;
      },
      schema: {
        params: {
          type: "object",
          additionalProperties: false,
          required: ["workspaceId", "channelInstanceId"],
          properties: {
            workspaceId: { type: "string", format: "uuid" },
            channelInstanceId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            type: "object",
            additionalProperties: false,
            required: ["received"],
            properties: { received: { type: "boolean" } },
          },
          400: { type: "null" },
          401: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const { workspaceId, channelInstanceId } = request.params as {
        workspaceId: string;
        channelInstanceId: string;
      };
      const instance = await database.getChannelInstance(
        workspaceId,
        channelInstanceId,
      );
      if (!instance) {
        return reply.code(401).send();
      }
      const rawBody = (request as unknown as { rawBody?: Buffer }).rawBody;
      if (!rawBody) {
        return reply.code(401).send();
      }
      const signature = String(request.headers["x-webhook-hmac"] ?? "").trim();
      if (
        !waha.verifyWebhook({
          rawBody,
          signatureHeader: signature,
          secret: instance.webhookSecret,
        })
      ) {
        return reply.code(401).send();
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawBody.toString("utf8"));
      } catch {
        return reply.code(400).send();
      }
      // A WAHA webhook URL receives events for every session it is
      // subscribed to; drop events that do not belong to this channel
      // instance's WAHA session.
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "session" in parsed &&
        typeof parsed.session === "string" &&
        instance.providerInstanceId &&
        parsed.session !== instance.providerInstanceId
      ) {
        return reply.code(200).send({ received: true });
      }
      const event = waha.normalizeEvent(parsed);
      if (event.kind === "message") {
        // LID senders are privacy-masked: when the payload carried no real
        // number, ask the provider's LID directory (`GET /api/{s}/lids/{l}`).
        // Best-effort — failure leaves the conversation without a contact
        // phone instead of persisting the LID digits as a fake number.
        let senderPhone = event.sender.phone ?? null;
        if (
          !senderPhone &&
          event.sender.lid &&
          waha.resolveLid &&
          instance.providerInstanceId
        ) {
          const resolved = await waha
            .resolveLid(instance.providerInstanceId, event.sender.lid)
            .catch(() => null);
          senderPhone = resolved?.split("@")[0] ?? null;
        }
        // Media attachments are fetched from the provider and stored under
        // our own keys — the message keeps the caption and the storage
        // reference, never the provider URL. Download is best-effort: the
        // message is still recorded if bytes are unavailable.
        let media: {
          key: string;
          mime: string;
          filename?: string | null;
        } | null = null;
        if (event.content.type !== "text" && waha.downloadMedia) {
          const downloaded = await waha
            .downloadMedia(event.content.media.url)
            .catch(() => null);
          if (downloaded && downloaded.data.length <= MAX_ATTACHMENT_BYTES) {
            const key = await mediaStore.put(
              workspaceId,
              downloaded.data,
              mediaExtension(
                event.content.media.filename,
                downloaded.mimetype ??
                  event.content.media.mimetype ??
                  "application/octet-stream",
              ),
            );
            media = {
              key,
              mime:
                downloaded.mimetype ??
                event.content.media.mimetype ??
                "application/octet-stream",
              filename: event.content.media.filename ?? null,
            };
          }
        }
        const result = await database.receiveInboundMessage(workspaceId, {
          channelInstanceId,
          providerThreadId: event.providerThreadId,
          providerMessageId: event.providerMessageId,
          providerEventId: event.providerEventId,
          providerEventKind: event.providerEventKind,
          senderPhone,
          contentType: event.content.type,
          body:
            event.content.type === "text"
              ? event.content.text
              : event.content.caption,
          media,
          rawPayload: parsed,
          signatureVerified: true,
        });
        return reply.code(200).send({
          received: result.kind === "received",
        });
      }
      if (event.kind === "status") {
        const result = await database.recordDeliveryStatus(workspaceId, {
          channelInstanceId,
          providerMessageId: event.providerMessageId,
          providerEventId: event.providerEventId,
          providerEventKind: event.providerEventKind,
          status: event.status,
          rawPayload: parsed,
          signatureVerified: true,
        });
        return reply.code(200).send({
          received: result.kind === "applied",
        });
      }
      return reply.code(200).send({ received: true });
    },
  );
}
