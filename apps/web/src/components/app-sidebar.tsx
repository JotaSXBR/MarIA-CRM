import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  Check,
  ChevronsUpDown,
  Inbox,
  Kanban,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { setToken } from "@/lib/api";
import { initials } from "@/lib/format";
import { useWorkspace } from "@/lib/workspace";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { to: "/inbox", label: "Caixa de entrada", icon: Inbox },
  { to: "/contacts", label: "Contatos", icon: Users },
  { to: "/companies", label: "Empresas", icon: Building2 },
  { to: "/pipelines", label: "Pipelines", icon: Kanban },
] as const;

function WorkspaceSwitcher() {
  const { memberships, workspace, selectWorkspace } = useWorkspace();

  if (!workspace) {
    return <div className="px-2 py-3 text-sm text-muted-foreground">…</div>;
  }

  const trigger = (
    <>
      <Avatar className="size-8 rounded-lg">
        <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
          {initials(workspace.workspaceName)}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">
          {workspace.workspaceName}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          MarIA CRM
        </span>
      </div>
      {memberships.length > 1 ? <ChevronsUpDown className="ml-auto" /> : null}
    </>
  );

  if (memberships.length <= 1) {
    return <div className="flex items-center gap-2 p-2">{trigger}</div>;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" aria-label="Trocar de workspace" />
            }
          >
            {trigger}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" sideOffset={4}>
            {memberships.map((membership) => (
              <DropdownMenuItem
                key={membership.workspaceId}
                onClick={() => selectWorkspace(membership.workspaceId)}
              >
                {membership.workspaceName}
                {membership.workspaceId === workspace.workspaceId ? (
                  <Check className="ml-auto" />
                ) : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function NavMain() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton
                render={<Link to={item.to} />}
                isActive={pathname.startsWith(item.to)}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function NavAdmin() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Administração</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to="/admin" />}
              isActive={pathname.startsWith("/admin")}
              tooltip="Administração"
            >
              <ShieldCheck />
              <span>Administração</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function NavUser() {
  const { session } = useWorkspace();
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const logout = async () => {
    setToken(null);
    await navigate({ to: "/login" });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          render={<Link to="/settings" />}
          isActive={pathname.startsWith("/settings")}
          tooltip="Configurações"
        >
          <Settings />
          <span>Configurações</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" aria-label="Conta do usuário" />
            }
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg">
                {initials(session?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {session?.name ?? "…"}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {session?.email ?? ""}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="grid text-left leading-tight">
                  <span className="truncate font-medium">
                    {session?.name ?? "…"}
                  </span>
                  <span className="truncate text-muted-foreground">
                    {session?.email ?? ""}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebar() {
  const { session } = useWorkspace();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        {session?.isAdmin ? <NavAdmin /> : null}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
