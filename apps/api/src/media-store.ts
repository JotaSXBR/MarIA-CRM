import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";

/**
 * Tenant-scoped attachment storage (the `StoragePort` seam — an S3-compatible
 * implementation can replace this without touching routes/dispatcher). Keys
 * are generated server-side as `{workspaceId}/{uuid}[.ext]`; callers never
 * supply them. `read` additionally enforces the workspace prefix so a
 * tampered `media_key` cannot cross tenants even before RLS applies.
 *
 * `workspaceId` must be a canonical UUID and every resolved path must stay
 * strictly inside the configured root directory; both checks keep crafted
 * identifiers from escaping the store.
 */
export type MediaStore = {
  put(
    workspaceId: string,
    data: Uint8Array,
    extension?: string,
  ): Promise<string>;
  read(workspaceId: string, key: string): Promise<Uint8Array | null>;
};

const WORKSPACE_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isWorkspaceId(workspaceId: string): boolean {
  return WORKSPACE_ID_RE.test(workspaceId);
}

/** Resolves `key` under `root`, rejecting anything outside `root + sep`. */
function resolveInside(root: string, key: string): string | null {
  const path = resolve(root, key);
  const rootPrefix = root.endsWith(sep) ? root : `${root}${sep}`;
  return path.startsWith(rootPrefix) ? path : null;
}

export function createFsMediaStore(rootDir: string): MediaStore {
  const root = resolve(rootDir);
  return {
    async put(workspaceId, data, extension) {
      if (!isWorkspaceId(workspaceId)) {
        throw new Error("invalid media workspace");
      }
      const safeExt =
        extension && /^[a-z0-9]{1,10}$/i.test(extension)
          ? `.${extension.toLowerCase()}`
          : "";
      const key = `${workspaceId}/${randomUUID()}${safeExt}`;
      const path = resolveInside(root, key);
      if (path === null) {
        throw new Error("invalid media workspace");
      }
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, data);
      return key;
    },
    async read(workspaceId, key) {
      if (!isWorkspaceId(workspaceId)) {
        return null;
      }
      if (!key.startsWith(`${workspaceId}/`) || key.includes("..")) {
        return null;
      }
      const path = resolveInside(root, key);
      if (path === null) {
        return null;
      }
      try {
        return await readFile(path);
      } catch {
        return null;
      }
    },
  };
}
