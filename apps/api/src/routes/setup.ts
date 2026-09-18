import { createHash, timingSafeEqual } from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { AuthPort } from "@maria/auth";

/** First-run bootstrap configuration (ADR 0015). When `tokenRequired` the
 * `token` is the boot-generated single-use secret logged at startup; it is
 * consumed by the first successful setup so a replay cannot reuse it. */
export type SetupConfig = {
  tokenRequired: boolean;
  token?: string | undefined;
};

function tokenMatches(provided: string | undefined, expected: string) {
  if (!provided) return false;
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export function registerSetupRoutes(
  app: FastifyInstance,
  deps: { auth: AuthPort; setup: SetupConfig },
) {
  const { auth, setup } = deps;
  let consumed = false;

  app.get(
    "/setup/status",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        response: {
          200: {
            type: "object",
            additionalProperties: false,
            required: ["setupRequired", "tokenRequired"],
            properties: {
              setupRequired: { type: "boolean" },
              tokenRequired: { type: "boolean" },
            },
          },
        },
      },
    },
    async () => ({
      setupRequired: await auth.setupRequired(),
      tokenRequired: setup.tokenRequired,
    }),
  );

  app.post(
    "/setup",
    {
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["email", "name", "password", "workspaceName"],
          properties: {
            email: { type: "string", format: "email" },
            name: { type: "string", minLength: 1 },
            password: { type: "string", minLength: 8 },
            workspaceName: { type: "string", minLength: 1 },
            token: { type: "string" },
          },
        },
        response: {
          201: {
            type: "object",
            additionalProperties: false,
            required: ["token"],
            properties: { token: { type: "string" } },
          },
          403: { type: "null" },
          409: { type: "null" },
        },
      },
    },
    async (request, reply) => {
      const { email, name, password, workspaceName, token } = request.body as {
        email: string;
        name: string;
        password: string;
        workspaceName: string;
        token?: string;
      };
      if (
        setup.tokenRequired &&
        (consumed || !setup.token || !tokenMatches(token, setup.token))
      ) {
        return reply.code(403).send();
      }
      const result = await auth.completeSetup({
        email,
        name,
        password,
        workspaceName,
      });
      if (result === "already-setup") return reply.code(409).send();
      consumed = true;
      const session = await auth.login(email, password);
      if (!session) throw new Error("setup login failed");
      return reply.code(201).send({ token: session.token });
    },
  );
}
