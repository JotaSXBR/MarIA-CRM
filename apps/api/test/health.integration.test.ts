import { randomUUID } from "node:crypto";
import { expect, test, vi } from "vitest";
import { buildApp } from "../src/app.ts";

test("liveness exposes only its public contract and unknown routes return 404", async () => {
  const app = buildApp();
  try {
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
    expect((await app.inject("/contacts")).statusCode).toBe(404);
  } finally {
    await app.close();
  }
}, 15000);

test("contacts require an authorized workspace", async () => {
  const listContacts = vi.fn();
  const app = buildApp({
    database: { listContacts },
    authorizeWorkspace: async () => undefined,
  });
  try {
    expect((await app.inject("/contacts")).statusCode).toBe(401);
    expect(listContacts).not.toHaveBeenCalled();
  } finally {
    await app.close();
  }
});

test("contacts use the authorized workspace", async () => {
  const workspaceId = randomUUID();
  const contact = {
    id: randomUUID(),
    name: "Contact",
    email: null,
    phone: null,
    createdAt: new Date(),
  };
  const listContacts = vi.fn().mockResolvedValue([contact]);
  const app = buildApp({
    database: { listContacts },
    authorizeWorkspace: async () => workspaceId,
  });
  try {
    const response = await app.inject("/contacts");
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([
      { ...contact, createdAt: contact.createdAt.toISOString() },
    ]);
    expect(listContacts).toHaveBeenCalledOnce();
    expect(listContacts).toHaveBeenCalledWith(workspaceId);
  } finally {
    await app.close();
  }
});
