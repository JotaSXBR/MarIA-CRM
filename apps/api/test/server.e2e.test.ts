import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createInterface } from "node:readline";
import { expect, test } from "vitest";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Pool } from "pg";

const image =
  "postgres:18.6-bookworm@sha256:1c59e2c3c818eaa0f0628f695b36e7c9e362d6b219b36a54a32df645cbd7e1af";

async function runMigrations(admin: Pool) {
  for (const migration of [
    "0000_product_foundation.sql",
    "0001_runtime_role.sql",
    "0002_local_identity.sql",
  ]) {
    await admin.query(
      await readFile(
        new URL(
          `../../../packages/database/drizzle/${migration}`,
          import.meta.url,
        ),
        "utf8",
      ),
    );
  }
  await admin.query("alter role maria_runtime password 'runtime'");
}

test("built server responds over HTTP, logs in, and shuts down on SIGTERM", async () => {
  const container = await new PostgreSqlContainer(image).start();
  const admin = new Pool({ connectionString: container.getConnectionUri() });
  try {
    await runMigrations(admin);
    const uri = new URL(container.getConnectionUri());
    uri.username = "maria_runtime";
    uri.password = "runtime";
    const child = spawn(process.execPath, ["dist/server.js"], {
      env: {
        ...process.env,
        HOST: "127.0.0.1",
        PORT: "0",
        DATABASE_URL: uri.toString(),
        ADMIN_EMAIL: "admin@example.com",
        ADMIN_PASSWORD: "admin-password",
      },
      stdio: ["ignore", "pipe", "inherit"],
    });
    const exited = once(child, "exit");
    const lines = createInterface({ input: child.stdout });
    const timeout = setTimeout(() => child.kill("SIGKILL"), 25000);
    try {
      let address: string | undefined;
      for await (const line of lines) {
        const match = /Server listening at (http:\/\/127\.0\.0\.1:\d+)/.exec(
          line,
        );
        if (match) {
          address = match[1];
          break;
        }
      }
      expect(address).toBeDefined();
      const health = await fetch(`${address}/health`);
      expect(health.status).toBe(200);
      expect(await health.json()).toEqual({ status: "ok" });
      const login = await fetch(`${address}/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "admin@example.com",
          password: "admin-password",
        }),
      });
      expect(login.status).toBe(200);
      const { token } = (await login.json()) as { token: string };
      expect(token).toBeDefined();
      child.kill("SIGTERM");
      const [exitCode, signal] = await exited;
      if (process.platform === "win32") {
        expect(signal).toBe("SIGTERM");
      } else {
        expect([exitCode, signal]).toEqual([0, null]);
      }
    } finally {
      clearTimeout(timeout);
      lines.close();
      if (child.exitCode === null && child.signalCode === null)
        child.kill("SIGKILL");
      await exited;
    }
  } finally {
    await admin.end();
    await container.stop();
  }
}, 120000);
