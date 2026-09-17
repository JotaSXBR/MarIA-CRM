import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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

test("settings profile updates the user name via PATCH /me", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const patched: unknown[] = [];
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      if (url.includes("/me/workspaces")) {
        return new Response(
          JSON.stringify([
            { workspaceId, workspaceName: "Workspace", role: "admin" },
          ]),
          { status: 200 },
        );
      }
      if (url.endsWith("/me") && init?.method === "PATCH") {
        patched.push(JSON.parse(init.body as string));
        return new Response(
          JSON.stringify({
            userId: "123e4567-e89b-12d3-a456-426614174001",
            email: "user@example.com",
            name: "Novo Nome",
            isAdmin: false,
          }),
          { status: 200 },
        );
      }
      if (url.endsWith("/me")) {
        return new Response(
          JSON.stringify({
            userId: "123e4567-e89b-12d3-a456-426614174001",
            email: "user@example.com",
            name: "User",
            isAdmin: false,
          }),
          { status: 200 },
        );
      }
      return new Response("not found", { status: 404 });
    },
  );
  vi.stubGlobal("fetch", fetchMock);
  setToken("session-token");

  renderApp("/settings/profile");
  const user = userEvent.setup();
  const nameInput = (await screen.findByLabelText("Nome")) as HTMLInputElement;
  await waitFor(() => expect(nameInput.value).toBe("User"));
  await user.clear(nameInput);
  await user.type(nameInput, "Novo Nome");
  await user.click(screen.getByRole("button", { name: "Salvar" }));

  await waitFor(() => expect(patched).toEqual([{ name: "Novo Nome" }]));
});

test("login stores the session token and lands on the inbox", async () => {
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
    if (url.includes("/conversations")) {
      return new Response(JSON.stringify([]), { status: 200 });
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
    await screen.findByRole("heading", { name: "Caixa de entrada" }),
  ).toBeDefined();
});

test("pipelines board renders stages and deals for the workspace", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const pipelineId = "123e4567-e89b-12d3-a456-426614174010";
  const stageId = "123e4567-e89b-12d3-a456-426614174011";
  setToken("session-token");
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/me/workspaces")) {
      return new Response(
        JSON.stringify([
          { workspaceId, workspaceName: "Workspace", role: "admin" },
        ]),
        { status: 200 },
      );
    }
    if (url.includes(`/pipelines/${pipelineId}/stages`)) {
      return new Response(
        JSON.stringify([
          {
            id: stageId,
            pipelineId,
            name: "Novo",
            position: "a0",
            createdAt: new Date().toISOString(),
          },
        ]),
        { status: 200 },
      );
    }
    if (url.includes("/deals")) {
      return new Response(
        JSON.stringify([
          {
            id: "123e4567-e89b-12d3-a456-426614174012",
            pipelineId,
            stageId,
            title: "Proposta ACME",
            valueCents: 150000,
            contactId: null,
            companyId: null,
            position: "a0",
            createdAt: new Date().toISOString(),
          },
        ]),
        { status: 200 },
      );
    }
    if (url.includes("/pipelines")) {
      return new Response(
        JSON.stringify([
          {
            id: pipelineId,
            name: "Vendas",
            position: "a0",
            createdAt: new Date().toISOString(),
          },
        ]),
        { status: 200 },
      );
    }
    return new Response("not found", { status: 404 });
  });
  vi.stubGlobal("fetch", fetchMock);

  renderApp("/pipelines");

  expect(
    await screen.findByRole("heading", { name: "Pipelines" }),
  ).toBeDefined();
  expect(await screen.findByRole("heading", { name: "Novo" })).toBeDefined();
  expect(await screen.findByText("Proposta ACME")).toBeDefined();
  await waitFor(() =>
    expect(
      fetchMock.mock.calls.some(([input]) =>
        String(input).includes(
          `/deals?pipelineId=${pipelineId}&workspaceId=${workspaceId}`,
        ),
      ),
    ).toBe(true),
  );
});

