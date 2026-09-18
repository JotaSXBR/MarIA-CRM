import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Company, Contact, Deal } from "@/lib/types";
import { useWorkspace } from "@/lib/workspace";

export function DealEditor({
  deal,
  canManage,
  contacts,
  companies,
  onClose,
  onSaved,
  onDeleted,
}: {
  deal: Deal;
  canManage: boolean;
  contacts: Contact[];
  companies: Company[];
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const [form, setForm] = useState({
    title: deal.title,
    value: deal.valueCents == null ? "" : String(deal.valueCents / 100),
    contactId: deal.contactId ?? "",
    companyId: deal.companyId ?? "",
  });
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      api<Deal>(`/deals/${deal.id}`, {
        method: "PATCH",
        workspaceId,
        body: {
          title: form.title,
          valueCents:
            form.value === "" ? null : Math.round(Number(form.value) * 100),
          contactId: form.contactId || null,
          companyId: form.companyId || null,
        },
      }),
    onSuccess: () => {
      onSaved();
      onClose();
    },
    onError: () => setError("Não foi possível salvar o negócio."),
  });

  const remove = useMutation({
    mutationFn: () =>
      api<void>(`/deals/${deal.id}`, { method: "DELETE", workspaceId }),
    onSuccess: () => {
      onDeleted();
      onClose();
    },
    onError: () => setError("Não foi possível remover o negócio."),
  });

  return (
    <div
      role="dialog"
      aria-label={`Editar ${deal.title}`}
      className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm space-y-3 rounded-xl bg-white p-4 shadow-lg"
      >
        <h2 className="text-base font-semibold">Editar negócio</h2>
        <input
          required
          aria-label="Título"
          placeholder="Título"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          aria-label="Valor"
          placeholder="Valor (R$)"
          value={form.value}
          onChange={(event) => setForm({ ...form, value: event.target.value })}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          aria-label="Contato"
          value={form.contactId}
          onChange={(event) =>
            setForm({ ...form, contactId: event.target.value })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Sem contato</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Empresa"
          value={form.companyId}
          onChange={(event) =>
            setForm({ ...form, companyId: event.target.value })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Sem empresa</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={save.isPending}
            className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            Cancelar
          </button>
          {canManage ? (
            <button
              type="button"
              onClick={() => remove.mutate()}
              disabled={remove.isPending}
              className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Remover
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
