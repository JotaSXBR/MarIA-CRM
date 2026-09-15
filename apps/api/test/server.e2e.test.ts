import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createInterface } from "node:readline";
import { expect, test } from "vitest";
import { startTestDatabase } from "@maria/database/testing";

test("built server responds over HTTP, logs in, runs contact CRUD, and shuts down on SIGTERM", async () => {
  const testDatabase = await startTestDatabase();
  try {
    const uri = new URL(testDatabase.container.getConnectionUri());
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

      const { rows: adminRows } = await testDatabase.admin.query<{
        id: string;
      }>("select id from users where email = 'admin@example.com'");
      const adminId = adminRows[0]?.id;
      expect(adminId).toBeDefined();
      const organization = randomUUID();
      const workspaceA = randomUUID();
      const workspaceB = randomUUID();
      await testDatabase.admin.query(
        "insert into organizations (id, name) values ($1, 'E2E Org')",
        [organization],
      );
      await testDatabase.admin.query(
        "insert into workspaces (id, org_id, name) values ($1, $3, 'A'), ($2, $3, 'B')",
        [workspaceA, workspaceB, organization],
      );
      await testDatabase.admin.query(
        "insert into memberships (user_id, workspace_id, role) values ($1, $2, 'admin')",
        [adminId, workspaceA],
      );

      const authed = { authorization: `Bearer ${token}` };
      const created = await fetch(
        `${address}/contacts?workspaceId=${workspaceA}`,
        {
          method: "POST",
          headers: { ...authed, "content-type": "application/json" },
          body: JSON.stringify({
            name: "E2E Contact",
            email: "e2e@example.com",
          }),
        },
      );
      expect(created.status).toBe(201);
      const contact = (await created.json()) as { id: string; name: string };
      expect(contact.name).toBe("E2E Contact");

      const fetched = await fetch(
        `${address}/contacts/${contact.id}?workspaceId=${workspaceA}`,
        { headers: authed },
      );
      expect(fetched.status).toBe(200);

      const updated = await fetch(
        `${address}/contacts/${contact.id}?workspaceId=${workspaceA}`,
        {
          method: "PATCH",
          headers: { ...authed, "content-type": "application/json" },
          body: JSON.stringify({ name: "E2E Renamed" }),
        },
      );
      expect(updated.status).toBe(200);
      expect(((await updated.json()) as { name: string }).name).toBe(
        "E2E Renamed",
      );

      const crossTenant = await fetch(
        `${address}/contacts/${contact.id}?workspaceId=${workspaceB}`,
        { headers: authed },
      );
      expect(crossTenant.status).toBe(401);

      const deleted = await fetch(
        `${address}/contacts/${contact.id}?workspaceId=${workspaceA}`,
        { method: "DELETE", headers: authed },
      );
      expect(deleted.status).toBe(204);
      const gone = await fetch(
        `${address}/contacts/${contact.id}?workspaceId=${workspaceA}`,
        { headers: authed },
      );
      expect(gone.status).toBe(404);

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
    await testDatabase.close();
  }
}, 120000);
