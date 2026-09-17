import { access, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import { createFsMediaStore } from "../src/media-store.ts";

const workspaceId = "00000000-0000-4000-8000-000000000001";
const otherWorkspaceId = "00000000-0000-4000-8000-000000000002";

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "maria-media-store-"));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

test("put/read round-trips bytes under a valid workspace", async () => {
  const store = createFsMediaStore(root);
  const data = new Uint8Array([1, 2, 3]);
  const key = await store.put(workspaceId, data, "PNG");
  expect(key.startsWith(`${workspaceId}/`)).toBe(true);
  expect(key.endsWith(".png")).toBe(true);
  await expect(store.read(workspaceId, key)).resolves.toEqual(
    Buffer.from(data),
  );
});

test.each(["../escape", "not-a-uuid", `${workspaceId}/../evil`])(
  "put rejects invalid workspace id %s without writing",
  async (badWorkspaceId) => {
    const store = createFsMediaStore(root);
    await expect(
      store.put(badWorkspaceId, new Uint8Array([1])),
    ).rejects.toThrow("invalid media workspace");
    expect(await readdir(root)).toEqual([]);
    await expect(access(join(root, "..", "escape"))).rejects.toThrow();
  },
);

test("read returns null for an invalid workspace id", async () => {
  const store = createFsMediaStore(root);
  await expect(store.read("../escape", "x.png")).resolves.toBeNull();
});

test("read returns null for a traversal key inside the workspace prefix", async () => {
  const store = createFsMediaStore(root);
  await writeFile(join(root, "outside.txt"), "secret");
  await expect(
    store.read(workspaceId, `${workspaceId}/../outside.txt`),
  ).resolves.toBeNull();
});

test("read returns null for a key under another workspace prefix", async () => {
  const store = createFsMediaStore(root);
  const key = await store.put(otherWorkspaceId, new Uint8Array([9]));
  await expect(store.read(workspaceId, key)).resolves.toBeNull();
});
