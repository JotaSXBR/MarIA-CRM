import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";

const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createDatabase(pool: Pool) {
  const db = drizzle({ client: pool });

  return {
    close: () => pool.end(),
    // Callers must already authorize this workspace. This scopes a transaction; it is not auth.
    withWorkspace: async <T>(
      workspaceId: string,
      callback: (
        tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
      ) => Promise<T>,
    ) => {
      if (!uuid.test(workspaceId)) {
        throw new TypeError("workspaceId must be a UUID");
      }

      return db.transaction(async (tx) => {
        const { rows } = await tx.execute<{ unsafe: boolean }>(sql`
          select coalesce(bool_or(rolsuper or rolbypassrls), true) as unsafe
          from pg_roles
          where rolname = current_user
        `);
        if (rows[0]?.unsafe !== false) {
          throw new Error("database role must not be superuser or BYPASSRLS");
        }
        await tx.execute(
          sql`select set_config('app.workspace_id', ${workspaceId}, true)`,
        );
        return callback(tx);
      });
    },
  };
}
