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
import { CompanyDetailPage } from "./routes/company-detail.tsx";
import { PipelinesPage } from "./routes/pipelines.tsx";
import { DealDetailPage } from "./routes/deal-detail.tsx";
import { InboxPage } from "./routes/inbox.tsx";
import { AdminPage } from "./routes/admin.tsx";
import { SettingsLayout } from "./routes/settings.tsx";
import { SettingsProfilePage } from "./routes/settings-profile.tsx";
import { SettingsChannelsPage } from "./routes/settings-channels.tsx";
import { SettingsTagsPage } from "./routes/settings-tags.tsx";

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

const dealDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/deals/$dealId",
  component: DealDetailPage,
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

const companyDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/companies/$companyId",
  component: CompanyDetailPage,
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

const settingsTagsRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/tags",
  component: SettingsTagsPage,
});

export const routeTree = rootRoute.addChildren([
  loginRoute,
  appRoute.addChildren([
    indexRoute,
    pipelinesRoute,
    dealDetailRoute,
    contactsRoute,
    contactDetailRoute,
    companiesRoute,
    companyDetailRoute,
    inboxRoute,
    adminRoute,
    settingsRoute.addChildren([
      settingsIndexRoute,
      settingsProfileRoute,
      settingsChannelsRoute,
      settingsTagsRoute,
    ]),
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
