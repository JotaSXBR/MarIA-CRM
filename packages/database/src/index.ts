import { and, eq, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import { contacts } from "./schema.ts";

const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createDatabase(pool: Pool) {
  const db = drizzle({ client: pool });
  type DrizzleTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

  const withWorkspace = async <T>(
    workspaceId: string,
    callback: (tx: DrizzleTx) => Promise<T>,
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
      const isUnsafe = rows[0]?.unsafe ?? true;
      if (isUnsafe) {
        throw new Error("database role must not be superuser or BYPASSRLS");
      }
      await tx.execute(
        sql`select set_config('app.workspace_id', ${workspaceId}, true)`,
      );
      return callback(tx);
    });
  };

  const contactColumns = {
    id: contacts.id,
    name: contacts.name,
    email: contacts.email,
    phone: contacts.phone,
    createdAt: contacts.createdAt,
  };

  const active = () => isNull(contacts.deletedAt);

  return {
    close: () => pool.end(),
    listContacts: (workspaceId: string) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select(contactColumns)
          .from(contacts)
          .where(active())
          .orderBy(contacts.createdAt, contacts.id),
      ),
    getContact: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .select(contactColumns)
          .from(contacts)
          .where(and(eq(contacts.id, id), active()))
          .limit(1);
        return rows[0];
      }),
    createContact: (
      workspaceId: string,
      input: { name: string; email?: string | null; phone?: string | null },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .insert(contacts)
          .values({ workspaceId, ...input })
          .returning(contactColumns);
        const row = rows[0];
        if (!row) throw new Error("contact insert returned no row");
        return row;
      }),
    updateContact: (
      workspaceId: string,
      id: string,
      input: { name?: string; email?: string | null; phone?: string | null },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .update(contacts)
          .set(input)
          .where(and(eq(contacts.id, id), active()))
          .returning(contactColumns);
        return rows[0];
      }),
    deleteContact: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .update(contacts)
          .set({ deletedAt: new Date() })
          .where(and(eq(contacts.id, id), active()))
          .returning({ id: contacts.id });
        return rows.length > 0;
      }),
    // Callers must already authorize this workspace. This scopes a transaction; it is not auth.
    withWorkspace,
  };
}

export type Database = ReturnType<typeof createDatabase>;
