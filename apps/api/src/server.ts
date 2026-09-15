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
const app = buildApp({ database, auth });
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    app.close().catch((error: unknown) => {
      app.log.error(error);
      process.exitCode = 1;
    });
  });
}
try {
  await app.listen(listenOptions(process.env));
} catch (error) {
  app.log.error(error);
  await app.close();
  process.exitCode = 1;
}
