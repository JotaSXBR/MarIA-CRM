import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import { createWahaProvider } from "@maria/channel-waha";
import type { MessagingProvider } from "@maria/messaging";
import type { AuthPort } from "@maria/auth";
import { createDispatcher } from "./dispatch.ts";
import { createFsMediaStore, type MediaStore } from "./media-store.ts";
import { createAuthGuards, type RouteDatabase } from "./routes/shared.ts";
import { registerSessionRoutes } from "./routes/session.ts";
import { registerAdminRoutes } from "./routes/admin.ts";
import { registerContactRoutes } from "./routes/contacts.ts";
import { registerCompanyRoutes } from "./routes/companies.ts";
import { registerPipelineRoutes } from "./routes/pipelines.ts";
import { registerMessagingRoutes } from "./routes/messaging.ts";
import { registerAttributeRoutes } from "./routes/attributes.ts";
import { registerSearchRoutes } from "./routes/search.ts";
import { registerTagRoutes } from "./routes/tags.ts";

export type AppDependencies = {
  media?: MediaStore;
  /** Business persistence surface; lifecycle (`close`) and internal scoping
   * helpers (`withWorkspace`/`withUser`) belong to the composition root. */
  database: RouteDatabase;
  auth: AuthPort;
  /** Injectable provider registry; defaults to env-configured WAHA. */
  messaging?: { waha?: MessagingProvider };
};

export function buildApp(dependencies?: AppDependencies) {
  const app = Fastify({ logger: true });
  const waha =
    dependencies?.messaging?.waha ??
    createWahaProvider({
      ...(process.env.WAHA_BASE_URL
        ? { baseUrl: process.env.WAHA_BASE_URL }
        : {}),
      ...(process.env.WAHA_API_KEY ? { apiKey: process.env.WAHA_API_KEY } : {}),
    });

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
    const mediaStore =
      dependencies.media ??
      createFsMediaStore(process.env.MEDIA_DIR ?? "data/media");
    const dispatcher = createDispatcher({
      database,
      provider: waha,
      media: mediaStore,
      onError: (error) => app.log.error(error),
    });
    const guards = createAuthGuards(auth);
    const scoped = { database, ...guards };

    registerSessionRoutes(app, { auth });
    registerAdminRoutes(app, {
      auth,
      database,
      requireAdmin: guards.requireAdmin,
    });
    registerContactRoutes(app, scoped);
    registerCompanyRoutes(app, scoped);
    registerPipelineRoutes(app, scoped);
    registerTagRoutes(app, scoped);
    registerAttributeRoutes(app, scoped);
    registerSearchRoutes(app, scoped);
    registerMessagingRoutes(app, {
      ...scoped,
      waha,
      mediaStore,
      dispatcher,
    });
  }

  return app;
}
