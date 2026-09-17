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
import { ContactDetailPage } from "./routes/contact-detail.tsx";
import { CompaniesPage } from "./routes/companies.tsx";
import { PipelinesPage } from "./routes/pipelines.tsx";
import { InboxPage } from "./routes/inbox.tsx";
import { AdminPage } from "./routes/admin.tsx";
import { SettingsLayout } from "./routes/settings.tsx";
import { SettingsProfilePage } from "./routes/settings-profile.tsx";
import { SettingsChannelsPage } from "./routes/settings-channels.tsx";

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
    throw redirect({ to: "/inbox" });
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

const contactDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/contacts/$contactId",
  component: ContactDetailPage,
});

const companiesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/companies",
  component: CompaniesPage,
});

const inboxRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/inbox",
  component: InboxPage,
});

const adminRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/admin",
  component: AdminPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/settings",
  component: SettingsLayout,
});

const settingsIndexRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/settings/profile" });
  },
});

const settingsProfileRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/profile",
  component: SettingsProfilePage,
});

const settingsChannelsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/channels",
  component: SettingsChannelsPage,
});

export const routeTree = rootRoute.addChildren([
  loginRoute,
  appRoute.addChildren([
    indexRoute,
    pipelinesRoute,
    contactsRoute,
    contactDetailRoute,
    companiesRoute,
    inboxRoute,
    adminRoute,
    settingsRoute.addChildren([
      settingsIndexRoute,
      settingsProfileRoute,
      settingsChannelsRoute,
    ]),
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
