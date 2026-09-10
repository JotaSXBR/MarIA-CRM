import { expect, test } from "vitest";
import { Pool } from "pg";
import { createDatabase } from "../src/index.ts";

test("rejects a non-UUID workspace before opening a connection", async () => {
  const pool = new Pool({ connectionString: "postgres://unused" });
  const database = createDatabase(pool);

  await expect(
    database.withWorkspace("not-a-uuid", async () => undefined),
  ).rejects.toThrow("workspaceId must be a UUID");
  await database.close();
});
