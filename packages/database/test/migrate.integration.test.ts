import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, expect, test } from "vitest";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Pool } from "pg";
import {
  MigrationHistoryError,
  applyMigrations,
  loadMigrations,
} from "../src/migrate.ts";
import { startTestDatabase, type TestDatabase } from "./utils/postgres.ts";

let database: TestDatabase;

beforeAll(async () => {
  database = await startTestDatabase();
}, 120000);

test("serializes migrators and rejects gaps, retroactive files and unknown history", async () => {
  const directory = await migrationDirectory({
    "0001_first.sql":
      "create table migration_once (id integer primary key); insert into migration_once values (1);",
    "0002_second.sql": "alter table migration_once add column name text;",
  });
  try {
    await withEmptyDatabase(async (connectionString, admin) => {
      const input = { connectionString, migrationsDirectory: directory };
      const results = await Promise.all([
        applyMigrations(input),
        applyMigrations(input),
      ]);
      expect(
        results.map((result) => result.applied.length).sort((a, b) => a - b),
      ).toEqual([0, 2]);
      expect((await admin.query("select id from migration_once")).rows).toEqual(
        [{ id: 1 }],
      );

      const first = (await loadMigrations(directory))[0]!;
      await admin.query("delete from maria_schema_migrations where name = $1", [
        first.name,
      ]);
      await expect(applyMigrations(input)).rejects.toThrow(
        "not an applied prefix",
      );
      await admin.query(
        "insert into maria_schema_migrations (name, checksum) values ($1, $2)",
        [first.name, first.checksum],
      );

      const retroactive = join(directory, "0000_retroactive.sql");
      await writeFile(retroactive, "create table must_not_run (id integer);");
      await expect(applyMigrations(input)).rejects.toThrow(
        "not an applied prefix",
      );
      expect(
        (await admin.query("select to_regclass('must_not_run') as name")).rows,
      ).toEqual([{ name: null }]);
      await rm(retroactive);

      await admin.query(
        "insert into maria_schema_migrations (name, checksum) values ('9999_unknown.sql', 'unknown')",
      );
      await expect(applyMigrations(input)).rejects.toThrow("unknown migration");
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 120000);

afterAll(async () => {
  await database?.close();
}, 30000);

async function migrationDirectory(files: Record<string, string>) {
  const directory = await mkdtemp(join(tmpdir(), "maria-migrations-"));
  await Promise.all(
    Object.entries(files).map(([name, sql]) =>
      writeFile(join(directory, name), sql),
    ),
  );
  return directory;
}

async function withEmptyDatabase(
  callback: (connectionString: string, admin: Pool) => Promise<void>,
) {
  const container = await new PostgreSqlContainer(
    "postgres:18.6-bookworm@sha256:1c59e2c3c818eaa0f0628f695b36e7c9e362d6b219b36a54a32df645cbd7e1af",
  ).start();
  const connectionString = container.getConnectionUri();
  const admin = new Pool({ connectionString });
  try {
    await callback(connectionString, admin);
  } finally {
    await admin.end();
    await container.stop();
  }
}

test("reapplies no migrations and records checksums", async () => {
  const second = await applyMigrations({
    connectionString: database.container.getConnectionUri(),
  });
  expect(second.applied).toEqual([]);
  expect(
    (
      await database.admin.query(
        "select name, checksum from maria_schema_migrations order by name",
      )
    ).rows,
  ).toHaveLength((await loadMigrations()).length);
}, 120000);

test("applies an ordered upgrade after an existing prefix", async () => {
  const directory = await migrationDirectory({
    "0001_first.sql":
      "create table migration_prefix_records (id integer primary key, name text not null); insert into migration_prefix_records (id, name) values (1, 'seed');",
    "0002_second.sql":
      "alter table migration_prefix_records add column state text not null default 'new';",
  });
  await withEmptyDatabase(async (connectionString, admin) => {
    try {
      const firstDirectory = await migrationDirectory({
        "0001_first.sql":
          "create table migration_prefix_records (id integer primary key, name text not null); insert into migration_prefix_records (id, name) values (1, 'seed');",
      });
      try {
        expect(
          (
            await applyMigrations({
              connectionString,
              migrationsDirectory: firstDirectory,
            })
          ).applied,
        ).toEqual(["0001_first.sql"]);
      } finally {
        await rm(firstDirectory, { recursive: true, force: true });
      }
      expect(
        (
          await applyMigrations({
            connectionString,
            migrationsDirectory: directory,
          })
        ).applied,
      ).toEqual(["0002_second.sql"]);
      expect(
        (
          await admin.query(
            "select id, name, state from migration_prefix_records",
          )
        ).rows,
      ).toEqual([{ id: 1, name: "seed", state: "new" }]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}, 120000);

test("rolls back a failed migration and does not write its ledger row", async () => {
  const directory = await migrationDirectory({
    "0090_before_failure.sql":
      "create table migration_rollback_probe (id integer primary key);",
    "0091_failure.sql": "select missing_migration_function();",
  });
  await withEmptyDatabase(async (connectionString, admin) => {
    try {
      await expect(
        applyMigrations({
          connectionString,
          migrationsDirectory: directory,
        }),
      ).rejects.toThrow("missing_migration_function");
      expect(
        (
          await admin.query(
            "select to_regclass('migration_rollback_probe') as table_name",
          )
        ).rows,
      ).toEqual([{ table_name: null }]);
      expect(
        (
          await admin.query(
            "select to_regclass('public.maria_schema_migrations') as table_name",
          )
        ).rows,
      ).toEqual([{ table_name: null }]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}, 120000);

test("rejects changed checksums and untracked existing databases", async () => {
  const directory = await migrationDirectory({
    "0100_checksum.sql":
      "create table migration_checksum_probe (id integer primary key);",
  });
  await withEmptyDatabase(async (connectionString) => {
    try {
      await applyMigrations({
        connectionString,
        migrationsDirectory: directory,
      });
      await writeFile(
        join(directory, "0100_checksum.sql"),
        "create table migration_checksum_probe (id bigint primary key);",
      );
      await expect(
        applyMigrations({
          connectionString,
          migrationsDirectory: directory,
        }),
      ).rejects.toBeInstanceOf(MigrationHistoryError);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
  const untracked = await migrationDirectory({
    "0200_future.sql":
      "create table should_not_exist (id integer primary key);",
  });
  await withEmptyDatabase(async (connectionString, admin) => {
    try {
      await admin.query("create type untracked_status as enum ('new')");
      await admin.query(
        "create function untracked_database_function() returns integer language sql as 'select 1'",
      );
      await expect(
        applyMigrations({ connectionString, migrationsDirectory: untracked }),
      ).rejects.toThrow("refusing automatic adoption");
    } finally {
      await rm(untracked, { recursive: true, force: true });
    }
  });
}, 120000);
