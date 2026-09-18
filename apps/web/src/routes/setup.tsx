import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate, useSearch } from "@tanstack/react-router";
import { api, ApiError, setToken } from "@/lib/api";

type SetupStatus = {
  setupRequired: boolean;
  tokenRequired: boolean;
};

export function SetupPage() {
  const navigate = useNavigate();
  const { token: urlToken } = useSearch({ strict: false }) as {
    token?: string;
  };
  const status = useQuery({
    queryKey: ["setup-status"],
    queryFn: () => api<SetupStatus>("/setup/status"),
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [manualToken, setManualToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (status.isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Verificando instalação…</p>
      </main>
    );
  }

  if (status.isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <p role="alert" className="text-sm text-red-600">
          Não foi possível verificar a instalação. Confira se a API está no ar.
        </p>
      </main>
    );
  }

  if (!status.data.setupRequired) {
    return <Navigate to="/login" replace />;
  }

  const tokenRequired = status.data.tokenRequired;
  const token = urlToken ?? (manualToken || undefined);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const session = await api<{ token: string }>("/setup", {
        method: "POST",
        body: {
          name,
          email,
          password,
          workspaceName,
          ...(token ? { token } : {}),
        },
      });
      setToken(session.token);
      await navigate({ to: "/inbox" });
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 403) {
        setError("Token de instalação inválido ou já utilizado.");
      } else if (cause instanceof ApiError && cause.status === 409) {
        setError("A instalação já foi concluída. Entre com sua conta.");
      } else {
        setError("Não foi possível concluir a instalação. Tente novamente.");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
          MarIA CRM
        </p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          Criar a conta mestre
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Primeiro acesso: crie o administrador e o primeiro workspace.
        </p>
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
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
        <p className="mt-1 text-xs text-slate-500">Mínimo de 8 caracteres.</p>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Nome do workspace
          <input
            type="text"
            required
            value={workspaceName}
            onChange={(event) => setWorkspaceName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </label>
        {tokenRequired && !urlToken ? (
          <>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Token de instalação
              <input
                type="text"
                required
                autoComplete="off"
                value={manualToken}
                onChange={(event) => setManualToken(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Mostrado nos logs do servidor no primeiro boot.
            </p>
          </>
        ) : null}
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
          {pending ? "Concluindo…" : "Concluir instalação"}
        </button>
      </form>
    </main>
  );
}
