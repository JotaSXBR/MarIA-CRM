import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { api, getToken } from "./lib/api.ts";
import { WORKSPACE_KEY } from "./lib/workspace.tsx";
import { LoginPage } from "./routes/login.tsx";
import { SetupPage } from "./routes/setup.tsx";
import { InvitePage } from "./routes/invite.tsx";
import { OnboardingPage } from "./routes/onboarding.tsx";
import { AppShell } from "./routes/shell.tsx";
import { ContactsPage } from "./routes/contacts.tsx";
import { ContactDetailPage } from "./routes/contact-detail.tsx";
import { CompaniesPage } from "./routes/companies.tsx";
import { CompanyDetailPage } from "./routes/company-detail.tsx";
import { PipelinesPage } from "./routes/pipelines.tsx";
import { DealDetailPage } from "./routes/deal-detail.tsx";
import { InboxPage } from "./routes/inbox.tsx";
import { WorkCenterPage } from "./routes/work-center.tsx";
import { SearchPage } from "./routes/search.tsx";
import { AdminPage } from "./routes/admin.tsx";
import { SettingsLayout } from "./routes/settings.tsx";
import { SettingsProfilePage } from "./routes/settings-profile.tsx";
import { SettingsChannelsPage } from "./routes/settings-channels.tsx";
import { SettingsTagsPage } from "./routes/settings-tags.tsx";
import { SettingsRepliesPage } from "./routes/settings-replies.tsx";
import { SettingsAttributesPage } from "./routes/settings-attributes.tsx";
import { SettingsMembersPage } from "./routes/settings-members.tsx";

const rootRoute = createRootRoute({ component: Outlet });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: async () => {
    const status = await api<{ setupRequired: boolean }>("/setup/status").catch(
      () => undefined,
    );
    if (status?.setupRequired) {
      throw redirect({ to: "/setup", search: {} });
    }
  },
  component: LoginPage,
});

const setupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/setup",
  validateSearch: (search): { token?: string } =>
    typeof search.token === "string" ? { token: search.token } : {},
  component: SetupPage,
});

const inviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invite/$token",
  component: InvitePage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: OnboardingPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  beforeLoad: async ({ location }) => {
    if (!getToken()) throw redirect({ to: "/login" });
    // ADR 0015 item 6: members of a workspace that never finished onboarding
    // are routed to the wizard. Channel settings stay reachable — the
    // wizard's WhatsApp step links there.
    if (location.pathname === "/settings/channels") return;
    const memberships = await api<
      { workspaceId: string; onboarded: boolean }[]
    >("/me/workspaces").catch(() => []);
    const selectedId = localStorage.getItem(WORKSPACE_KEY);
    const workspace =
      memberships.find((m) => m.workspaceId === selectedId) ?? memberships[0];
    if (workspace && workspace.onboarded === false) {
      throw redirect({ to: "/onboarding" });
    }
  },
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/",
  component: WorkCenterPage,
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

const searchRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/search",
  validateSearch: (search) => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: SearchPage,
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

const settingsRepliesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/replies",
  component: SettingsRepliesPage,
});

const settingsAttributesRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/attributes",
  component: SettingsAttributesPage,
});

const settingsMembersRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: "/members",
  component: SettingsMembersPage,
});

export const routeTree = rootRoute.addChildren([
  loginRoute,
  setupRoute,
  inviteRoute,
  onboardingRoute,
  appRoute.addChildren([
    indexRoute,
    pipelinesRoute,
    dealDetailRoute,
    contactsRoute,
    contactDetailRoute,
    companiesRoute,
    companyDetailRoute,
    inboxRoute,
    searchRoute,
    adminRoute,
    settingsRoute.addChildren([
      settingsIndexRoute,
      settingsProfileRoute,
      settingsMembersRoute,
      settingsChannelsRoute,
      settingsTagsRoute,
      settingsRepliesRoute,
      settingsAttributesRoute,
    ]),
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
