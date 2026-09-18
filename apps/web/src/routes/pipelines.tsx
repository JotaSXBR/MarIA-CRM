import { useMemo, useState, type FormEvent } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { Company, Contact, Deal, Pipeline, Stage } from "@/lib/types";
import { useWorkspace } from "@/lib/workspace";

function DealCard({
  deal,
  onOpen,
}: {
  deal: Deal;
  onOpen: (deal: Deal) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: deal.id });
  const value = formatCurrency(deal.valueCents);
  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(deal)}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm active:cursor-grabbing"
    >
      <p className="font-medium">{deal.title}</p>
      {value ? <p className="mt-1 text-xs text-slate-500">{value}</p> : null}
    </li>
  );
}

function DealEditor({
  deal,
  isAdmin,
  contacts,
  companies,
  onClose,
  onSaved,
  onDeleted,
}: {
  deal: Deal;
  isAdmin: boolean;
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
          {isAdmin ? (
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

function StageColumn({
  stage,
  deals,
  isAdmin,
  onDeleteStage,
  onOpenDeal,
}: {
  stage: Stage;
  deals: Deal[];
  isAdmin: boolean;
  onDeleteStage: (id: string) => void;
  onOpenDeal: (deal: Deal) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `stage:${stage.id}` });
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");

  const addDeal = useMutation({
    mutationFn: () =>
      api<Deal>("/deals", {
        method: "POST",
        workspaceId,
        body: { pipelineId: stage.pipelineId, stageId: stage.id, title },
      }),
    onSuccess: async () => {
      setTitle("");
      await queryClient.invalidateQueries({
        queryKey: ["deals", workspaceId, stage.pipelineId],
      });
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (title.trim()) addDeal.mutate();
  };

  return (
    <div className="flex w-64 shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-100">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-sm font-semibold">{stage.name}</h3>
        {isAdmin ? (
          <button
            aria-label={`Remover etapa ${stage.name}`}
            onClick={() => onDeleteStage(stage.id)}
            className="text-xs text-red-600 hover:underline"
          >
            Remover
          </button>
        ) : null}
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-16 flex-1 rounded-b-xl px-2 ${isOver ? "bg-indigo-50" : ""}`}
      >
        <SortableContext
          items={deals.map((deal) => deal.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2 py-1">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} onOpen={onOpenDeal} />
            ))}
          </ul>
        </SortableContext>
      </div>
      <form onSubmit={submit} className="flex gap-1 p-2">
        <input
          aria-label={`Novo negócio em ${stage.name}`}
          placeholder="Novo negócio"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-2 py-1 text-sm"
        />
        <button
          type="submit"
          aria-label={`Adicionar em ${stage.name}`}
          className="rounded-lg bg-indigo-600 px-2 text-sm text-white hover:bg-indigo-700"
        >
          +
        </button>
      </form>
    </div>
  );
}

export function PipelinesPage() {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const isAdmin = workspace?.role === "admin";
  const queryClient = useQueryClient();
  const [pipelineId, setPipelineId] = useState<string | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [newPipeline, setNewPipeline] = useState("");
  const [newStage, setNewStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const { data: pipelines = [] } = useQuery({
    queryKey: ["pipelines", workspaceId],
    queryFn: () => api<Pipeline[]>("/pipelines", { workspaceId }),
    enabled: Boolean(workspaceId),
  });
  const selected = pipelines.find((p) => p.id === pipelineId) ?? pipelines[0];

  const { data: stages = [] } = useQuery({
    queryKey: ["stages", workspaceId, selected?.id],
    queryFn: () =>
      api<Stage[]>(`/pipelines/${selected?.id}/stages`, { workspaceId }),
    enabled: Boolean(workspaceId && selected),
  });

  const { data: deals = [] } = useQuery({
    queryKey: ["deals", workspaceId, selected?.id],
    queryFn: () =>
      api<Deal[]>(`/deals?pipelineId=${selected?.id}`, { workspaceId }),
    enabled: Boolean(workspaceId && selected),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts", workspaceId],
    queryFn: () => api<Contact[]>("/contacts", { workspaceId }),
    enabled: Boolean(workspaceId && editingDeal),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["companies", workspaceId],
    queryFn: () => api<Company[]>("/companies", { workspaceId }),
    enabled: Boolean(workspaceId && editingDeal),
  });

  const dealsByStage = useMemo(() => {
    const map = new Map<string, Deal[]>();
    for (const deal of deals) {
      const list = map.get(deal.stageId) ?? [];
      list.push(deal);
      map.set(deal.stageId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.position.localeCompare(b.position));
    }
    return map;
  }, [deals]);

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["pipelines", workspaceId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["stages", workspaceId, selected?.id],
      }),
      queryClient.invalidateQueries({
        queryKey: ["deals", workspaceId, selected?.id],
      }),
    ]);

  const createPipeline = useMutation({
    mutationFn: () =>
      api<Pipeline>("/pipelines", {
        method: "POST",
        workspaceId,
        body: { name: newPipeline },
      }),
    onSuccess: async (created) => {
      setNewPipeline("");
      await invalidate();
      setPipelineId(created.id);
    },
    onError: () => setError("Não foi possível criar o pipeline."),
  });

  const createStage = useMutation({
    mutationFn: () =>
      api<Stage>(`/pipelines/${selected?.id}/stages`, {
        method: "POST",
        workspaceId,
        body: { name: newStage },
      }),
    onSuccess: async () => {
      setNewStage("");
      await invalidate();
    },
    onError: () => setError("Não foi possível criar a etapa."),
  });

  const moveDeal = useMutation({
    mutationFn: (input: {
      dealId: string;
      stageId: string;
      prevDealId: string | null;
      nextDealId: string | null;
    }) =>
      api<Deal>(`/deals/${input.dealId}/move`, {
        method: "POST",
        workspaceId,
        body: {
          stageId: input.stageId,
          prevDealId: input.prevDealId,
          nextDealId: input.nextDealId,
        },
      }),
    onSuccess: invalidate,
    onError: () => setError("Não foi possível mover o negócio."),
  });

  const deleteStage = useMutation({
    mutationFn: (id: string) =>
      api<void>(`/stages/${id}`, { method: "DELETE", workspaceId }),
    onSuccess: invalidate,
    onError: () =>
      setError("Não foi possível remover a etapa (talvez haja negócios nela)."),
  });

  const onDragEnd = (event: DragEndEvent) => {
    const dealId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    if (!overId) return;
    const targetStageId = overId.startsWith("stage:")
      ? overId.slice("stage:".length)
      : (deals.find((deal) => deal.id === overId)?.stageId ?? null);
    if (!targetStageId || !selected) return;
    const target = (dealsByStage.get(targetStageId) ?? []).filter(
      (deal) => deal.id !== dealId,
    );
    let index = target.findIndex((deal) => deal.id === overId);
    if (index === -1) index = target.length;
    const prev = index > 0 ? target[index - 1] : undefined;
    const next = target[index];
    moveDeal.mutate({
      dealId,
      stageId: targetStageId,
      prevDealId: prev?.id ?? null,
      nextDealId: next?.id ?? null,
    });
  };

  if (!workspaceId) return <p>Selecione um workspace.</p>;

  return (
    <section aria-labelledby="pipelines-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 id="pipelines-title" className="text-lg font-semibold">
          Pipelines
        </h1>
        {pipelines.length > 0 ? (
          <select
            aria-label="Pipeline"
            value={selected?.id ?? ""}
            onChange={(event) => setPipelineId(event.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
          >
            {pipelines.map((pipeline) => (
              <option key={pipeline.id} value={pipeline.id}>
                {pipeline.name}
              </option>
            ))}
          </select>
        ) : null}
        {isAdmin ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (newPipeline.trim()) createPipeline.mutate();
            }}
            className="flex gap-1"
          >
            <input
              aria-label="Nome do pipeline"
              placeholder="Novo pipeline"
              value={newPipeline}
              onChange={(event) => setNewPipeline(event.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700"
            >
              Criar
            </button>
          </form>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {selected ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-4">
            {stages.map((stage) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                deals={dealsByStage.get(stage.id) ?? []}
                isAdmin={isAdmin}
                onDeleteStage={(id) => deleteStage.mutate(id)}
                onOpenDeal={setEditingDeal}
              />
            ))}
            {isAdmin ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (newStage.trim()) createStage.mutate();
                }}
                className="flex w-64 shrink-0 flex-col gap-2 rounded-xl border border-dashed border-slate-300 p-3"
              >
                <input
                  aria-label="Nome da etapa"
                  placeholder="Nova etapa"
                  value={newStage}
                  onChange={(event) => setNewStage(event.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700"
                >
                  Adicionar etapa
                </button>
              </form>
            ) : null}
          </div>
        </DndContext>
      ) : (
        <p className="text-sm text-slate-500">
          Nenhum pipeline ainda. Crie um para começar.
        </p>
      )}
      {editingDeal ? (
        <DealEditor
          deal={editingDeal}
          isAdmin={isAdmin}
          contacts={contacts}
          companies={companies}
          onClose={() => setEditingDeal(null)}
          onSaved={invalidate}
          onDeleted={invalidate}
        />
      ) : null}
    </section>
  );
}
