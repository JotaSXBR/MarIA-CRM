import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

/**
 * Tenant-scoped attachment storage (the `StoragePort` seam — an S3-compatible
 * implementation can replace this without touching routes/dispatcher). Keys
 * are generated server-side as `{workspaceId}/{uuid}[.ext]`; callers never
 * supply them. `read` additionally enforces the workspace prefix so a
 * tampered `media_key` cannot cross tenants even before RLS applies.
 */
export type MediaStore = {
  put(
    workspaceId: string,
    data: Uint8Array,
    extension?: string,
  ): Promise<string>;
  read(workspaceId: string, key: string): Promise<Uint8Array | null>;
};

export function createFsMediaStore(rootDir: string): MediaStore {
  const root = resolve(rootDir);
  return {
    async put(workspaceId, data, extension) {
      const safeExt =
        extension && /^[a-z0-9]{1,10}$/i.test(extension)
          ? `.${extension.toLowerCase()}`
          : "";
      const key = `${workspaceId}/${randomUUID()}${safeExt}`;
      const path = join(root, key);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, data);
      return key;
    },
    async read(workspaceId, key) {
      if (!key.startsWith(`${workspaceId}/`) || key.includes("..")) {
        return null;
      }
      try {
        return await readFile(join(root, key));
      } catch {
        return null;
      }
    },
  };
}
