import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../lib/api.ts";
import { useWorkspace } from "../lib/workspace.tsx";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  active: boolean;
  createdAt: string;
};

type Organization = {
  id: string;
  name: string;
  createdAt: string;
};

type AdminWorkspace = {
  id: string;
  orgId: string;
  name: string;
  createdAt: string;
};

type Member = {
  id: string;
  userId: string;
  role: "admin" | "member";
  email: string;
  name: string;
};

const input =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-60";
const button =
  "rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function AdminPage() {
  const { session, sessionLoaded } = useWorkspace();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const enabled = Boolean(session?.isAdmin);

  const { data: users = [] } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api<AdminUser[]>("/admin/users"),
    enabled,
  });
  const { data: orgs = [] } = useQuery({
    queryKey: ["admin", "organizations"],
    queryFn: () => api<Organization[]>("/admin/organizations"),
    enabled,
  });
  const { data: workspaces = [] } = useQuery({
    queryKey: ["admin", "workspaces"],
    queryFn: () => api<AdminWorkspace[]>("/admin/workspaces"),
    enabled,
  });

  const [membersWorkspaceId, setMembersWorkspaceId] = useState("");
  const membersWorkspace = membersWorkspaceId || workspaces[0]?.id || "";
  const { data: members = [] } = useQuery({
    queryKey: ["admin", "members", membersWorkspace],
    queryFn: () =>
      api<Member[]>(`/admin/workspaces/${membersWorkspace}/members`),
    enabled: enabled && Boolean(membersWorkspace),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin"] });
  };
  const onError = (err: unknown) =>
    setError(
      err instanceof ApiError && err.status === 409
        ? "Operação não permitida (duplicado ou último admin)."
        : "Não foi possível concluir a operação.",
    );

  const [userForm, setUserForm] = useState({
    email: "",
    name: "",
    password: "",
    workspaceId: "",
    role: "member" as "admin" | "member",
  });
  const createUser = useMutation({
    mutationFn: () =>
      api<{ userId: string }>("/admin/users", {
        method: "POST",
        body: {
          email: userForm.email,
          name: userForm.name,
          password: userForm.password,
          ...(userForm.workspaceId
            ? { workspaceId: userForm.workspaceId, role: userForm.role }
            : {}),
        },
      }),
    onSuccess: () => {
      setUserForm({
        email: "",
        name: "",
        password: "",
        workspaceId: "",
        role: "member",
      });
      setError(null);
      invalidate();
    },
    onError,
  });

  const updateUser = useMutation({
    mutationFn: (input: { id: string; active: boolean }) =>
      api<void>(`/admin/users/${input.id}`, {
        method: "PATCH",
        body: { active: input.active },
      }),
    onSuccess: () => {
      setError(null);
      invalidate();
    },
    onError,
  });

  const [orgName, setOrgName] = useState("");
  const createOrg = useMutation({
    mutationFn: () =>
      api<{ id: string }>("/admin/organizations", {
        method: "POST",
        body: { name: orgName },
      }),
    onSuccess: () => {
      setOrgName("");
      setError(null);
      invalidate();
    },
    onError,
  });

  const [wsForm, setWsForm] = useState({ orgId: "", name: "" });
  const createWorkspace = useMutation({
    mutationFn: () =>
      api<{ id: string }>("/admin/workspaces", {
        method: "POST",
        body: { orgId: wsForm.orgId, name: wsForm.name },
      }),
    onSuccess: () => {
      setWsForm({ orgId: "", name: "" });
      setError(null);
      invalidate();
    },
    onError,
  });

  const [memberForm, setMemberForm] = useState({
    userId: "",
    role: "member" as "admin" | "member",
  });
  const addMember = useMutation({
    mutationFn: () =>
      api<void>("/admin/memberships", {
        method: "POST",
        body: {
          userId: memberForm.userId,
          workspaceId: membersWorkspace,
          role: memberForm.role,
        },
      }),
    onSuccess: () => {
      setMemberForm({ userId: "", role: "member" });
      setError(null);
      invalidate();
    },
    onError,
  });

  const updateMemberRole = useMutation({
    mutationFn: (input: { id: string; role: "admin" | "member" }) =>
      api<void>(
        `/admin/memberships/${input.id}?workspaceId=${membersWorkspace}`,
        { method: "PATCH", body: { role: input.role } },
      ),
    onSuccess: () => {
      setError(null);
      invalidate();
    },
    onError,
  });

  const removeMember = useMutation({
    mutationFn: (id: string) =>
      api<void>(`/admin/memberships/${id}?workspaceId=${membersWorkspace}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      setError(null);
      invalidate();
    },
    onError,
  });

  const submit = (fn: () => void) => (event: FormEvent) => {
    event.preventDefault();
    fn();
  };

  if (!sessionLoaded) return <p className="text-sm text-slate-500">…</p>;
  if (!session?.isAdmin) {
    return (
      <p role="alert" className="text-sm text-red-600">
        Acesso restrito a administradores.
      </p>
    );
  }

  const orgNameById = new Map(orgs.map((org) => [org.id, org.name]));

  return (
    <section aria-labelledby="admin-title" className="mx-auto max-w-4xl">
      <h1 id="admin-title" className="text-lg font-semibold">
        Administração
      </h1>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="mt-4 space-y-4">
        <Section title="Usuários">
          <form
            onSubmit={submit(createUser.mutate)}
            className="grid gap-2 sm:grid-cols-6"
          >
            <input
              required
              type="email"
              aria-label="Email do usuário"
              placeholder="Email"
              value={userForm.email}
              onChange={(e) =>
                setUserForm({ ...userForm, email: e.target.value })
              }
              className={`${input} sm:col-span-2`}
            />
            <input
              required
              aria-label="Nome do usuário"
              placeholder="Nome"
              value={userForm.name}
              onChange={(e) =>
                setUserForm({ ...userForm, name: e.target.value })
              }
              className={input}
            />
            <input
              required
              type="password"
              aria-label="Senha do usuário"
              placeholder="Senha"
              value={userForm.password}
              onChange={(e) =>
                setUserForm({ ...userForm, password: e.target.value })
              }
              className={input}
            />
            <select
              aria-label="Workspace inicial"
              value={userForm.workspaceId}
              onChange={(e) =>
                setUserForm({ ...userForm, workspaceId: e.target.value })
              }
              className={input}
            >
              <option value="">Sem workspace</option>
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={createUser.isPending}
              className={button}
            >
              Criar usuário
            </button>
          </form>
          {userForm.workspaceId ? (
            <select
              aria-label="Papel inicial"
              value={userForm.role}
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  role: e.target.value as "admin" | "member",
                })
              }
              className={`${input} mt-2`}
            >
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
          ) : null}

          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 font-medium">Email</th>
                <th className="py-2 font-medium">Nome</th>
                <th className="py-2 font-medium">Papel</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium" aria-label="Ações" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">{user.name}</td>
                  <td className="py-2">
                    {user.isAdmin ? "admin global" : "—"}
                  </td>
                  <td className="py-2">{user.active ? "ativo" : "inativo"}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() =>
                        updateUser.mutate({ id: user.id, active: !user.active })
                      }
                      className="text-indigo-600 hover:underline"
                    >
                      {user.active ? "Desativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Organizações">
          <form onSubmit={submit(createOrg.mutate)} className="flex gap-2">
            <input
              required
              aria-label="Nome da organização"
              placeholder="Nova organização"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className={`${input} flex-1`}
            />
            <button
              type="submit"
              disabled={createOrg.isPending}
              className={button}
            >
              Criar
            </button>
          </form>
          <ul className="mt-3 space-y-1 text-sm">
            {orgs.map((org) => (
              <li key={org.id} className="rounded-lg bg-slate-50 px-3 py-2">
                {org.name}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Workspaces">
          <form
            onSubmit={submit(createWorkspace.mutate)}
            className="flex gap-2"
          >
            <select
              required
              aria-label="Organização"
              value={wsForm.orgId}
              onChange={(e) => setWsForm({ ...wsForm, orgId: e.target.value })}
              className={input}
            >
              <option value="">Organização…</option>
              {orgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            <input
              required
              aria-label="Nome do workspace"
              placeholder="Novo workspace"
              value={wsForm.name}
              onChange={(e) => setWsForm({ ...wsForm, name: e.target.value })}
              className={`${input} flex-1`}
            />
            <button
              type="submit"
              disabled={createWorkspace.isPending}
              className={button}
            >
              Criar
            </button>
          </form>
          <ul className="mt-3 space-y-1 text-sm">
            {workspaces.map((ws) => (
              <li
                key={ws.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <span>{ws.name}</span>
                <span className="text-xs text-slate-500">
                  {orgNameById.get(ws.orgId) ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Membros por workspace">
          <select
            aria-label="Workspace"
            value={membersWorkspace}
            onChange={(e) => setMembersWorkspaceId(e.target.value)}
            className={input}
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>

          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 font-medium">Email</th>
                <th className="py-2 font-medium">Nome</th>
                <th className="py-2 font-medium">Papel</th>
                <th className="py-2 font-medium" aria-label="Ações" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="py-2">{member.email}</td>
                  <td className="py-2">{member.name}</td>
                  <td className="py-2">
                    <select
                      aria-label={`Papel de ${member.email}`}
                      value={member.role}
                      onChange={(e) =>
                        updateMemberRole.mutate({
                          id: member.id,
                          role: e.target.value as "admin" | "member",
                        })
                      }
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                    >
                      <option value="member">member</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => removeMember.mutate(member.id)}
                      className="text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <form onSubmit={submit(addMember.mutate)} className="mt-3 flex gap-2">
            <select
              required
              aria-label="Usuário"
              value={memberForm.userId}
              onChange={(e) =>
                setMemberForm({ ...memberForm, userId: e.target.value })
              }
              className={`${input} flex-1`}
            >
              <option value="">Adicionar usuário…</option>
              {users
                .filter(
                  (user) =>
                    !members.some((member) => member.userId === user.id),
                )
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
            </select>
            <select
              aria-label="Papel"
              value={memberForm.role}
              onChange={(e) =>
                setMemberForm({
                  ...memberForm,
                  role: e.target.value as "admin" | "member",
                })
              }
              className={input}
            >
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
            <button
              type="submit"
              disabled={addMember.isPending || !membersWorkspace}
              className={button}
            >
              Adicionar
            </button>
          </form>
        </Section>
      </div>
    </section>
  );
}
