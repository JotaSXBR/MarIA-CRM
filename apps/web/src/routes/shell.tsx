import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { setToken } from "../lib/api.ts";
import { useWorkspace, WorkspaceProvider } from "../lib/workspace.tsx";

function ShellLayout() {
  const navigate = useNavigate();
  const { memberships, workspace, selectWorkspace } = useWorkspace();

  const logout = async () => {
    setToken(null);
    await navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="flex w-56 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            MarIA CRM
          </p>
          {memberships.length > 1 ? (
            <select
              aria-label="Workspace"
              value={workspace?.workspaceId ?? ""}
              onChange={(event) => selectWorkspace(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm"
            >
              {memberships.map((membership) => (
                <option
                  key={membership.workspaceId}
                  value={membership.workspaceId}
                >
                  {membership.workspaceName}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-2 text-sm font-medium text-slate-700">
              {workspace?.workspaceName ?? "…"}
            </p>
          )}
        </div>
        <nav className="flex-1 space-y-1 p-2 text-sm">
          <Link
            to="/pipelines"
            className="block rounded-lg px-3 py-2 hover:bg-slate-100"
            activeProps={{ className: "bg-indigo-50 text-indigo-700" }}
          >
            Pipelines
          </Link>
          <Link
            to="/contacts"
            className="block rounded-lg px-3 py-2 hover:bg-slate-100"
            activeProps={{ className: "bg-indigo-50 text-indigo-700" }}
          >
            Contatos
          </Link>
          <Link
            to="/companies"
            className="block rounded-lg px-3 py-2 hover:bg-slate-100"
            activeProps={{ className: "bg-indigo-50 text-indigo-700" }}
          >
            Empresas
          </Link>
        </nav>
        <button
          onClick={logout}
          className="m-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100"
        >
          Sair
        </button>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

export function AppShell() {
  return (
    <WorkspaceProvider>
      <ShellLayout />
    </WorkspaceProvider>
  );
}
