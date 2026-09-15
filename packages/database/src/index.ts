import { and, eq, isNull, sql, type SQLWrapper } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import { companies, contacts } from "./schema.ts";

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

  const companyColumns = {
    id: companies.id,
    name: companies.name,
    createdAt: companies.createdAt,
  };

  const notDeleted = (deletedAt: SQLWrapper) => isNull(deletedAt);

  return {
    close: () => pool.end(),
    listContacts: (workspaceId: string) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select(contactColumns)
          .from(contacts)
          .where(notDeleted(contacts.deletedAt))
          .orderBy(contacts.createdAt, contacts.id),
      ),
    getContact: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .select(contactColumns)
          .from(contacts)
          .where(and(eq(contacts.id, id), notDeleted(contacts.deletedAt)))
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
          .where(and(eq(contacts.id, id), notDeleted(contacts.deletedAt)))
          .returning(contactColumns);
        return rows[0];
      }),
    deleteContact: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .update(contacts)
          .set({ deletedAt: new Date() })
          .where(and(eq(contacts.id, id), notDeleted(contacts.deletedAt)))
          .returning({ id: contacts.id });
        return rows.length > 0;
      }),
    listCompanies: (workspaceId: string) =>
      withWorkspace(workspaceId, (tx) =>
        tx
          .select(companyColumns)
          .from(companies)
          .where(notDeleted(companies.deletedAt))
          .orderBy(companies.createdAt, companies.id),
      ),
    getCompany: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .select(companyColumns)
          .from(companies)
          .where(and(eq(companies.id, id), notDeleted(companies.deletedAt)))
          .limit(1);
        return rows[0];
      }),
    createCompany: (workspaceId: string, input: { name: string }) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .insert(companies)
          .values({ workspaceId, ...input })
          .returning(companyColumns);
        const row = rows[0];
        if (!row) throw new Error("company insert returned no row");
        return row;
      }),
    updateCompany: (
      workspaceId: string,
      id: string,
      input: { name?: string },
    ) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .update(companies)
          .set(input)
          .where(and(eq(companies.id, id), notDeleted(companies.deletedAt)))
          .returning(companyColumns);
        return rows[0];
      }),
    deleteCompany: (workspaceId: string, id: string) =>
      withWorkspace(workspaceId, async (tx) => {
        const rows = await tx
          .update(companies)
          .set({ deletedAt: new Date() })
          .where(and(eq(companies.id, id), notDeleted(companies.deletedAt)))
          .returning({ id: companies.id });
        return rows.length > 0;
      }),
    // Callers must already authorize this workspace. This scopes a transaction; it is not auth.
    withWorkspace,
  };
}

export type Database = ReturnType<typeof createDatabase>;
