import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { Pool } from "pg";
import {
  applyMigrations,
  provisionRuntimePassword,
} from "../../src/migrate.ts";

const image =
  "postgres:18.6-bookworm@sha256:1c59e2c3c818eaa0f0628f695b36e7c9e362d6b219b36a54a32df645cbd7e1af";

export type TestDatabase = {
  container: StartedPostgreSqlContainer;
  admin: Pool;
  runtime: Pool;
  close: () => Promise<void>;
};

export async function startTestDatabase(): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer(image).start();
  const admin = new Pool({ connectionString: container.getConnectionUri() });
  try {
    await applyMigrations({ connectionString: container.getConnectionUri() });
    await provisionRuntimePassword({
      connectionString: container.getConnectionUri(),
      password: "runtime",
    });

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
  } catch (error) {
    await admin.end();
    await container.stop();
    throw error;
  }
}
