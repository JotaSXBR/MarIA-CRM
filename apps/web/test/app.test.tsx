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

function requestUrl(input: RequestInfo | URL) {
  return typeof input === "string"
    ? input
    : "url" in input
      ? input.url
      : input.href;
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
    const url = requestUrl(input);
    if (url.includes("/auth/login")) {
      return new Response(JSON.stringify({ token: "session-token" }), {
        status: 200,
      });
    }
    if (url.includes("/me/workspaces")) {
      return new Response(
        JSON.stringify([
          { workspaceId, workspaceName: "Workspace", role: "agent" },
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
    const url = requestUrl(input);
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
        requestUrl(input).includes(
          `/deals?pipelineId=${pipelineId}&workspaceId=${workspaceId}`,
        ),
      ),
    ).toBe(true),
  );
});

test("clicking a deal opens its detail page and edits via the editor", async () => {
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
  const dealDetail = {
    ...deal,
    stageName: "Novo",
    pipelineName: "Vendas",
    contactName: null,
    companyName: null,
  };
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
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
      if (url.includes(`/deals/${dealId}/`)) {
        return new Response("[]", { status: 200 });
      }
      if (url.includes(`/deals/${dealId}`) && init?.method === "PATCH") {
        return new Response(
          JSON.stringify({ ...deal, title: "Renamed", valueCents: 200000 }),
          { status: 200 },
        );
      }
      if (url.includes(`/deals/${dealId}`)) {
        return new Response(JSON.stringify(dealDetail), { status: 200 });
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

  await user.click(await screen.findByRole("button", { name: "Editar" }));

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
        if (!requestUrl(input).includes(`/deals/${dealId}`)) return false;
        if (init?.method !== "PATCH" || typeof init.body !== "string") {
          return false;
        }
        const body = JSON.parse(init.body) as {
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
    const url = requestUrl(input);
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
            { workspaceId, workspaceName: "Workspace", role: "agent" },
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
      if (url.includes("/tags")) {
        return new Response(JSON.stringify([]), { status: 200 });
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

test("contact detail shows assigned tags and updates assignments", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const contactId = "123e4567-e89b-12d3-a456-426614174040";
  const tagA = {
    id: "123e4567-e89b-12d3-a456-426614174050",
    name: "Prioridade",
    color: "#22c55e",
    createdAt: new Date().toISOString(),
  };
  const tagB = {
    id: "123e4567-e89b-12d3-a456-426614174051",
    name: "Cliente",
    color: null,
    createdAt: new Date().toISOString(),
  };
  const tagC = {
    id: "123e4567-e89b-12d3-a456-426614174052",
    name: "VIP",
    color: null,
    createdAt: new Date().toISOString(),
  };
  const puts: unknown[] = [];
  const posts: unknown[] = [];
  setToken("session-token");
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      if (url.includes("/me/workspaces")) {
        return new Response(
          JSON.stringify([
            { workspaceId, workspaceName: "Workspace", role: "manager" },
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
      if (url.includes(`/contacts/${contactId}/tags`)) {
        if (init?.method === "PUT") {
          const body = JSON.parse(init.body as string);
          puts.push(body);
          return new Response(
            JSON.stringify(
              (body as { tagIds: string[] }).tagIds.map((id) =>
                [tagA, tagB, tagC].find((tag) => tag.id === id),
              ),
            ),
            { status: 200 },
          );
        }
        return new Response(JSON.stringify([tagA]), { status: 200 });
      }
      if (url.includes("/tags")) {
        if (init?.method === "POST") {
          posts.push(JSON.parse(init.body as string));
          return new Response(JSON.stringify(tagC), { status: 201 });
        }
        return new Response(JSON.stringify([tagA, tagB]), { status: 200 });
      }
      if (url.includes(`/contacts/${contactId}/`)) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      if (url.includes(`/contacts/${contactId}`)) {
        return new Response(
          JSON.stringify({
            id: contactId,
            name: "Maria Silva",
            email: null,
            phone: null,
            createdAt: new Date().toISOString(),
          }),
          { status: 200 },
        );
      }
      return new Response("not found", { status: 404 });
    },
  );
  vi.stubGlobal("fetch", fetchMock);

  renderApp(`/contacts/${contactId}`);

  expect(
    await screen.findByRole("heading", { name: "Maria Silva" }),
  ).toBeDefined();
  expect(await screen.findByText("Prioridade")).toBeDefined();

  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Editar tags" }));
  await user.click(
    await screen.findByRole("menuitemcheckbox", { name: "Cliente" }),
  );
  await waitFor(() => expect(puts).toEqual([{ tagIds: [tagA.id, tagB.id] }]));

  fireEvent.change(screen.getByLabelText("Nome da nova tag"), {
    target: { value: "VIP" },
  });
  fireEvent.submit(
    screen.getByRole("button", { name: "Criar" }).closest("form")!,
  );
  await waitFor(() => expect(posts).toEqual([{ name: "VIP" }]));
  await waitFor(() =>
    expect(puts).toEqual([
      { tagIds: [tagA.id, tagB.id] },
      { tagIds: [tagA.id, tagC.id] },
    ]),
  );
});

test("contact detail edits custom attributes via PUT", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const contactId = "123e4567-e89b-12d3-a456-426614174040";
  const segment = {
    id: "123e4567-e89b-12d3-a456-426614174070",
    entityType: "contact",
    key: "segmento",
    label: "Segmento",
    type: "select",
    options: ["SMB", "Enterprise"],
    value: "SMB",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const score = {
    id: "123e4567-e89b-12d3-a456-426614174071",
    entityType: "contact",
    key: "score",
    label: "Score",
    type: "number",
    options: null,
    value: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const puts: unknown[] = [];
  setToken("session-token");
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      if (url.includes("/me/workspaces")) {
        return new Response(
          JSON.stringify([
            { workspaceId, workspaceName: "Workspace", role: "agent" },
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
      if (url.includes(`/contacts/${contactId}/attributes`)) {
        if (init?.method === "PUT") {
          puts.push(JSON.parse(init.body as string));
          return new Response(
            JSON.stringify([
              { ...segment, value: "Enterprise" },
              { ...score, value: 42 },
            ]),
            { status: 200 },
          );
        }
        return new Response(JSON.stringify([segment, score]), {
          status: 200,
        });
      }
      if (url.includes(`/contacts/${contactId}/`)) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      if (url.includes("/tags")) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      if (url.includes(`/contacts/${contactId}`)) {
        return new Response(
          JSON.stringify({
            id: contactId,
            name: "Maria Silva",
            email: null,
            phone: null,
            createdAt: new Date().toISOString(),
          }),
          { status: 200 },
        );
      }
      return new Response("not found", { status: 404 });
    },
  );
  vi.stubGlobal("fetch", fetchMock);

  renderApp(`/contacts/${contactId}`);

  expect(
    await screen.findByRole("heading", { name: "Maria Silva" }),
  ).toBeDefined();
  const segmentSelect = await screen.findByLabelText("Segmento");
  expect((segmentSelect as HTMLSelectElement).value).toBe("SMB");
  expect(screen.getByLabelText("Score")).toBeDefined();

  // Nothing to save until a value actually changes.
  expect(
    screen.getByRole("button", { name: "Salvar atributos" }),
  ).toHaveProperty("disabled", true);

  const user = userEvent.setup();
  await user.selectOptions(segmentSelect, "Enterprise");
  await user.type(screen.getByLabelText("Score"), "42");
  fireEvent.submit(
    screen.getByRole("button", { name: "Salvar atributos" }).closest("form")!,
  );
  await waitFor(() =>
    expect(puts).toEqual([
      {
        values: [
          { attributeId: segment.id, value: "Enterprise" },
          { attributeId: score.id, value: 42 },
        ],
      },
    ]),
  );
});

test("search page groups results and links to entity details", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const contactId = "123e4567-e89b-12d3-a456-426614174040";
  const companyId = "123e4567-e89b-12d3-a456-426614174050";
  const dealId = "123e4567-e89b-12d3-a456-426614174060";
  const queries: string[] = [];
  setToken("session-token");
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = requestUrl(input);
    if (url.includes("/me/workspaces")) {
      return new Response(
        JSON.stringify([
          { workspaceId, workspaceName: "Workspace", role: "agent" },
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
    if (url.includes("/search")) {
      queries.push(url);
      return new Response(
        JSON.stringify({
          contacts: [
            { id: contactId, name: "Maria Silva", email: "maria@x.com" },
          ],
          companies: [{ id: companyId, name: "ACME" }],
          deals: [{ id: dealId, title: "Proposta ACME" }],
        }),
        { status: 200 },
      );
    }
    return new Response("not found", { status: 404 });
  });
  vi.stubGlobal("fetch", fetchMock);

  renderApp("/search?q=maria");

  expect(await screen.findByRole("heading", { name: "Busca" })).toBeDefined();
  expect(
    await screen.findByRole("link", { name: /Maria Silva/ }),
  ).toBeDefined();
  expect(await screen.findByRole("link", { name: "ACME" })).toBeDefined();
  expect(
    await screen.findByRole("link", { name: "Proposta ACME" }),
  ).toBeDefined();
  expect(queries.some((url) => url.includes("q=maria"))).toBe(true);

  // Submitting a new term navigates to /search?q=… and refetches.
  const user = userEvent.setup();
  const input = screen.getByLabelText("Termo de busca");
  await user.clear(input);
  await user.type(input, "acme");
  fireEvent.submit(
    screen.getByRole("button", { name: "Buscar" }).closest("form")!,
  );
  await waitFor(() =>
    expect(queries.some((url) => url.includes("q=acme"))).toBe(true),
  );
});

test("company detail shows linked contacts, deals, tasks and notes", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const companyId = "123e4567-e89b-12d3-a456-426614174050";
  const contactId = "123e4567-e89b-12d3-a456-426614174051";
  const postedNotes: unknown[] = [];
  const postedTasks: unknown[] = [];
  setToken("session-token");
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      if (url.includes("/me/workspaces")) {
        return new Response(
          JSON.stringify([
            { workspaceId, workspaceName: "Workspace", role: "agent" },
          ]),
          { status: 200 },
        );
      }
      if (url.includes(`/companies/${companyId}/contacts`)) {
        return new Response(
          JSON.stringify([
            {
              id: contactId,
              name: "Maria Silva",
              email: "maria@example.com",
              phone: null,
              companyId,
              createdAt: new Date().toISOString(),
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes(`/companies/${companyId}/deals`)) {
        return new Response(
          JSON.stringify([
            {
              id: "123e4567-e89b-12d3-a456-426614174052",
              pipelineId: "123e4567-e89b-12d3-a456-426614174010",
              stageId: "123e4567-e89b-12d3-a456-426614174011",
              title: "Proposta ACME",
              valueCents: 150000,
              contactId,
              companyId,
              position: "a0",
              stageName: "Novo",
              pipelineName: "Vendas",
              createdAt: new Date().toISOString(),
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes(`/companies/${companyId}/tasks`)) {
        if (init?.method === "POST") {
          postedTasks.push(JSON.parse(init.body as string));
          return new Response(
            JSON.stringify({
              id: "123e4567-e89b-12d3-a456-426614174055",
              contactId: null,
              companyId,
              dealId: null,
              assigneeId: null,
              assigneeName: "User",
              title: "Nova tarefa",
              dueAt: null,
              doneAt: null,
              createdAt: new Date().toISOString(),
            }),
            { status: 201 },
          );
        }
        return new Response(
          JSON.stringify([
            {
              id: "123e4567-e89b-12d3-a456-426614174054",
              contactId: null,
              companyId,
              dealId: null,
              assigneeId: null,
              assigneeName: "User",
              title: "Enviar proposta",
              dueAt: null,
              doneAt: null,
              createdAt: new Date().toISOString(),
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes(`/companies/${companyId}/notes`)) {
        if (init?.method === "POST") {
          postedNotes.push(JSON.parse(init.body as string));
          return new Response(
            JSON.stringify({
              id: "123e4567-e89b-12d3-a456-426614174056",
              contactId: null,
              companyId,
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
              id: "123e4567-e89b-12d3-a456-426614174053",
              contactId: null,
              companyId,
              dealId: null,
              authorId: null,
              authorName: "User",
              body: "Cliente estratégico",
              createdAt: new Date().toISOString(),
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes("/tags")) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      if (url.includes(`/companies/${companyId}`)) {
        return new Response(
          JSON.stringify({
            id: companyId,
            name: "ACME",
            createdAt: new Date().toISOString(),
          }),
          { status: 200 },
        );
      }
      return new Response("not found", { status: 404 });
    },
  );
  vi.stubGlobal("fetch", fetchMock);

  renderApp(`/companies/${companyId}`);

  expect(await screen.findByRole("heading", { name: "ACME" })).toBeDefined();
  expect(
    await screen.findByRole("link", { name: "Maria Silva" }),
  ).toBeDefined();
  expect(await screen.findByText("Proposta ACME")).toBeDefined();
  expect(screen.getByText("Novo")).toBeDefined();
  expect(await screen.findByText("Enviar proposta")).toBeDefined();
  expect(await screen.findByText("Cliente estratégico")).toBeDefined();

  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Nova nota"), "Nova nota");
  fireEvent.submit(
    screen.getByRole("button", { name: "Adicionar nota" }).closest("form")!,
  );
  await waitFor(() => expect(postedNotes).toEqual([{ body: "Nova nota" }]));

  await user.type(screen.getByLabelText("Título da tarefa"), "Nova tarefa");
  fireEvent.submit(
    screen.getByRole("button", { name: "Adicionar tarefa" }).closest("form")!,
  );
  await waitFor(() =>
    expect(postedTasks).toEqual([{ title: "Nova tarefa", dueAt: null }]),
  );
});

test("deal detail shows named deal, tasks and notes", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const dealId = "123e4567-e89b-12d3-a456-426614174060";
  const contactId = "123e4567-e89b-12d3-a456-426614174061";
  const companyId = "123e4567-e89b-12d3-a456-426614174062";
  const posted: unknown[] = [];
  setToken("session-token");
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      if (url.includes("/me/workspaces")) {
        return new Response(
          JSON.stringify([
            { workspaceId, workspaceName: "Workspace", role: "agent" },
          ]),
          { status: 200 },
        );
      }
      if (url.includes(`/deals/${dealId}/notes`)) {
        if (init?.method === "POST") {
          posted.push(JSON.parse(init.body as string));
          return new Response(
            JSON.stringify({
              id: "123e4567-e89b-12d3-a456-426614174063",
              contactId: null,
              companyId: null,
              dealId,
              authorId: null,
              authorName: null,
              body: "Nova nota",
              createdAt: new Date().toISOString(),
            }),
            { status: 201 },
          );
        }
        return new Response(
          JSON.stringify([
            {
              id: "123e4567-e89b-12d3-a456-426614174064",
              contactId: null,
              companyId: null,
              dealId,
              authorId: null,
              authorName: "User",
              body: "Cliente pediu retorno",
              createdAt: new Date().toISOString(),
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes(`/deals/${dealId}/tasks`)) {
        return new Response(
          JSON.stringify([
            {
              id: "123e4567-e89b-12d3-a456-426614174065",
              contactId: null,
              companyId: null,
              dealId,
              assigneeId: null,
              assigneeName: "User",
              title: "Enviar proposta",
              dueAt: null,
              doneAt: null,
              createdAt: new Date().toISOString(),
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes("/tags")) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      if (url.includes(`/deals/${dealId}`)) {
        return new Response(
          JSON.stringify({
            id: dealId,
            pipelineId: "123e4567-e89b-12d3-a456-426614174010",
            stageId: "123e4567-e89b-12d3-a456-426614174011",
            title: "Proposta ACME",
            valueCents: 150000,
            contactId,
            companyId,
            position: "a0",
            stageName: "Novo",
            pipelineName: "Vendas",
            contactName: "Maria Silva",
            companyName: "ACME",
            createdAt: new Date().toISOString(),
          }),
          { status: 200 },
        );
      }
      return new Response("not found", { status: 404 });
    },
  );
  vi.stubGlobal("fetch", fetchMock);

  renderApp(`/deals/${dealId}`);

  expect(
    await screen.findByRole("heading", { name: "Proposta ACME" }),
  ).toBeDefined();
  expect(screen.getByText("Novo")).toBeDefined();
  expect(
    await screen.findByRole("button", { name: "Maria Silva" }),
  ).toBeDefined();
  expect(await screen.findByRole("button", { name: "ACME" })).toBeDefined();
  expect(await screen.findByText("Enviar proposta")).toBeDefined();
  expect(await screen.findByText("Cliente pediu retorno")).toBeDefined();

  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Nova nota"), "Nova nota");
  await user.click(screen.getByRole("button", { name: "Adicionar nota" }));
  await waitFor(() => expect(posted).toEqual([{ body: "Nova nota" }]));
});

test("anonymous visitors land on /setup while the install is empty", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = requestUrl(input);
    if (url.includes("/setup/status")) {
      return new Response(
        JSON.stringify({ setupRequired: true, tokenRequired: true }),
        { status: 200 },
      );
    }
    return new Response("not found", { status: 404 });
  });
  vi.stubGlobal("fetch", fetchMock);

  renderApp("/login");
  expect(
    await screen.findByRole("heading", { name: "Criar a conta mestre" }),
  ).toBeDefined();
  expect(screen.getByLabelText("Token de instalação")).toBeDefined();
});

test("setup creates the master account and lands on the inbox", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const posted: unknown[] = [];
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      if (url.includes("/setup/status")) {
        return new Response(
          JSON.stringify({ setupRequired: true, tokenRequired: true }),
          { status: 200 },
        );
      }
      if (url.endsWith("/setup") && init?.method === "POST") {
        posted.push(JSON.parse(init.body as string));
        return new Response(JSON.stringify({ token: "session-token" }), {
          status: 201,
        });
      }
      if (url.includes("/me/workspaces")) {
        return new Response(
          JSON.stringify([
            { workspaceId, workspaceName: "Acme", role: "admin" },
          ]),
          { status: 200 },
        );
      }
      if (url.includes("/conversations")) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      if (url.includes("/contacts")) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      return new Response("not found", { status: 404 });
    },
  );
  vi.stubGlobal("fetch", fetchMock);

  renderApp("/setup?token=boot-token");
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText("Nome"), "Master");
  await user.type(screen.getByLabelText("Email"), "master@example.com");
  await user.type(screen.getByLabelText("Senha"), "master-password");
  await user.type(screen.getByLabelText("Nome do workspace"), "Acme");
  await user.click(screen.getByRole("button", { name: "Concluir instalação" }));

  await waitFor(() =>
    expect(posted).toEqual([
      {
        name: "Master",
        email: "master@example.com",
        password: "master-password",
        workspaceName: "Acme",
        token: "boot-token",
      },
    ]),
  );
  expect(localStorage.getItem("maria.token")).toBe("session-token");
  expect(
    await screen.findByRole("heading", { name: "Caixa de entrada" }),
  ).toBeDefined();
});

test("/setup redirects to login once the install is complete", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = requestUrl(input);
    if (url.includes("/setup/status")) {
      return new Response(
        JSON.stringify({ setupRequired: false, tokenRequired: true }),
        { status: 200 },
      );
    }
    return new Response("not found", { status: 404 });
  });
  vi.stubGlobal("fetch", fetchMock);

  renderApp("/setup");
  expect(await screen.findByRole("heading", { name: "Entrar" })).toBeDefined();
});

test("invite acceptance creates the account and lands on the inbox", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const posted: unknown[] = [];
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      if (url.endsWith("/invitations/invite-token")) {
        return new Response(
          JSON.stringify({
            email: "agent@example.com",
            workspaceId,
            workspaceName: "Acme",
            role: "agent",
            expiresAt: new Date().toISOString(),
          }),
          { status: 200 },
        );
      }
      if (url.endsWith("/invitations/invite-token/accept")) {
        posted.push(JSON.parse(init!.body as string));
        return new Response(JSON.stringify({ token: "session-token" }), {
          status: 201,
        });
      }
      if (url.includes("/me/workspaces")) {
        return new Response(
          JSON.stringify([
            { workspaceId, workspaceName: "Acme", role: "agent" },
          ]),
          { status: 200 },
        );
      }
      if (url.endsWith("/me")) {
        return new Response(
          JSON.stringify({
            userId: "123e4567-e89b-12d3-a456-426614174001",
            email: "agent@example.com",
            name: "Agent",
            isAdmin: false,
          }),
          { status: 200 },
        );
      }
      if (url.includes("/conversations") || url.includes("/contacts")) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      return new Response("not found", { status: 404 });
    },
  );
  vi.stubGlobal("fetch", fetchMock);

  renderApp("/invite/invite-token");
  expect(
    await screen.findByRole("heading", { name: "Convite para Acme" }),
  ).toBeDefined();
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Nome"), "Agent");
  await user.type(screen.getByLabelText("Senha"), "agent-password");
  await user.click(
    screen.getByRole("button", { name: "Criar conta e entrar" }),
  );

  await waitFor(() =>
    expect(posted).toEqual([{ name: "Agent", password: "agent-password" }]),
  );
  expect(localStorage.getItem("maria.token")).toBe("session-token");
  expect(localStorage.getItem("maria.workspace")).toBe(workspaceId);
  expect(
    await screen.findByRole("heading", { name: "Caixa de entrada" }),
  ).toBeDefined();
});

test("invite page explains consumed and invalid links", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = requestUrl(input);
    if (url.endsWith("/invitations/gone")) {
      return new Response(null, { status: 410 });
    }
    return new Response(null, { status: 404 });
  });
  vi.stubGlobal("fetch", fetchMock);

  renderApp("/invite/gone");
  expect(
    await screen.findByRole("heading", { name: "Convite indisponível" }),
  ).toBeDefined();
  expect(await screen.findByRole("alert")).toHaveProperty(
    "textContent",
    expect.stringContaining("expirou"),
  );

  cleanup();
  renderApp("/invite/unknown");
  expect(await screen.findByRole("alert")).toHaveProperty(
    "textContent",
    expect.stringContaining("inválido"),
  );
});

test("settings members page lists the team and issues invite links", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  setToken("session-token");
  const posted: unknown[] = [];
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      if (url.includes("/me/workspaces")) {
        return new Response(
          JSON.stringify([
            { workspaceId, workspaceName: "Acme", role: "admin" },
          ]),
          { status: 200 },
        );
      }
      if (url.endsWith("/me")) {
        return new Response(
          JSON.stringify({
            userId: "123e4567-e89b-12d3-a456-426614174001",
            email: "admin@example.com",
            name: "Admin",
            isAdmin: false,
          }),
          { status: 200 },
        );
      }
      if (url.includes("/members")) {
        return new Response(
          JSON.stringify([
            {
              id: "123e4567-e89b-12d3-a456-426614174002",
              userId: "123e4567-e89b-12d3-a456-426614174001",
              role: "admin",
              email: "admin@example.com",
              name: "Admin",
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes("/invitations") && init?.method === "POST") {
        posted.push(JSON.parse(init.body as string));
        return new Response(
          JSON.stringify({
            id: "123e4567-e89b-12d3-a456-426614174003",
            token: "plaintext-token",
            expiresAt: new Date().toISOString(),
          }),
          { status: 201 },
        );
      }
      if (url.includes("/invitations")) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      return new Response("not found", { status: 404 });
    },
  );
  vi.stubGlobal("fetch", fetchMock);

  renderApp("/settings/members");
  expect(await screen.findAllByText("Equipe")).not.toHaveLength(0);
  expect(await screen.findByText("admin@example.com")).toBeDefined();

  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email"), "novo@example.com");
  await user.click(screen.getByRole("button", { name: "Criar convite" }));

  await waitFor(() =>
    expect(posted).toEqual([{ email: "novo@example.com", role: "agent" }]),
  );
  expect(await screen.findByText(/\/invite\/plaintext-token/)).toBeDefined();
});

test("settings members page manages only ranks below the actor", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  setToken("session-token");
  const calls: { method: string; url: string; body?: unknown }[] = [];
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      const method = init?.method ?? "GET";
      if (url.includes("/me/workspaces")) {
        return new Response(
          JSON.stringify([
            { workspaceId, workspaceName: "Acme", role: "manager" },
          ]),
          { status: 200 },
        );
      }
      if (url.endsWith("/me")) {
        return new Response(
          JSON.stringify({
            userId: "123e4567-e89b-12d3-a456-426614174001",
            email: "manager@example.com",
            name: "Manager",
            isAdmin: false,
          }),
          { status: 200 },
        );
      }
      if (url.match(/\/members\/[^?]+/) && method !== "GET") {
        calls.push({
          method,
          url,
          body: init?.body ? JSON.parse(init.body as string) : undefined,
        });
        return new Response(null, { status: 204 });
      }
      if (url.includes("/members")) {
        return new Response(
          JSON.stringify([
            {
              id: "123e4567-e89b-12d3-a456-426614174010",
              userId: "123e4567-e89b-12d3-a456-426614174020",
              role: "admin",
              email: "admin@example.com",
              name: "Admin",
            },
            {
              id: "123e4567-e89b-12d3-a456-426614174011",
              userId: "123e4567-e89b-12d3-a456-426614174021",
              role: "manager",
              email: "peer@example.com",
              name: "Peer",
            },
            {
              id: "123e4567-e89b-12d3-a456-426614174012",
              userId: "123e4567-e89b-12d3-a456-426614174022",
              role: "agent",
              email: "agent@example.com",
              name: "Agent",
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes("/invitations")) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      return new Response("not found", { status: 404 });
    },
  );
  vi.stubGlobal("fetch", fetchMock);

  renderApp("/settings/members");
  // A manager manages agent/viewer only: the admin and the peer-manager rows
  // render the static badge, the agent row gets the role select + remove.
  expect(await screen.findByText("agent@example.com")).toBeDefined();
  expect(screen.getAllByLabelText(/^Papel de /)).toHaveLength(1);
  expect(screen.getAllByLabelText(/^Remover /)).toHaveLength(1);
  // The grant options exclude manager/admin for a manager actor.
  const roleSelect = screen.getByLabelText("Papel de agent@example.com");
  expect(roleSelect).toHaveProperty("children.length", 2);

  const user = userEvent.setup();
  await user.selectOptions(roleSelect, "viewer");
  await waitFor(() =>
    expect(calls).toContainEqual(
      expect.objectContaining({
        method: "PATCH",
        body: { role: "viewer" },
      }),
    ),
  );
  await user.click(screen.getByLabelText("Remover agent@example.com"));
  await waitFor(() =>
    expect(calls).toContainEqual(expect.objectContaining({ method: "DELETE" })),
  );
});

test("a member of a non-onboarded workspace is routed to the wizard", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = requestUrl(input);
    if (url.includes("/me/workspaces")) {
      return new Response(
        JSON.stringify([
          {
            workspaceId,
            workspaceName: "Workspace",
            role: "admin",
            onboarded: false,
          },
        ]),
        { status: 200 },
      );
    }
    if (url.includes("/onboarding")) {
      return new Response(
        JSON.stringify({
          workspaceName: "Workspace",
          onboardedAt: null,
          steps: [
            { id: "basics", status: "pending" },
            { id: "channel", status: "pending" },
            { id: "team", status: "pending" },
            { id: "review", status: "pending" },
          ],
        }),
        { status: 200 },
      );
    }
    return new Response("not found", { status: 404 });
  });
  vi.stubGlobal("fetch", fetchMock);
  setToken("session-token");

  renderApp("/inbox");
  expect(
    await screen.findByRole("heading", { name: "Configure Workspace" }),
  ).toBeDefined();
  expect(screen.getByText("Sobre o workspace")).toBeDefined();
  expect(screen.getByText("Conectar o WhatsApp")).toBeDefined();
  expect(screen.getByText("Convidar a equipe")).toBeDefined();
  expect(screen.getByText("Revisar e concluir")).toBeDefined();
});

test("the onboarding wizard saves basics and completes the flow", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const calls: { url: string; method: string; body?: unknown }[] = [];
  let basicsDone = false;
  let onboarded = false;
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      const method = init?.method ?? "GET";
      calls.push({
        url,
        method,
        body: init?.body ? JSON.parse(init.body as string) : undefined,
      });
      if (url.includes("/me/workspaces")) {
        return new Response(
          JSON.stringify([
            {
              workspaceId,
              workspaceName: "Workspace",
              role: "admin",
              onboarded,
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes("/onboarding/complete")) {
        onboarded = true;
        return new Response(
          JSON.stringify({ onboardedAt: new Date().toISOString() }),
          { status: 200 },
        );
      }
      if (url.includes("/onboarding/steps/basics")) {
        basicsDone = true;
        return new Response("{}", { status: 200 });
      }
      if (url.includes("/onboarding")) {
        return new Response(
          JSON.stringify({
            workspaceName: "Workspace",
            onboardedAt: null,
            steps: [
              {
                id: "basics",
                status: basicsDone ? "done" : "pending",
                ...(basicsDone ? { data: { niche: "clínica" } } : {}),
              },
              { id: "channel", status: "skipped" },
              { id: "team", status: "skipped" },
              { id: "review", status: "pending" },
            ],
          }),
          { status: 200 },
        );
      }
      if (url.includes("/conversations")) {
        return new Response(JSON.stringify([]), { status: 200 });
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

  renderApp("/onboarding");
  const user = userEvent.setup();
  const nicheInput = await screen.findByLabelText("Nicho de atuação");
  await user.type(nicheInput, "clínica");
  await user.click(screen.getByRole("button", { name: "Salvar e continuar" }));
  await waitFor(() =>
    expect(calls).toContainEqual(
      expect.objectContaining({
        method: "PATCH",
        body: { status: "done", data: { niche: "clínica" } },
      }),
    ),
  );

  await user.click(
    await screen.findByRole("button", { name: "Concluir e entrar" }),
  );
  await waitFor(() =>
    expect(calls).toContainEqual(
      expect.objectContaining({
        url: expect.stringContaining("/onboarding/complete"),
        method: "POST",
      }),
    ),
  );
});

test("a viewer sees onboarding progress without edit controls", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = requestUrl(input);
    if (url.includes("/me/workspaces")) {
      return new Response(
        JSON.stringify([
          {
            workspaceId,
            workspaceName: "Workspace",
            role: "viewer",
            onboarded: false,
          },
        ]),
        { status: 200 },
      );
    }
    if (url.includes("/onboarding")) {
      return new Response(
        JSON.stringify({
          workspaceName: "Workspace",
          onboardedAt: null,
          steps: [
            { id: "basics", status: "done", data: { niche: "clínica" } },
            { id: "channel", status: "pending" },
            { id: "team", status: "pending" },
            { id: "review", status: "pending" },
          ],
        }),
        { status: 200 },
      );
    }
    return new Response("not found", { status: 404 });
  });
  vi.stubGlobal("fetch", fetchMock);
  setToken("session-token");

  renderApp("/onboarding");
  expect(
    await screen.findByText(/administrador ou manager precisa concluir/i),
  ).toBeDefined();
  expect(screen.queryByLabelText("Nicho de atuação")).toBeNull();
  expect(
    screen.queryByRole("button", { name: "Concluir e entrar" }),
  ).toBeNull();
});

test("inbox queues filter conversations and agents claim or release ownership", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const userId = "123e4567-e89b-12d3-a456-426614174001";
  const conversationId = "123e4567-e89b-12d3-a456-426614174010";
  const calls: { url: string; method: string; body?: unknown }[] = [];
  let assigned: string | null = null;
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      const method = init?.method ?? "GET";
      calls.push({
        url,
        method,
        body: init?.body ? JSON.parse(init.body as string) : undefined,
      });
      if (url.includes("/me/workspaces")) {
        return new Response(
          JSON.stringify([
            {
              workspaceId,
              workspaceName: "Workspace",
              role: "agent",
              onboarded: true,
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes("/assignment") && method === "PATCH") {
        assigned = (init?.body ? JSON.parse(init.body as string) : {})
          .assigneeId;
        return new Response("{}", { status: 200 });
      }
      if (url.includes("/assignments")) {
        return new Response(
          JSON.stringify([
            {
              id: "123e4567-e89b-12d3-a456-426614174011",
              conversationId,
              assignedUserId: userId,
              assignedUserName: "User",
              assignedBy: "123e4567-e89b-12d3-a456-426614174002",
              assignedByName: "Gerente",
              createdAt: "2026-01-01T00:00:00Z",
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes("/conversations")) {
        return new Response(
          JSON.stringify([
            {
              id: conversationId,
              workspaceId,
              channelInstanceId: "123e4567-e89b-12d3-a456-426614174012",
              contactId: null,
              contactName: "Maria",
              providerThreadId: "55119999@c.us",
              assignedUserId: assigned,
              assignedUserName: assigned ? "User" : null,
              assignedAt: assigned ? "2026-01-01T00:00:00Z" : null,
              epoch: 1,
              createdAt: "2026-01-01T00:00:00Z",
              updatedAt: "2026-01-01T00:00:00Z",
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes("/members")) {
        return new Response(
          JSON.stringify([
            {
              id: "123e4567-e89b-12d3-a456-426614174013",
              userId,
              role: "agent",
              email: "user@example.com",
              name: "User",
            },
          ]),
          { status: 200 },
        );
      }
      if (url.endsWith("/me")) {
        return new Response(
          JSON.stringify({
            userId,
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

  renderApp("/inbox");
  const user = userEvent.setup();

  // Queue tabs refetch with the filter in the query string.
  await user.click(await screen.findByRole("tab", { name: "Minhas" }));
  await waitFor(() =>
    expect(calls).toContainEqual(
      expect.objectContaining({
        url: expect.stringContaining("queue=mine"),
      }),
    ),
  );
  await user.click(screen.getByRole("tab", { name: "Sem responsável" }));
  await waitFor(() =>
    expect(calls).toContainEqual(
      expect.objectContaining({
        url: expect.stringContaining("queue=unassigned"),
      }),
    ),
  );
  await user.click(screen.getByRole("tab", { name: "Todas" }));

  // An agent sees "Assumir" on an unassigned conversation.
  await user.click(await screen.findByText("Maria"));
  await user.click(await screen.findByRole("button", { name: "Assumir" }));
  await waitFor(() =>
    expect(calls).toContainEqual(
      expect.objectContaining({
        url: expect.stringContaining(
          `/conversations/${conversationId}/assignment`,
        ),
        method: "PATCH",
        body: { assigneeId: userId },
      }),
    ),
  );

  // After claiming, the agent can release it.
  await user.click(await screen.findByRole("button", { name: "Liberar" }));
  await waitFor(() =>
    expect(calls).toContainEqual(
      expect.objectContaining({
        method: "PATCH",
        body: { assigneeId: null },
      }),
    ),
  );

  // The audit history renders behind the toggle.
  await user.click(
    screen.getByRole("button", { name: "Histórico de atribuição" }),
  );
  expect(await screen.findByText(/Atribuída a User por Gerente/)).toBeDefined();
});

test("inbox composer sends internal notes and inserts quick replies", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const userId = "123e4567-e89b-12d3-a456-426614174001";
  const conversationId = "123e4567-e89b-12d3-a456-426614174010";
  const calls: { url: string; method: string; body?: unknown }[] = [];
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      const method = init?.method ?? "GET";
      calls.push({
        url,
        method,
        body: init?.body ? JSON.parse(init.body as string) : undefined,
      });
      if (url.includes("/me/workspaces")) {
        return new Response(
          JSON.stringify([
            {
              workspaceId,
              workspaceName: "Workspace",
              role: "agent",
              onboarded: true,
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes("/notes") && method === "POST") {
        return new Response(
          JSON.stringify({
            id: "123e4567-e89b-12d3-a456-426614174020",
            workspaceId,
            conversationId,
            providerMessageId: null,
            kind: "note",
            direction: "internal",
            status: "note",
            authorUserId: userId,
            authorName: "User",
            contentType: "text",
            body: "Cliente pediu retorno às 15h.",
            hasMedia: false,
            mediaMime: null,
            mediaFilename: null,
            createdAt: "2026-01-01T00:00:00Z",
          }),
          { status: 201 },
        );
      }
      if (url.includes("/quick-replies")) {
        return new Response(
          JSON.stringify([
            {
              id: "123e4567-e89b-12d3-a456-426614174021",
              title: "Boas-vindas",
              shortcut: "saudacao",
              body: "Olá! Como posso ajudar?",
              createdBy: userId,
              createdAt: "2026-01-01T00:00:00Z",
              updatedAt: "2026-01-01T00:00:00Z",
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes("/messages")) {
        return new Response(
          JSON.stringify([
            {
              id: "123e4567-e89b-12d3-a456-426614174022",
              workspaceId,
              conversationId,
              providerMessageId: "waha-1",
              kind: "message",
              direction: "inbound",
              status: "received",
              authorUserId: null,
              authorName: null,
              contentType: "text",
              body: "oi",
              hasMedia: false,
              mediaMime: null,
              mediaFilename: null,
              createdAt: "2026-01-01T00:00:00Z",
            },
            {
              id: "123e4567-e89b-12d3-a456-426614174023",
              workspaceId,
              conversationId,
              providerMessageId: null,
              kind: "note",
              direction: "internal",
              status: "note",
              authorUserId: userId,
              authorName: "User",
              contentType: "text",
              body: "Verificar endereço antes de enviar.",
              hasMedia: false,
              mediaMime: null,
              mediaFilename: null,
              createdAt: "2026-01-01T00:01:00Z",
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes("/conversations")) {
        return new Response(
          JSON.stringify([
            {
              id: conversationId,
              workspaceId,
              channelInstanceId: "123e4567-e89b-12d3-a456-426614174012",
              contactId: null,
              contactName: "Maria",
              providerThreadId: "55119999@c.us",
              assignedUserId: userId,
              assignedUserName: "User",
              assignedAt: "2026-01-01T00:00:00Z",
              epoch: 1,
              createdAt: "2026-01-01T00:00:00Z",
              updatedAt: "2026-01-01T00:00:00Z",
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes("/members")) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      if (url.endsWith("/me")) {
        return new Response(
          JSON.stringify({
            userId,
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

  renderApp("/inbox");
  const user = userEvent.setup();
  await user.click(await screen.findByText("Maria"));

  // The existing note renders as a distinct card, not a channel bubble.
  expect(await screen.findByText("Nota interna · User")).toBeDefined();
  expect(screen.getByText("Verificar endereço antes de enviar.")).toBeDefined();

  // The note tab posts to /notes instead of the channel send path.
  await user.click(screen.getByRole("tab", { name: "Nota interna" }));
  const noteInput = await screen.findByLabelText("Nota interna");
  await user.type(noteInput, "Cliente pediu retorno às 15h.");
  await user.click(screen.getByRole("button", { name: "Adicionar nota" }));
  await waitFor(() =>
    expect(calls).toContainEqual(
      expect.objectContaining({
        url: expect.stringContaining(`/conversations/${conversationId}/notes`),
        method: "POST",
        body: { body: "Cliente pediu retorno às 15h." },
      }),
    ),
  );

  // Back in reply mode, the quick-reply picker fills the draft.
  await user.click(screen.getByRole("tab", { name: "Responder" }));
  await user.click(screen.getByRole("button", { name: "Resposta rápida" }));
  await user.click(await screen.findByText("Boas-vindas"));
  expect((screen.getByLabelText("Mensagem") as HTMLInputElement).value).toBe(
    "Olá! Como posso ajudar?",
  );
});

test("inbox context panel links a contact and shows CRM data", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const userId = "123e4567-e89b-12d3-a456-426614174001";
  const conversationId = "123e4567-e89b-12d3-a456-426614174010";
  const contactId = "123e4567-e89b-12d3-a456-426614174030";
  const companyId = "123e4567-e89b-12d3-a456-426614174031";
  let linked = false;
  const calls: { url: string; method: string; body?: unknown }[] = [];
  const conversation = () => ({
    id: conversationId,
    workspaceId,
    channelInstanceId: "123e4567-e89b-12d3-a456-426614174012",
    contactId: linked ? contactId : null,
    contactName: linked ? "Ana" : null,
    providerThreadId: "55119999@c.us",
    assignedUserId: userId,
    assignedUserName: "User",
    assignedAt: "2026-01-01T00:00:00Z",
    epoch: 1,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  });
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      const method = init?.method ?? "GET";
      calls.push({
        url,
        method,
        body: init?.body ? JSON.parse(init.body as string) : undefined,
      });
      if (url.includes("/me/workspaces")) {
        return new Response(
          JSON.stringify([
            {
              workspaceId,
              workspaceName: "Workspace",
              role: "agent",
              onboarded: true,
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes(`/conversations/${conversationId}/contact`)) {
        linked =
          (init?.body ? JSON.parse(init.body as string) : {}).contactId !==
          null;
        return new Response(JSON.stringify(conversation()), { status: 200 });
      }
      if (url.includes(`/contacts/${contactId}/deals`)) {
        return new Response(
          JSON.stringify([
            {
              id: "123e4567-e89b-12d3-a456-426614174040",
              title: "Proposta anual",
              valueCents: 120000,
              stageName: "Negociação",
              pipelineName: "Vendas",
              contactName: "Ana",
              companyName: "Empresa X",
              createdAt: "2026-01-01T00:00:00Z",
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes(`/contacts/${contactId}/tasks`)) {
        return new Response(
          JSON.stringify([
            {
              id: "123e4567-e89b-12d3-a456-426614174041",
              title: "Retornar ligação",
              dueAt: "2026-01-02T00:00:00Z",
              doneAt: null,
              assigneeName: "User",
              createdAt: "2026-01-01T00:00:00Z",
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes(`/companies/${companyId}`)) {
        return new Response(
          JSON.stringify({
            id: companyId,
            name: "Empresa X",
            createdAt: "2026-01-01T00:00:00Z",
          }),
          { status: 200 },
        );
      }
      if (url.includes(`/contacts/${contactId}`)) {
        return new Response(
          JSON.stringify({
            id: contactId,
            name: "Ana",
            email: "ana@example.com",
            phone: "+551199990001",
            companyId,
            createdAt: "2026-01-01T00:00:00Z",
          }),
          { status: 200 },
        );
      }
      if (url.includes("/contacts")) {
        return new Response(
          JSON.stringify([
            {
              id: contactId,
              name: "Ana",
              email: "ana@example.com",
              phone: "+551199990001",
              companyId,
              createdAt: "2026-01-01T00:00:00Z",
            },
          ]),
          { status: 200 },
        );
      }
      if (url.includes("/conversations")) {
        return new Response(JSON.stringify([conversation()]), { status: 200 });
      }
      if (
        url.includes("/members") ||
        url.includes("/quick-replies") ||
        url.includes("/messages")
      ) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      if (url.endsWith("/me")) {
        return new Response(
          JSON.stringify({
            userId,
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

  renderApp("/inbox");
  const user = userEvent.setup();
  await user.click(await screen.findByText("55119999@c.us"));

  // Unlinked conversation offers the attach flow.
  expect(await screen.findByText("Nenhum contato vinculado.")).toBeDefined();
  await user.click(screen.getByRole("button", { name: "Vincular contato" }));
  await user.click(await screen.findByRole("button", { name: /Ana/ }));
  await waitFor(() =>
    expect(calls).toContainEqual(
      expect.objectContaining({
        url: expect.stringContaining(
          `/conversations/${conversationId}/contact`,
        ),
        method: "PATCH",
        body: { contactId },
      }),
    ),
  );

  // Once linked, the panel surfaces contact, company, deals and tasks.
  expect(await screen.findByText("ana@example.com")).toBeDefined();
  expect(await screen.findByText("Empresa X")).toBeDefined();
  expect(await screen.findByText("Proposta anual")).toBeDefined();
  expect(await screen.findByText("Retornar ligação")).toBeDefined();

  // Detaching clears the link through the same endpoint.
  await user.click(screen.getByRole("button", { name: "Desvincular" }));
  await waitFor(() =>
    expect(calls).toContainEqual(
      expect.objectContaining({
        url: expect.stringContaining(
          `/conversations/${conversationId}/contact`,
        ),
        method: "PATCH",
        body: { contactId: null },
      }),
    ),
  );
});

test("work center renders the actionable queue sections", async () => {
  const workspaceId = "123e4567-e89b-12d3-a456-426614174000";
  const userId = "123e4567-e89b-12d3-a456-426614174001";
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = requestUrl(input);
    if (url.includes("/me/workspaces")) {
      return new Response(
        JSON.stringify([
          {
            workspaceId,
            workspaceName: "Workspace",
            role: "agent",
            onboarded: true,
          },
        ]),
        { status: 200 },
      );
    }
    if (url.includes("/work-queue")) {
      return new Response(
        JSON.stringify({
          unassigned: [
            {
              id: "123e4567-e89b-12d3-a456-426614174010",
              contactName: "Ana",
              providerThreadId: "55119999@c.us",
              updatedAt: "2026-01-01T00:00:00Z",
            },
          ],
          awaitingReply: [
            {
              id: "123e4567-e89b-12d3-a456-426614174011",
              contactName: null,
              providerThreadId: "55118888@c.us",
              lastInboundAt: "2026-01-01T01:00:00Z",
            },
          ],
          sendIssues: [
            {
              id: "123e4567-e89b-12d3-a456-426614174012",
              conversationId: "123e4567-e89b-12d3-a456-426614174010",
              contactName: "Ana",
              status: "failed",
              createdAt: "2026-01-01T02:00:00Z",
            },
          ],
          overdueTasks: [
            {
              id: "123e4567-e89b-12d3-a456-426614174013",
              title: "Retornar ligação",
              dueAt: "2026-01-01T03:00:00Z",
              assigneeName: "User",
              contactId: "123e4567-e89b-12d3-a456-426614174030",
              contactName: "Ana",
              dealId: null,
            },
          ],
          idleDeals: [
            {
              id: "123e4567-e89b-12d3-a456-426614174014",
              title: "Proposta anual",
              stageName: "Negociação",
              pipelineName: "Vendas",
              valueCents: 120000,
            },
          ],
        }),
        { status: 200 },
      );
    }
    if (url.endsWith("/me")) {
      return new Response(
        JSON.stringify({
          userId,
          email: "user@example.com",
          name: "User",
          isAdmin: false,
        }),
        { status: 200 },
      );
    }
    return new Response("not found", { status: 404 });
  });
  vi.stubGlobal("fetch", fetchMock);
  setToken("session-token");

  renderApp("/");

  expect(
    await screen.findByRole("heading", { name: "Central do operador" }),
  ).toBeDefined();
  expect(await screen.findByText("Aguardando resposta")).toBeDefined();
  expect(screen.getByText("Sem responsável")).toBeDefined();
  expect(screen.getByText("Envios para revisar")).toBeDefined();
  expect(screen.getByText("Tarefas vencidas")).toBeDefined();
  expect(screen.getByText("Negócios sem próxima ação")).toBeDefined();
  expect(screen.getByText("55118888@c.us")).toBeDefined();
  expect(screen.getByText("Retornar ligação")).toBeDefined();
  expect(screen.getByText("Proposta anual")).toBeDefined();
  expect(screen.getByText("Falhou")).toBeDefined();
});
