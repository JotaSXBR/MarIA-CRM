import { applyMigrations, provisionRuntimePassword } from "./migrate.ts";

const connectionString = process.env.MIGRATION_DATABASE_URL;
if (!connectionString) throw new Error("MIGRATION_DATABASE_URL is required");

const flags = process.argv.slice(2).filter((flag) => flag !== "--");
if (flags.some((flag) => flag !== "--provision-runtime"))
  throw new Error("unknown migration CLI flag");
const provisionRuntime = flags.includes("--provision-runtime");
const password = process.env.RUNTIME_DATABASE_PASSWORD;
if (provisionRuntime && !password)
  throw new Error(
    "RUNTIME_DATABASE_PASSWORD is required with --provision-runtime",
  );

const result = await applyMigrations({ connectionString });
if (provisionRuntime) {
  await provisionRuntimePassword({ connectionString, password: password! });
}
console.log(`Applied ${result.applied.length} migration(s).`);
