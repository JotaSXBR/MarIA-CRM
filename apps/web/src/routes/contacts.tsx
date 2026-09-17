import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api.ts";
import { useWorkspace } from "../lib/workspace.tsx";

type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
};

const empty = { name: "", email: "", phone: "" };

export function ContactsPage() {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const isAdmin = workspace?.role === "admin";
  const queryClient = useQueryClient();
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts", workspaceId],
    queryFn: () => api<Contact[]>("/contacts", { workspaceId }),
    enabled: Boolean(workspaceId),
  });

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
            },
          })
        : api<Contact>("/contacts", {
            method: "POST",
            workspaceId,
            body: {
              name: form.name,
              email: form.email || null,
              phone: form.phone || null,
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

      <form
        onSubmit={onSubmit}
        className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4"
      >
        <input
          required
          placeholder="Nome"
          aria-label="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="email"
          placeholder="Email"
          aria-label="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          placeholder="Telefone"
          aria-label="Telefone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
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
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              Cancelar
            </button>
          ) : null}
        </div>
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
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium" aria-label="Ações" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-slate-500">
                  Carregando…
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-slate-500">
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
                  <td className="px-4 py-3 text-slate-600">
                    {contact.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {contact.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditingId(contact.id);
                        setForm({
                          name: contact.name,
                          email: contact.email ?? "",
                          phone: contact.phone ?? "",
                        });
                      }}
                      className="mr-2 text-indigo-600 hover:underline"
                    >
                      Editar
                    </button>
                    {isAdmin ? (
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
