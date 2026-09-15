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

      const authed = { authorization: `Bearer ${token}` };
      const json = { ...authed, "content-type": "application/json" };

      const organization = await fetch(`${address}/admin/organizations`, {
        method: "POST",
        headers: json,
        body: JSON.stringify({ name: "E2E Org" }),
      });
      expect(organization.status).toBe(201);
      const { id: orgId } = (await organization.json()) as { id: string };

      const createWorkspace = async (name: string) => {
        const response = await fetch(`${address}/admin/workspaces`, {
          method: "POST",
          headers: json,
          body: JSON.stringify({ orgId, name }),
        });
        expect(response.status).toBe(201);
        return ((await response.json()) as { id: string }).id;
      };
      const workspaceA = await createWorkspace("A");
      const workspaceB = await createWorkspace("B");

      const membership = await fetch(`${address}/admin/memberships`, {
        method: "POST",
        headers: json,
        body: JSON.stringify({
          userId: adminId,
          workspaceId: workspaceA,
          role: "admin",
        }),
      });
      expect(membership.status).toBe(201);

      const members = await fetch(
        `${address}/admin/workspaces/${workspaceA}/members`,
        { headers: authed },
      );
      expect(members.status).toBe(200);
      expect(((await members.json()) as { userId: string }[])[0]?.userId).toBe(
        adminId,
      );

      const createdUser = await fetch(`${address}/admin/users`, {
        method: "POST",
        headers: json,
        body: JSON.stringify({
          email: "e2e-member@example.com",
          name: "E2E Member",
          password: "member-password",
          workspaceId: workspaceB,
          role: "member",
        }),
      });
      expect(createdUser.status).toBe(200);
      const users = await fetch(`${address}/admin/users`, {
        headers: authed,
      });
      expect(users.status).toBe(200);
      expect(
        ((await users.json()) as { email: string }[]).some(
          (row) => row.email === "e2e-member@example.com",
        ),
      ).toBe(true);

      const memberLogin = await fetch(`${address}/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "e2e-member@example.com",
          password: "member-password",
        }),
      });
      expect(memberLogin.status).toBe(200);
      const { token: memberToken } = (await memberLogin.json()) as {
        token: string;
      };
      const myWorkspaces = await fetch(`${address}/me/workspaces`, {
        headers: { authorization: `Bearer ${memberToken}` },
      });
      expect(myWorkspaces.status).toBe(200);
      expect(await myWorkspaces.json()).toEqual([
        { workspaceId: workspaceB, workspaceName: "B", role: "member" },
      ]);

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

      const companyCreated = await fetch(
        `${address}/companies?workspaceId=${workspaceA}`,
        {
          method: "POST",
          headers: { ...authed, "content-type": "application/json" },
          body: JSON.stringify({ name: "E2E Company" }),
        },
      );
      expect(companyCreated.status).toBe(201);
      const company = (await companyCreated.json()) as { id: string };
      const companyDeleted = await fetch(
        `${address}/companies/${company.id}?workspaceId=${workspaceA}`,
        { method: "DELETE", headers: authed },
      );
      expect(companyDeleted.status).toBe(204);
      const companyGone = await fetch(
        `${address}/companies/${company.id}?workspaceId=${workspaceA}`,
        { headers: authed },
      );
      expect(companyGone.status).toBe(404);

      const pipelineCreated = await fetch(
        `${address}/pipelines?workspaceId=${workspaceA}`,
        {
          method: "POST",
          headers: json,
          body: JSON.stringify({ name: "E2E Pipeline" }),
        },
      );
      expect(pipelineCreated.status).toBe(201);
      const pipeline = (await pipelineCreated.json()) as { id: string };

      const createStage = async (name: string) => {
        const response = await fetch(
          `${address}/pipelines/${pipeline.id}/stages?workspaceId=${workspaceA}`,
          {
            method: "POST",
            headers: json,
            body: JSON.stringify({ name }),
          },
        );
        expect(response.status).toBe(201);
        return (await response.json()) as { id: string; position: string };
      };
      const stageOne = await createStage("Novo");
      const stageTwo = await createStage("Fechado");
      expect(stageOne.position < stageTwo.position).toBe(true);

      const stages = await fetch(
        `${address}/pipelines/${pipeline.id}/stages?workspaceId=${workspaceA}`,
        { headers: authed },
      );
      expect(stages.status).toBe(200);
      expect((await stages.json()) as { id: string }[]).toHaveLength(2);

      const dealCreated = await fetch(
        `${address}/deals?workspaceId=${workspaceA}`,
        {
          method: "POST",
          headers: json,
          body: JSON.stringify({
            pipelineId: pipeline.id,
            stageId: stageOne.id,
            title: "E2E Deal",
            valueCents: 5000,
          }),
        },
      );
      expect(dealCreated.status).toBe(201);
      const deal = (await dealCreated.json()) as {
        id: string;
        stageId: string;
        position: string;
      };
      expect(deal.stageId).toBe(stageOne.id);

      const moved = await fetch(
        `${address}/deals/${deal.id}/move?workspaceId=${workspaceA}`,
        {
          method: "POST",
          headers: json,
          body: JSON.stringify({ stageId: stageTwo.id }),
        },
      );
      expect(moved.status).toBe(200);
      expect((await moved.json()) as { stageId: string }).toMatchObject({
        stageId: stageTwo.id,
      });

      const dealDeleted = await fetch(
        `${address}/deals/${deal.id}?workspaceId=${workspaceA}`,
        { method: "DELETE", headers: authed },
      );
      expect(dealDeleted.status).toBe(204);

      const stageDeleted = await fetch(
        `${address}/stages/${stageTwo.id}?workspaceId=${workspaceA}`,
        { method: "DELETE", headers: authed },
      );
      expect(stageDeleted.status).toBe(204);

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
