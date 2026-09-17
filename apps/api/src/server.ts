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
  await app.listen(listenOptions(process.env));
} catch (error) {
  app.log.error(error);
  await shutdown();
}
