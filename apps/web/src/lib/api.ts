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

export async function api<T>(
  path: string,
  init: {
    method?: string;
    body?: unknown;
    workspaceId?: string | undefined;
  } = {},
): Promise<T> {
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
  if (response.status === 204) return undefined as T;
  if (!response.ok) throw new ApiError(response.status);
  return (await response.json()) as T;
}
