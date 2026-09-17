import { Link, Outlet } from "@tanstack/react-router";

const SETTINGS_NAV = [
  { to: "/settings/profile", label: "Perfil" },
  { to: "/settings/channels", label: "Canais" },
] as const;

export function SettingsLayout() {
  return (
    <div className="mx-auto flex max-w-5xl gap-8">
      <aside className="w-44 shrink-0">
        <h1 className="px-2 pb-3 text-lg font-semibold">Configurações</h1>
        <nav className="flex flex-col gap-0.5">
          {SETTINGS_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-2 py-1.5 text-sm text-muted-foreground outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2"
              activeProps={{
                className: "bg-accent font-medium text-accent-foreground",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
