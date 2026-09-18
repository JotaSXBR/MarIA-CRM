import { randomBytes } from "node:crypto";
import { Pool } from "pg";
import { createLocalAuth } from "@maria/auth";
import { createDatabase } from "@maria/database";
import { buildApp } from "./app.ts";
import { listenOptions } from "./config.ts";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString: databaseUrl });
const database = createDatabase(pool);
const auth = createLocalAuth(pool, database, {
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
});
await auth.seedAdmin();

const setupRequired = await auth.setupRequired();
const setupTokenRequired = process.env.SETUP_TOKEN_REQUIRED !== "false";
const setupToken =
  setupRequired && setupTokenRequired
    ? randomBytes(24).toString("base64url")
    : undefined;
const app = buildApp({
  database,
  auth,
  setup: { tokenRequired: setupTokenRequired, token: setupToken },
});
const shutdown = async () => {
  try {
    await app.close();
    await database.close();
  } catch (error) {
    app.log.error(error);
    process.exitCode = 1;
  }
};
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void shutdown();
  });
}
try {
  const { host, port } = listenOptions(process.env);
  await app.listen({ host, port });
  if (setupRequired) {
    const url = `http://${host}:${port}/setup`;
    app.log.info(
      setupToken
        ? `Setup required — create the master account at ${url}?token=${setupToken}`
        : `Setup required — create the master account at ${url}`,
    );
  }
} catch (error) {
  app.log.error(error);
  await shutdown();
}
