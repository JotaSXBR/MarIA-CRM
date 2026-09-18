import { useState, type FormEvent, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { api, ApiError, getToken, setToken } from "@/lib/api";
import type { InvitationPreview } from "@/lib/types";
import { WORKSPACE_ROLE_LABELS, type SessionUser } from "@/lib/workspace";

function InviteShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
          MarIA CRM
        </p>
        {children}
      </div>
    </main>
  );
}

export function InvitePage() {
  const navigate = useNavigate();
  const { token } = useParams({ strict: false }) as { token: string };
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const preview = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => api<InvitationPreview>(`/invitations/${token}`),
    retry: false,
  });

  const session = useQuery({
    queryKey: ["me"],
    queryFn: () => api<SessionUser>("/me"),
    enabled: Boolean(getToken()),
    retry: false,
  });

  const onAccepted = async (workspaceId: string) => {
    localStorage.setItem("maria.workspace", workspaceId);
    await navigate({ to: "/inbox" });
  };

  const attach = async () => {
    setError(null);
    setPending(true);
    try {
      await api(`/invitations/${token}/accept`, { method: "POST", body: {} });
      await onAccepted(preview.data!.workspaceId);
    } catch (cause) {
      setError(
        cause instanceof ApiError && cause.status === 410
          ? "Este convite expirou ou já foi utilizado."
          : "Não foi possível aceitar o convite. Tente novamente.",
      );
    } finally {
      setPending(false);
    }
  };

  const createAccount = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await api<{ token: string }>(
        `/invitations/${token}/accept`,
        { method: "POST", body: { name, password } },
      );
      setToken(result.token);
      await onAccepted(preview.data!.workspaceId);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 409) {
        setError(
          "Já existe uma conta para este email. Entre para aceitar o convite.",
        );
      } else if (cause instanceof ApiError && cause.status === 410) {
        setError("Este convite expirou ou já foi utilizado.");
      } else {
        setError("Não foi possível aceitar o convite. Tente novamente.");
      }
    } finally {
      setPending(false);
    }
  };

  if (preview.isPending || (getToken() && session.isPending)) {
    return (
      <InviteShell>
        <p className="mt-4 text-sm text-slate-500">Verificando convite…</p>
      </InviteShell>
    );
  }

  if (preview.isError) {
    const status = preview.error instanceof ApiError ? preview.error.status : 0;
    return (
      <InviteShell>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          Convite indisponível
        </h1>
        <p role="alert" className="mt-2 text-sm text-slate-600">
          {status === 410
            ? "Este convite expirou ou já foi utilizado. Peça um novo link ao administrador do workspace."
            : "Este link de convite é inválido. Confira o endereço ou peça um novo link."}
        </p>
      </InviteShell>
    );
  }

  const invite = preview.data;
  const currentUser = session.data;

  return (
    <InviteShell>
      <h1 className="mt-2 text-xl font-semibold text-slate-900">
        Convite para {invite.workspaceName}
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        {invite.email} foi convidado como {WORKSPACE_ROLE_LABELS[invite.role]}{" "}
        neste workspace.
      </p>
      {currentUser ? (
        currentUser.email === invite.email ? (
          <>
            <button
              type="button"
              onClick={attach}
              disabled={pending}
              className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {pending ? "Entrando…" : "Aceitar convite"}
            </button>
            {error ? (
              <p role="alert" className="mt-4 text-sm text-red-600">
                {error}
              </p>
            ) : null}
          </>
        ) : (
          <>
            <p className="mt-4 text-sm text-slate-600">
              Você está conectado como {currentUser.email}. Este convite é para{" "}
              {invite.email}.
            </p>
            <button
              type="button"
              onClick={() => {
                setToken(null);
                window.location.reload();
              }}
              className="mt-6 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sair e usar outra conta
            </button>
          </>
        )
      ) : (
        <form onSubmit={createAccount}>
          <label className="mt-6 block text-sm font-medium text-slate-700">
            Nome
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Senha
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Mínimo de 8 caracteres. Uma conta será criada para {invite.email}.
          </p>
          {error ? (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {pending ? "Criando conta…" : "Criar conta e entrar"}
          </button>
        </form>
      )}
    </InviteShell>
  );
}
