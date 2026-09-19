import { randomUUID } from "node:crypto";
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
import {
  silencePoolErrors,
  startTestDatabase,
  type TestDatabase,
} from "./utils/postgres.ts";

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
  const admin = silencePoolErrors(new Pool({ connectionString }));
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

test("0017 upgrades legacy member roles to agent on a prior-prefix database", async () => {
  const all = await loadMigrations();
  const roles = all.find(
    (migration) => migration.name === "0017_workspace_roles.sql",
  );
  if (!roles) throw new Error("0017_workspace_roles.sql not found");
  const prefix = all.filter((migration) => migration.name < roles.name);
  const directory = await migrationDirectory(
    Object.fromEntries(
      prefix.map((migration) => [migration.name, migration.sql]),
    ),
  );
  await withEmptyDatabase(async (connectionString, admin) => {
    try {
      expect(
        (
          await applyMigrations({
            connectionString,
            migrationsDirectory: directory,
          })
        ).applied,
      ).toHaveLength(prefix.length);

      const { rows: orgs } = await admin.query<{ id: string }>(
        "insert into organizations (name) values ('Org') returning id",
      );
      const { rows: workspaces } = await admin.query<{ id: string }>(
        "insert into workspaces (org_id, name) values ($1, 'WS') returning id",
        [orgs[0]!.id],
      );
      const { rows: users } = await admin.query<{
        id: string;
        email: string;
      }>(
        "insert into users (email, name, password_hash) values ('u@example.com', 'U', 'x'), ('v@example.com', 'V', 'x') returning id, email",
      );
      const memberUser = users.find((row) => row.email === "u@example.com")!;
      const adminUser = users.find((row) => row.email === "v@example.com")!;
      await admin.query(
        "insert into memberships (user_id, workspace_id, role) values ($1, $2, 'member'), ($3, $2, 'admin')",
        [memberUser.id, workspaces[0]!.id, adminUser.id],
      );
      await admin.query(
        "insert into invitations (email, workspace_id, role, token, expires_at) values ('i@example.com', $1, 'member', 'tok', now())",
        [workspaces[0]!.id],
      );

      await writeFile(join(directory, roles.name), roles.sql);
      expect(
        (
          await applyMigrations({
            connectionString,
            migrationsDirectory: directory,
          })
        ).applied,
      ).toEqual([roles.name]);

      const { rows: membershipRoles } = await admin.query<{ role: string }>(
        "select role from memberships order by role",
      );
      expect(membershipRoles.map((row) => row.role)).toEqual([
        "admin",
        "agent",
      ]);
      const { rows: invitationRoles } = await admin.query<{ role: string }>(
        "select role from invitations",
      );
      expect(invitationRoles).toEqual([{ role: "agent" }]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}, 120000);

test("0018 evolves invitations to hashed tokens with a live-unique index", async () => {
  const all = await loadMigrations();
  const invites = all.find(
    (migration) => migration.name === "0018_workspace_invitations.sql",
  );
  if (!invites) throw new Error("0018_workspace_invitations.sql not found");
  const prefix = all.filter((migration) => migration.name < invites.name);
  const directory = await migrationDirectory(
    Object.fromEntries(
      prefix.map((migration) => [migration.name, migration.sql]),
    ),
  );
  await withEmptyDatabase(async (connectionString, admin) => {
    try {
      expect(
        (
          await applyMigrations({
            connectionString,
            migrationsDirectory: directory,
          })
        ).applied,
      ).toHaveLength(prefix.length);

      const { rows: orgs } = await admin.query<{ id: string }>(
        "insert into organizations (name) values ('Org') returning id",
      );
      const { rows: workspaces } = await admin.query<{ id: string }>(
        "insert into workspaces (org_id, name) values ($1, 'WS') returning id",
        [orgs[0]!.id],
      );
      // Old schema: plaintext token + used_at. One live and one consumed
      // invitation for the same (workspace, email) must survive the upgrade.
      await admin.query(
        "insert into invitations (email, workspace_id, role, token, expires_at, used_at) values ('i@example.com', $1, 'agent', 'live-tok', now(), null), ('i@example.com', $1, 'agent', 'old-tok', now(), now())",
        [workspaces[0]!.id],
      );

      await writeFile(join(directory, invites.name), invites.sql);
      expect(
        (
          await applyMigrations({
            connectionString,
            migrationsDirectory: directory,
          })
        ).applied,
      ).toEqual([invites.name]);

      const { rows: columns } = await admin.query<{ column_name: string }>(
        "select column_name from information_schema.columns where table_name = 'invitations' order by column_name",
      );
      expect(columns.map((c) => c.column_name)).toEqual([
        "consumed_at",
        "created_at",
        "email",
        "expires_at",
        "id",
        "invited_by",
        "role",
        "token_hash",
        "workspace_id",
      ]);

      // The consumed row does not block the live-unique index; a second
      // live invitation for the same (workspace, email) does.
      await expect(
        admin.query(
          "insert into invitations (email, workspace_id, role, token_hash, expires_at) values ('i@example.com', $1, 'agent', 'another-hash', now())",
          [workspaces[0]!.id],
        ),
      ).rejects.toMatchObject({ code: "23505" });
      await admin.query(
        "update invitations set consumed_at = now() where token_hash = 'live-tok'",
      );
      await admin.query(
        "insert into invitations (email, workspace_id, role, token_hash, expires_at) values ('i@example.com', $1, 'agent', 'another-hash', now())",
        [workspaces[0]!.id],
      );

      // The token-hash policy clause replaced the workspace-only policy.
      const { rows: policies } = await admin.query<{ policyname: string }>(
        "select policyname from pg_policies where tablename = 'invitations' order by policyname",
      );
      expect(policies.map((p) => p.policyname)).toEqual(["invitations_scope"]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}, 120000);

test("0019 adds onboarding state to workspaces on a prior-prefix database", async () => {
  const all = await loadMigrations();
  const onboarding = all.find(
    (migration) => migration.name === "0019_workspace_onboarding.sql",
  );
  if (!onboarding) throw new Error("0019_workspace_onboarding.sql not found");
  const prefix = all.filter((migration) => migration.name < onboarding.name);
  const directory = await migrationDirectory(
    Object.fromEntries(
      prefix.map((migration) => [migration.name, migration.sql]),
    ),
  );
  await withEmptyDatabase(async (connectionString, admin) => {
    try {
      expect(
        (
          await applyMigrations({
            connectionString,
            migrationsDirectory: directory,
          })
        ).applied,
      ).toHaveLength(prefix.length);

      await writeFile(join(directory, onboarding.name), onboarding.sql);
      expect(
        (
          await applyMigrations({
            connectionString,
            migrationsDirectory: directory,
          })
        ).applied,
      ).toEqual([onboarding.name]);

      const { rows: columns } = await admin.query<{
        column_name: string;
        is_nullable: string;
        column_default: string | null;
      }>(
        "select column_name, is_nullable, column_default from information_schema.columns where table_name = 'workspaces' and column_name in ('onboarding_state', 'onboarded_at') order by column_name",
      );
      expect(columns).toEqual([
        {
          column_name: "onboarded_at",
          is_nullable: "YES",
          column_default: null,
        },
        {
          column_name: "onboarding_state",
          is_nullable: "NO",
          column_default: "'{}'::jsonb",
        },
      ]);

      // Existing workspaces start unonboarded with empty state.
      const { rows: orgs } = await admin.query<{ id: string }>(
        "insert into organizations (name) values ('Org') returning id",
      );
      const { rows: ws } = await admin.query<{
        id: string;
        onboarding_state: unknown;
        onboarded_at: string | null;
      }>(
        "insert into workspaces (org_id, name) values ($1, 'WS') returning id, onboarding_state, onboarded_at",
        [orgs[0]!.id],
      );
      expect(ws[0]!.onboarding_state).toEqual({});
      expect(ws[0]!.onboarded_at).toBeNull();
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}, 120000);

test("0020 adds conversation ownership and a forced-RLS assignment ledger", async () => {
  const all = await loadMigrations();
  const ownership = all.find(
    (migration) => migration.name === "0020_conversation_ownership.sql",
  );
  if (!ownership) throw new Error("0020_conversation_ownership.sql not found");
  const prefix = all.filter((migration) => migration.name < ownership.name);
  const directory = await migrationDirectory(
    Object.fromEntries(
      prefix.map((migration) => [migration.name, migration.sql]),
    ),
  );
  await withEmptyDatabase(async (connectionString, admin) => {
    try {
      expect(
        (
          await applyMigrations({
            connectionString,
            migrationsDirectory: directory,
          })
        ).applied,
      ).toHaveLength(prefix.length);

      await writeFile(join(directory, ownership.name), ownership.sql);
      expect(
        (
          await applyMigrations({
            connectionString,
            migrationsDirectory: directory,
          })
        ).applied,
      ).toEqual([ownership.name]);

      const { rows: columns } = await admin.query<{
        column_name: string;
        is_nullable: string;
      }>(
        "select column_name, is_nullable from information_schema.columns where table_name = 'conversations' and column_name in ('assigned_user_id', 'assigned_at') order by column_name",
      );
      expect(columns).toEqual([
        { column_name: "assigned_at", is_nullable: "YES" },
        { column_name: "assigned_user_id", is_nullable: "YES" },
      ]);

      const { rows: rls } = await admin.query<{
        relforcerowsecurity: boolean;
        relrowsecurity: boolean;
      }>(
        "select relforcerowsecurity, relrowsecurity from pg_class where relname = 'conversation_assignments'",
      );
      expect(rls).toEqual([
        { relforcerowsecurity: true, relrowsecurity: true },
      ]);

      const { rows: policies } = await admin.query<{ policyname: string }>(
        "select policyname from pg_policies where tablename = 'conversation_assignments'",
      );
      expect(policies).toEqual([
        { policyname: "conversation_assignments_workspace_scope" },
      ]);

      const { rows: grants } = await admin.query<{
        privilege_type: string;
      }>(
        `select privilege_type from information_schema.role_table_grants
         where table_name = 'conversation_assignments' and grantee = 'maria_runtime'
         order by privilege_type`,
      );
      expect(grants).toEqual([
        { privilege_type: "INSERT" },
        { privilege_type: "SELECT" },
      ]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}, 120000);

test("0021 adds message kind/author and a forced-RLS quick replies table", async () => {
  const all = await loadMigrations();
  const collaboration = all.find(
    (migration) => migration.name === "0021_conversation_collaboration.sql",
  );
  if (!collaboration) {
    throw new Error("0021_conversation_collaboration.sql not found");
  }
  const prefix = all.filter((migration) => migration.name < collaboration.name);
  const directory = await migrationDirectory(
    Object.fromEntries(
      prefix.map((migration) => [migration.name, migration.sql]),
    ),
  );
  await withEmptyDatabase(async (connectionString, admin) => {
    try {
      expect(
        (
          await applyMigrations({
            connectionString,
            migrationsDirectory: directory,
          })
        ).applied,
      ).toHaveLength(prefix.length);

      await writeFile(join(directory, collaboration.name), collaboration.sql);
      expect(
        (
          await applyMigrations({
            connectionString,
            migrationsDirectory: directory,
          })
        ).applied,
      ).toEqual([collaboration.name]);

      const { rows: columns } = await admin.query<{
        column_name: string;
        is_nullable: string;
        column_default: string | null;
      }>(
        `select column_name, is_nullable, column_default from information_schema.columns
         where table_name = 'messages' and column_name in ('kind', 'author_user_id')
         order by column_name`,
      );
      expect(columns).toEqual([
        {
          column_name: "author_user_id",
          is_nullable: "YES",
          column_default: null,
        },
        {
          column_name: "kind",
          is_nullable: "NO",
          column_default: "'message'::text",
        },
      ]);

      const { rows: rls } = await admin.query<{
        relforcerowsecurity: boolean;
        relrowsecurity: boolean;
      }>(
        "select relforcerowsecurity, relrowsecurity from pg_class where relname = 'quick_replies'",
      );
      expect(rls).toEqual([
        { relforcerowsecurity: true, relrowsecurity: true },
      ]);

      const { rows: policies } = await admin.query<{ policyname: string }>(
        "select policyname from pg_policies where tablename = 'quick_replies'",
      );
      expect(policies).toEqual([
        { policyname: "quick_replies_workspace_scope" },
      ]);

      const { rows: grants } = await admin.query<{
        privilege_type: string;
      }>(
        `select privilege_type from information_schema.role_table_grants
         where table_name = 'quick_replies' and grantee = 'maria_runtime'
         order by privilege_type`,
      );
      expect(grants).toEqual([
        { privilege_type: "INSERT" },
        { privilege_type: "SELECT" },
        { privilege_type: "UPDATE" },
      ]);

      // The live-shortcut unique index dedupes only active rows: deleting a
      // reply frees its shortcut for reuse.
      const org = randomUUID();
      const ws = randomUUID();
      await admin.query(
        "insert into organizations (id, name) values ($1, 'O')",
        [org],
      );
      await admin.query(
        "insert into workspaces (id, org_id, name) values ($1, $2, 'W')",
        [ws, org],
      );
      await admin.query(
        `insert into quick_replies (workspace_id, title, shortcut, body)
         values ($1, 'Oi', 'oi', 'Olá!')`,
        [ws],
      );
      await expect(
        admin.query(
          `insert into quick_replies (workspace_id, title, shortcut, body)
           values ($1, 'Oi 2', 'oi', 'Oi de novo')`,
          [ws],
        ),
      ).rejects.toThrow(/duplicate key/);
      await admin.query(
        "update quick_replies set deleted_at = now() where workspace_id = $1",
        [ws],
      );
      await admin.query(
        `insert into quick_replies (workspace_id, title, shortcut, body)
         values ($1, 'Oi 3', 'oi', 'Oi de novo')`,
        [ws],
      );
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
