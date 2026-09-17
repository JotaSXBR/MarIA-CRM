const TOKEN_KEY = "maria.token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string | null) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export class ApiError extends Error {
  constructor(public status: number) {
    super(`API request failed with status ${status}`);
  }
}

async function request(
  path: string,
  init: {
    method?: string;
    body?: unknown;
    workspaceId?: string | undefined;
  } = {},
): Promise<Response> {
  const url = new URL(path, window.location.origin);
  if (init.workspaceId) url.searchParams.set("workspaceId", init.workspaceId);
  const token = getToken();
  const response = await fetch(url, {
    method: init.method ?? "GET",
    headers: {
      ...(init.body !== undefined
        ? { "content-type": "application/json" }
        : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : null,
  });
  if (response.status === 401) {
    setToken(null);
    throw new ApiError(401);
  }
  if (!response.ok) throw new ApiError(response.status);
  return response;
}

export async function api<T>(
  path: string,
  init: {
    method?: string;
    body?: unknown;
    workspaceId?: string | undefined;
  } = {},
): Promise<T> {
  const response = await request(path, init);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Authenticated binary fetch — <img>/<video> tags cannot set the Bearer
 * header, so media is fetched as a blob and rendered via object URL. */
export async function apiBlob(
  path: string,
  init: { workspaceId?: string | undefined } = {},
): Promise<Blob> {
  const response = await request(path, init);
  return response.blob();
}