test("clicking a deal opens the editor and saves via PATCH", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const pipelineId = "123e4567-e89b-12d3-a456-426614174010";
  const stageId = "123e4567-e89b-12d3-a456-426614174011";
  const dealId = "123e4567-e89b-12d3-a456-426614174012";
  setToken("session-token");
  const deal = {
    id: dealId,
    pipelineId,
    stageId,
    title: "Proposta ACME",
    valueCents: 150000,
    contactId: null,
    companyId: null,
    position: "a0",
    createdAt: new Date().toISOString(),
  };
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/me/workspaces")) {
        return new Response(
          JSON.stringify([
            { workspaceId, workspaceName: "Workspace", role: "admin" },
          ]),
          { status: 200 },
        );
      }
      if (url.includes(`/pipelines/${pipelineId}/stages`)) {
        return new Response(
          JSON.stringify([
            {
              id: stageId,
              pipelineId,
              name: "Novo",
              position: "a0",
              createdAt: new Date().toISOString(),
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes("/contacts")) {
        return new Response(
          JSON.stringify([
            { id: "123e4567-e89b-12d3-a456-426614174020", name: "Maria" },
          ]),
          { status: 200 },
        );
      }
      if (url.includes("/companies")) {
        return new Response(
          JSON.stringify([
            { id: "123e4567-e89b-12d3-a456-426614174021", name: "ACME" },
          ]),
          { status: 200 },
        );
      }
      if (url.includes(`/deals/${dealId}`) && init?.method === "PATCH") {
        return new Response(
          JSON.stringify({ ...deal, title: "Renamed", valueCents: 200000 }),
          { status: 200 },
        );
      }
      if (url.includes("/deals")) {
        return new Response(JSON.stringify([deal]), { status: 200 });
      }
      if (url.includes("/pipelines")) {
        return new Response(
          JSON.stringify([
            {
              id: pipelineId,
              name: "Vendas",
              position: "a0",
              createdAt: new Date().toISOString(),
            },
          ]),
          { status: 200 },
        );
      }
      return new Response("not found", { status: 404 });
    },
  );
  vi.stubGlobal("fetch", fetchMock);

  renderApp("/pipelines");
  const user = userEvent.setup();
  await user.click(await screen.findByText("Proposta ACME"));

  const dialog = await screen.findByRole("dialog");
  expect(dialog).toBeDefined();

  const titleInput = screen.getByLabelText("Título");
  await user.clear(titleInput);
  await user.type(titleInput, "Renamed");
  const valueInput = screen.getByLabelText("Valor");
  await user.clear(valueInput);
  await user.type(valueInput, "2000");
  await user.selectOptions(screen.getByLabelText("Contato"), [
    "123e4567-e89b-12d3-a456-426614174020",
  ]);
  fireEvent.submit(
    screen.getByRole("button", { name: "Salvar" }).closest("form")!,
  );

  await waitFor(() =>
    expect(
      fetchMock.mock.calls.some(([input, init]) => {
        if (!String(input).includes(`/deals/${dealId}`)) return false;
        if (init?.method !== "PATCH") return false;
        const body = JSON.parse(String(init.body)) as {
          title: string;
          valueCents: number;
          contactId: string;
          companyId: string | null;
        };
        return (
          body.title === "Renamed" &&
          body.valueCents === 200000 &&
          body.contactId === "123e4567-e89b-12d3-a456-426614174020" &&
          body.companyId === null
        );
      }),
    ).toBe(true),
  );
});

test("admin page renders sections for global admins and denies members", async () => {
  const userId = "123e4567-e89b-12d3-a456-426614174030";
  setToken("session-token");
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith("/me")) {
      return new Response(
        JSON.stringify({
          userId,
          email: "admin@example.com",
          name: "Admin",
          isAdmin: true,
        }),
        { status: 200 },
      );
    }
    if (url.includes("/me/workspaces")) {
      return new Response(JSON.stringify([]), { status: 200 });
    }
    if (url.includes("/admin/users")) {
      return new Response(
        JSON.stringify([
          {
            id: userId,
            email: "admin@example.com",
            name: "Admin",
            isAdmin: true,
            active: true,
            createdAt: new Date().toISOString(),
          },
        ]),
        { status: 200 },
      );
    }
    if (url.includes("/admin/organizations")) {
      return new Response(
        JSON.stringify([
          {
            id: "123e4567-e89b-12d3-a456-426614174031",
            name: "Org",
            createdAt: new Date().toISOString(),
          },
        ]),
        { status: 200 },
      );
    }
    if (url.includes("/admin/workspaces")) {
      return new Response(JSON.stringify([]), { status: 200 });
    }
    return new Response("not found", { status: 404 });
  });
  vi.stubGlobal("fetch", fetchMock);

  renderApp("/admin");

  expect(
    await screen.findByRole("heading", { name: "Administração" }),
  ).toBeDefined();
  expect(
    (await screen.findAllByText("admin@example.com")).length,
  ).toBeGreaterThan(0);
  expect(screen.getByRole("heading", { name: "Usuários" })).toBeDefined();
  expect(screen.getByRole("heading", { name: "Organizações" })).toBeDefined();
  expect(screen.getByRole("heading", { name: "Workspaces" })).toBeDefined();
});

