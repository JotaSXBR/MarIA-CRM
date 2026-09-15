import { readFile } from "node:fs/promises";
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { Pool } from "pg";

const image =
  "postgres:18.6-bookworm@sha256:1c59e2c3c818eaa0f0628f695b36e7c9e362d6b219b36a54a32df645cbd7e1af";

const migrations = [
  "0000_product_foundation.sql",
  "0001_runtime_role.sql",
  "0002_local_identity.sql",
  "0003_contact_soft_delete.sql",
  "0004_company_soft_delete.sql",
  "0005_admin_grants.sql",
];

export type TestDatabase = {
  container: StartedPostgreSqlContainer;
  admin: Pool;
  runtime: Pool;
  close: () => Promise<void>;
};

export async function startTestDatabase(): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer(image).start();
  const admin = new Pool({ connectionString: container.getConnectionUri() });
  for (const migration of migrations) {
    await admin.query(
      await readFile(
        new URL(`../../drizzle/${migration}`, import.meta.url),
        "utf8",
      ),
    );
  }
  await admin.query("alter role maria_runtime password 'runtime'");

  const uri = new URL(container.getConnectionUri());
  uri.username = "maria_runtime";
  uri.password = "runtime";
  const runtime = new Pool({ connectionString: uri.toString(), max: 1 });

  return {
    container,
    admin,
    runtime,
    close: async () => {
      await runtime.end();
      await admin.end();
      await container.stop();
    },
  };
}
