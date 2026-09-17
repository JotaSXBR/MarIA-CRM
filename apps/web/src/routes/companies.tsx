import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Company } from "@/lib/types";
import { useWorkspace } from "@/lib/workspace";

export function CompaniesPage() {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const isAdmin = workspace?.role === "admin";
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["companies", workspaceId],
    queryFn: () => api<Company[]>("/companies", { workspaceId }),
    enabled: Boolean(workspaceId),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["companies", workspaceId] });

  const save = useMutation({
    mutationFn: () =>
      editingId
        ? api<Company>(`/companies/${editingId}`, {
            method: "PATCH",
            workspaceId,
            body: { name },
          })
        : api<Company>("/companies", {
            method: "POST",
            workspaceId,
            body: { name },
          }),
    onSuccess: async () => {
      setName("");
      setEditingId(null);
      setError(null);
      await invalidate();
    },
    onError: () => setError("Não foi possível salvar a empresa."),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api<void>(`/companies/${id}`, { method: "DELETE", workspaceId }),
    onSuccess: invalidate,
    onError: () => setError("Não foi possível remover a empresa."),
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
  };

  if (!workspaceId) return <p>Selecione um workspace.</p>;

  return (
    <section aria-labelledby="companies-title" className="mx-auto max-w-4xl">
      <h1 id="companies-title" className="text-lg font-semibold">
        Empresas
      </h1>

      <form
        onSubmit={onSubmit}
        className="mt-4 flex gap-3 rounded-xl border border-slate-200 bg-white p-4"
      >
        <input
          required
          placeholder="Nome da empresa"
          aria-label="Nome da empresa"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {editingId ? "Salvar" : "Adicionar"}
        </button>
        {editingId ? (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setName("");
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            Cancelar
          </button>
        ) : null}
      </form>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Criada em</th>
              <th className="px-4 py-3 font-medium" aria-label="Ações" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-slate-500">
                  Carregando…
                </td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-slate-500">
                  Nenhuma empresa ainda.
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id}>
                  <td className="px-4 py-3 font-medium">{company.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(company.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditingId(company.id);
                        setName(company.name);
                      }}
                      className="mr-2 text-indigo-600 hover:underline"
                    >
                      Editar
                    </button>
                    {isAdmin ? (
                      <button
                        onClick={() => remove.mutate(company.id)}
                        className="text-red-600 hover:underline"
                      >
                        Remover
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