test("contact detail shows deals, notes and tasks and posts a new note", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const contactId = "123e4567-e89b-12d3-a456-426614174040";
  const posted: unknown[] = [];
  setToken("session-token");
  const contact = {
    id: contactId,
    name: "Maria Silva",
    email: "maria@example.com",
    phone: null,
    createdAt: new Date().toISOString(),
  };
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      if (url.includes("/me/workspaces")) {
        return new Response(
          JSON.stringify([
            { workspaceId, workspaceName: "Workspace", role: "member" },
          ]),
          { status: 200 },
        );
      }
      if (url.endsWith("/me")) {
        return new Response(
          JSON.stringify({
            userId: "123e4567-e89b-12d3-a456-426614174041",
            email: "user@example.com",
            name: "User",
            isAdmin: false,
          }),
          { status: 200 },
        );
      }
      if (url.includes(`/contacts/${contactId}/notes`)) {
        if (init?.method === "POST") {
          posted.push(JSON.parse(init.body as string));
          return new Response(
            JSON.stringify({
              id: "123e4567-e89b-12d3-a456-426614174043",
              contactId,
              companyId: null,
              dealId: null,
              authorId: null,
              authorName: "User",
              body: "Nova nota",
              createdAt: new Date().toISOString(),
            }),
            { status: 201 },
          );
        }
        return new Response(
          JSON.stringify([
            {
              id: "123e4567-e89b-12d3-a456-426614174042",
              contactId,
              companyId: null,
              dealId: null,
              authorId: null,
              authorName: "User",
              body: "Cliente pediu retorno",
              createdAt: new Date().toISOString(),
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes(`/contacts/${contactId}/tasks`)) {
        return new Response(
          JSON.stringify([
            {
              id: "123e4567-e89b-12d3-a456-426614174044",
              contactId,
              companyId: null,
              dealId: null,
              assigneeId: null,
              assigneeName: "User",
              title: "Ligar para Maria",
              dueAt: null,
              doneAt: null,
              createdAt: new Date().toISOString(),
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes(`/contacts/${contactId}/deals`)) {
        return new Response(
          JSON.stringify([
            {
              id: "123e4567-e89b-12d3-a456-426614174045",
              pipelineId: "123e4567-e89b-12d3-a456-426614174010",
              stageId: "123e4567-e89b-12d3-a456-426614174011",
              title: "Proposta ACME",
              valueCents: 150000,
              contactId,
              companyId: null,
              position: "a0",
              stageName: "Novo",
              pipelineName: "Vendas",
              createdAt: new Date().toISOString(),
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes(`/contacts/${contactId}`)) {
        return new Response(JSON.stringify(contact), { status: 200 });
      }
      return new Response("not found", { status: 404 });
    },
  );
  vi.stubGlobal("fetch", fetchMock);

  renderApp(`/contacts/${contactId}`);

  expect(
    await screen.findByRole("heading", { name: "Maria Silva" }),
  ).toBeDefined();
  expect(await screen.findByText("Proposta ACME")).toBeDefined();
  expect(screen.getByText("Novo")).toBeDefined();
  expect(await screen.findByText("Ligar para Maria")).toBeDefined();
  expect(await screen.findByText("Cliente pediu retorno")).toBeDefined();

  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Nova nota"), "Nova nota");
  await user.click(screen.getByRole("button", { name: "Adicionar nota" }));
  await waitFor(() => expect(posted).toEqual([{ body: "Nova nota" }]));
});
