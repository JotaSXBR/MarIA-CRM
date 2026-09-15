import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { getToken } from "./lib/api.ts";
import { LoginPage } from "./routes/login.tsx";
import { AppShell } from "./routes/shell.tsx";
import { ContactsPage } from "./routes/contacts.tsx";
import { CompaniesPage } from "./routes/companies.tsx";
import { PipelinesPage } from "./routes/pipelines.tsx";

const rootRoute = createRootRoute({ component: Outlet });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: "/login" });
  },
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/pipelines" });
  },
});

const pipelinesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/pipelines",
  component: PipelinesPage,
});

const contactsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/contacts",
  component: ContactsPage,
});

const companiesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/companies",
  component: CompaniesPage,
});

export const routeTree = rootRoute.addChildren([
  loginRoute,
  appRoute.addChildren([
    indexRoute,
    pipelinesRoute,
    contactsRoute,
    companiesRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
