import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { afterEach, expect, test, vi } from "vitest";
import { routeTree } from "../src/router.tsx";
import { setToken } from "../src/lib/api.ts";

function renderApp(initialPath: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

test("redirects unauthenticated visitors to the login page", async () => {
  renderApp("/contacts");
  expect(await screen.findByRole("heading", { name: "Entrar" })).toBeDefined();
});

test("login stores the session token and lands on contacts", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/auth/login")) {
      return new Response(JSON.stringify({ token: "session-token" }), {
        status: 200,
      });
    }
    if (url.includes("/me/workspaces")) {
      return new Response(
        JSON.stringify([
          { workspaceId, workspaceName: "Workspace", role: "member" },
        ]),
        { status: 200 },
      );
    }
    if (url.includes("/contacts")) {
      return new Response(
        JSON.stringify([
          {
            id: "123e4567-e89b-12d3-a456-426614174001",
            name: "Maria",
            email: "maria@example.com",
            phone: null,
            createdAt: new Date().toISOString(),
          },
        ]),
        { status: 200 },
      );
    }
    return new Response("not found", { status: 404 });
  });
  vi.stubGlobal("fetch", fetchMock);

  renderApp("/login");
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText("Email"), "user@example.com");
  await user.type(screen.getByLabelText("Senha"), "password");
  await user.click(screen.getByRole("button", { name: "Entrar" }));

  expect(localStorage.getItem("maria.token")).toBe("session-token");
  expect(
    await screen.findByRole("heading", { name: "Contatos" }),
  ).toBeDefined();
  expect(await screen.findByText("Maria")).toBeDefined();
  await waitFor(() =>
    expect(
      fetchMock.mock.calls.some(([input]) =>
        String(input).includes(`/contacts?workspaceId=${workspaceId}`),
      ),
    ).toBe(true),
  );
});
