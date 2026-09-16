import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const ledgerTable = "maria_schema_migrations";
const migrationName = /^\d{4}_[a-z0-9][a-z0-9_-]*\.sql$/;

export class MigrationHistoryError extends Error {}

export type Migration = { name: string; sql: string; checksum: string };

export async function loadMigrations(directory = defaultMigrationDirectory()) {
  const entries = await readdir(directory, { withFileTypes: true });
  const invalid = entries.find(
    (entry) =>
      entry.name.endsWith(".sql") &&
      (!entry.isFile() || !migrationName.test(entry.name)),
  );
  if (invalid)
    throw new MigrationHistoryError(
      `invalid migration filename: ${invalid.name}`,
    );
  const names = entries
    .filter((entry) => entry.isFile() && migrationName.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  if (new Set(names.map((name) => name.slice(0, 4))).size !== names.length)
    throw new MigrationHistoryError(
      "migration sequence numbers must be unique",
    );
  if (names.length === 0)
    throw new MigrationHistoryError("no migrations found");
  return Promise.all(
    names.map(async (name) => {
      const sql = await readFile(resolve(directory, name), "utf8");
      return {
        name,
        sql,
        checksum: createHash("sha256").update(sql).digest("hex"),
      };
    }),
  );
}

function defaultMigrationDirectory() {
  return resolve(dirname(fileURLToPath(import.meta.url)), "../drizzle");
}

async function hasLedger(client: Client) {
  const result = await client.query<{ exists: boolean }>(
    "select to_regclass('public.maria_schema_migrations') is not null as exists",
  );
  return result.rows[0]?.exists === true;
}

async function assertEmptyUntrackedDatabase(client: Client) {
  const result = await client.query<{ exists: boolean }>(`
    select exists (
      select 1
      from pg_class relation
      join pg_namespace namespace on namespace.oid = relation.relnamespace
      where namespace.nspname = 'public'
        and relation.relkind in ('r', 'p', 'v', 'm', 'S', 'f')
      union all
      select 1
      from pg_proc procedure
      join pg_namespace namespace on namespace.oid = procedure.pronamespace
      where namespace.nspname = 'public'
      union all
      select 1
      from pg_type type
      join pg_namespace namespace on namespace.oid = type.typnamespace
      where namespace.nspname = 'public'
        and type.typtype in ('b', 'd', 'e', 'r')
    ) as exists
  `);
  if (result.rows[0]?.exists) {
    throw new MigrationHistoryError(
      "database contains public objects but has no migration ledger; refusing automatic adoption",
    );
  }
}

async function createLedger(client: Client) {
  await client.query(`
    create table public.${ledgerTable} (
      name text primary key,
      checksum text not null,
      applied_at timestamptz not null default now()
    )
  `);
}

export async function applyMigrations(input: {
  connectionString: string;
  migrationsDirectory?: string;
}) {
  const migrations = await loadMigrations(input.migrationsDirectory);
  const known = new Map(
    migrations.map((migration) => [migration.name, migration]),
  );
  const client = new Client({ connectionString: input.connectionString });
  await client.connect();
  try {
    await client.query("begin");
    try {
      await client.query(
        "select pg_advisory_xact_lock(hashtext('maria:migrations'))",
      );
      if (await hasLedger(client)) {
        const applied = await client.query<{ name: string; checksum: string }>(
          `select name, checksum from public.${ledgerTable} order by name collate "C"`,
        );
        for (const row of applied.rows) {
          const migration = known.get(row.name);
          if (!migration)
            throw new MigrationHistoryError(
              `migration ledger references unknown migration: ${row.name}`,
            );
          if (migration.checksum !== row.checksum)
            throw new MigrationHistoryError(
              `migration checksum changed after application: ${row.name}`,
            );
        }
        for (const [index, row] of applied.rows.entries()) {
          if (migrations[index]?.name !== row.name) {
            throw new MigrationHistoryError(
              `migration ledger is not an applied prefix at: ${row.name}`,
            );
          }
        }
      } else {
        await assertEmptyUntrackedDatabase(client);
        await createLedger(client);
      }
      const applied = await client.query<{ name: string }>(
        `select name from public.${ledgerTable}`,
      );
      const appliedNames = new Set(applied.rows.map((row) => row.name));
      for (const migration of migrations) {
        if (appliedNames.has(migration.name)) continue;
        await client.query(migration.sql);
        await client.query(
          `insert into public.${ledgerTable} (name, checksum) values ($1, $2)`,
          [migration.name, migration.checksum],
        );
      }
      await client.query("commit");
      return {
        applied: migrations
          .filter((migration) => !appliedNames.has(migration.name))
          .map((migration) => migration.name),
      };
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  } finally {
    await client.end();
  }
}

export async function provisionRuntimePassword(input: {
  connectionString: string;
  password: string;
}) {
  const client = new Client({ connectionString: input.connectionString });
  await client.connect();
  try {
    const quoted = await client.query<{ command: string }>(
      "select format('alter role maria_runtime password %L', $1::text) as command",
      [input.password],
    );
    const command = quoted.rows[0]?.command;
    if (!command)
      throw new Error("could not construct runtime role password command");
    await client.query(command);
  } finally {
    await client.end();
  }
}
