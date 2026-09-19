import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Company, Contact } from "@/lib/types";
import { hasWorkspaceRole, useWorkspace } from "@/lib/workspace";

const empty = { name: "", email: "", phone: "", companyId: "" };

export function ContactsPage() {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const canEdit = hasWorkspaceRole(workspace?.role, "agent");
  const canManage = hasWorkspaceRole(workspace?.role, "manager");
  const queryClient = useQueryClient();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts", workspaceId],
    queryFn: () => api<Contact[]>("/contacts", { workspaceId }),
    enabled: Boolean(workspaceId),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["companies", workspaceId],
    queryFn: () => api<Company[]>("/companies", { workspaceId }),
    enabled: Boolean(workspaceId),
  });

  const companyName = new Map(companies.map((c) => [c.id, c.name]));

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["contacts", workspaceId] });

  const save = useMutation({
    mutationFn: () =>
      editingId
        ? api<Contact>(`/contacts/${editingId}`, {
            method: "PATCH",
            workspaceId,
            body: {
              name: form.name,
              email: form.email || null,
              phone: form.phone || null,
              companyId: form.companyId || null,
            },
          })
        : api<Contact>("/contacts", {
            method: "POST",
            workspaceId,
            body: {
              name: form.name,
              email: form.email || null,
              phone: form.phone || null,
              companyId: form.companyId || null,
            },
          }),
    onSuccess: async () => {
      setForm(empty);
      setEditingId(null);
      setError(null);
      await invalidate();
    },
    onError: () => setError("Não foi possível salvar o contato."),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      api<void>(`/contacts/${id}`, { method: "DELETE", workspaceId }),
    onSuccess: invalidate,
    onError: () => setError("Não foi possível remover o contato."),
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
  };

  if (!workspaceId) return <p>Selecione um workspace.</p>;

  return (
    <section aria-labelledby="contacts-title" className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 id="contacts-title" className="text-lg font-semibold">
          Contatos
        </h1>
      </div>

      {canEdit ? (
        <form
          onSubmit={onSubmit}
          className="mt-4 grid gap-3 rounded-xl border border-border bg-white p-4 sm:grid-cols-5"
        >
          <input
            required
            placeholder="Nome"
            aria-label="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-input px-3 py-2 text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            aria-label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-lg border border-input px-3 py-2 text-sm"
          />
          <input
            placeholder="Telefone"
            aria-label="Telefone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-lg border border-input px-3 py-2 text-sm"
          />
          <select
            aria-label="Empresa"
            value={form.companyId}
            onChange={(e) => setForm({ ...form, companyId: e.target.value })}
            className="rounded-lg border border-input px-3 py-2 text-sm"
          >
            <option value="">Sem empresa</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={save.isPending}
              className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {editingId ? "Salvar" : "Adicionar"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(empty);
                }}
                className="rounded-lg border border-input px-3 py-2 text-sm"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium" aria-label="Ações" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-muted-foreground">
                  Carregando…
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-muted-foreground">
                  Nenhum contato ainda.
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="px-4 py-3 font-medium">
                    <Link
                      to="/contacts/$contactId"
                      params={{ contactId: contact.id }}
                      className="hover:underline"
                    >
                      {contact.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {contact.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {contact.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {contact.companyId ? (
                      <Link
                        to="/companies/$companyId"
                        params={{ companyId: contact.companyId }}
                        className="hover:underline"
                      >
                        {companyName.get(contact.companyId) ?? "—"}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canEdit ? (
                      <button
                        onClick={() => {
                          setEditingId(contact.id);
                          setForm({
                            name: contact.name,
                            email: contact.email ?? "",
                            phone: contact.phone ?? "",
                            companyId: contact.companyId ?? "",
                          });
                        }}
                        className="mr-2 text-indigo-600 hover:underline"
                      >
                        Editar
                      </button>
                    ) : null}
                    {canManage ? (
                      <button
                        onClick={() => remove.mutate(contact.id)}
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
