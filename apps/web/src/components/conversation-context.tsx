import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type {
  Company,
  Contact,
  Conversation,
  EntityDeal,
  Task,
} from "@/lib/types";
import { EntityDealList } from "@/components/entity-deal-list";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

type ConversationContextProps = {
  workspaceId: string | undefined;
  conversation: Conversation;
  /** agent+ may attach/detach contacts and manage tasks. */
  canEdit: boolean;
};

const SECTION_TITLE =
  "text-xs font-semibold uppercase tracking-wider text-muted-foreground";

/** Right-side operator panel: the CRM context behind the open conversation —
 * linked contact, company, deals and tasks. Contact attach/detach goes through
 * `PATCH /conversations/:id/contact`; entity reads reuse the contacts routes. */
export function ConversationContext({
  workspaceId,
  conversation,
  canEdit,
}: ConversationContextProps) {
  const queryClient = useQueryClient();
  const contactId = conversation.contactId;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerFilter, setPickerFilter] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueAt, setTaskDueAt] = useState("");
  const [taskError, setTaskError] = useState<string | null>(null);

  const contact = useQuery({
    queryKey: ["contact", workspaceId, contactId],
    queryFn: () => api<Contact>(`/contacts/${contactId}`, { workspaceId }),
    enabled: Boolean(workspaceId && contactId),
  });

  const companyId = contact.data?.companyId;
  const company = useQuery({
    queryKey: ["company", workspaceId, companyId],
    queryFn: () => api<Company>(`/companies/${companyId}`, { workspaceId }),
    enabled: Boolean(workspaceId && companyId),
  });

  const deals = useQuery({
    queryKey: ["contact-deals", workspaceId, contactId],
    queryFn: () =>
      api<EntityDeal[]>(`/contacts/${contactId}/deals`, { workspaceId }),
    enabled: Boolean(workspaceId && contactId),
  });

  const tasksKey = ["entity-tasks", workspaceId, `/contacts/${contactId}`];
  const tasks = useQuery({
    queryKey: tasksKey,
    queryFn: () => api<Task[]>(`/contacts/${contactId}/tasks`, { workspaceId }),
    enabled: Boolean(workspaceId && contactId),
  });

  const contacts = useQuery({
    queryKey: ["contacts", workspaceId],
    queryFn: () => api<Contact[]>("/contacts", { workspaceId }),
    enabled: Boolean(workspaceId && pickerOpen),
  });

  const invalidateConversation = () =>
    queryClient.invalidateQueries({ queryKey: ["conversations"] });

  const linkContact = useMutation({
    mutationFn: (linkedContactId: string | null) =>
      api<Conversation>(`/conversations/${conversation.id}/contact`, {
        method: "PATCH",
        workspaceId,
        body: { contactId: linkedContactId },
      }),
    onSuccess: async () => {
      setPickerOpen(false);
      setCreating(false);
      setLinkError(null);
      await invalidateConversation();
    },
    onError: () => setLinkError("Não foi possível vincular o contato."),
  });

  const createContact = useMutation({
    mutationFn: () =>
      api<Contact>("/contacts", {
        method: "POST",
        workspaceId,
        body: {
          name: newName,
          phone: newPhone.trim() || null,
        },
      }),
    onSuccess: (created) => linkContact.mutate(created.id),
    onError: () => setLinkError("Não foi possível criar o contato."),
  });

  const addTask = useMutation({
    mutationFn: () =>
      api<Task>(`/contacts/${contactId}/tasks`, {
        method: "POST",
        workspaceId,
        body: {
          title: taskTitle,
          dueAt: taskDueAt ? new Date(taskDueAt).toISOString() : null,
        },
      }),
    onSuccess: async () => {
      setTaskTitle("");
      setTaskDueAt("");
      setTaskError(null);
      await queryClient.invalidateQueries({ queryKey: tasksKey });
    },
    onError: () => setTaskError("Não foi possível adicionar a tarefa."),
  });

  const toggleTask = useMutation({
    mutationFn: (task: Task) =>
      api<Task>(`/tasks/${task.id}`, {
        method: "PATCH",
        workspaceId,
        body: { done: !task.doneAt },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tasksKey }),
    onError: () => setTaskError("Não foi possível atualizar a tarefa."),
  });

  const onCreateContact = (event: FormEvent) => {
    event.preventDefault();
    if (!newName.trim()) return;
    createContact.mutate();
  };

  const onAddTask = (event: FormEvent) => {
    event.preventDefault();
    if (!taskTitle.trim()) return;
    addTask.mutate();
  };

  const normalizedFilter = pickerFilter.trim().toLowerCase();
  const pickerMatches = (contacts.data ?? []).filter(
    (item) =>
      item.id !== contactId &&
      (!normalizedFilter ||
        item.name.toLowerCase().includes(normalizedFilter) ||
        item.phone?.includes(normalizedFilter)),
  );

  return (
    <aside
      aria-label="Contexto da conversa"
      className="hidden w-80 shrink-0 flex-col rounded-lg border border-border bg-white lg:flex"
    >
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-semibold text-foreground">Contexto</h2>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <section>
          <h3 className={SECTION_TITLE}>Contato</h3>
          {contactId && contact.data ? (
            <div className="mt-2">
              <Link
                to="/contacts/$contactId"
                params={{ contactId: contact.data.id }}
                className="text-sm font-medium text-foreground hover:underline"
              >
                {contact.data.name}
              </Link>
              {contact.data.phone ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {contact.data.phone}
                </p>
              ) : null}
              {contact.data.email ? (
                <p className="text-xs text-muted-foreground">
                  {contact.data.email}
                </p>
              ) : null}
              {company.data ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Empresa:{" "}
                  <Link
                    to="/companies/$companyId"
                    params={{ companyId: company.data.id }}
                    className="text-foreground hover:underline"
                  >
                    {company.data.name}
                  </Link>
                </p>
              ) : null}
              {canEdit ? (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerOpen((open) => !open)}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Trocar contato
                  </button>
                  <button
                    type="button"
                    disabled={linkContact.isPending}
                    onClick={() => linkContact.mutate(null)}
                    className="text-xs text-muted-foreground hover:underline disabled:opacity-50"
                  >
                    Desvincular
                  </button>
                </div>
              ) : null}
            </div>
          ) : contactId ? (
            <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                Nenhum contato vinculado.
              </p>
              {canEdit ? (
                <button
                  type="button"
                  onClick={() => setPickerOpen((open) => !open)}
                  className="mt-1 text-xs font-medium text-indigo-600 hover:underline"
                >
                  Vincular contato
                </button>
              ) : null}
            </div>
          )}
          {pickerOpen && canEdit ? (
            <div className="mt-2 rounded-md border border-border p-2">
              {creating ? (
                <form onSubmit={onCreateContact} className="space-y-2">
                  <Input
                    required
                    placeholder="Nome do contato"
                    aria-label="Nome do contato"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <Input
                    placeholder="Telefone (opcional)"
                    aria-label="Telefone"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={createContact.isPending}
                      className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
                    >
                      Criar e vincular
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreating(false)}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Voltar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <Input
                    placeholder="Buscar contato..."
                    aria-label="Buscar contato"
                    value={pickerFilter}
                    onChange={(e) => setPickerFilter(e.target.value)}
                  />
                  <ul className="mt-1 max-h-40 overflow-y-auto">
                    {pickerMatches.slice(0, 20).map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          disabled={linkContact.isPending}
                          onClick={() => linkContact.mutate(item.id)}
                          className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted disabled:opacity-50"
                        >
                          {item.name}
                          {item.phone ? (
                            <span className="ml-1 text-xs text-muted-foreground">
                              {item.phone}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                    {contacts.data && pickerMatches.length === 0 ? (
                      <li className="px-2 py-1.5 text-xs text-muted-foreground">
                        Nenhum contato encontrado.
                      </li>
                    ) : null}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setCreating(true)}
                    className="mt-1 px-2 text-xs font-medium text-indigo-600 hover:underline"
                  >
                    Novo contato
                  </button>
                </>
              )}
              {linkError ? (
                <p role="alert" className="mt-1 text-xs text-destructive">
                  {linkError}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        {contactId ? (
          <>
            <section>
              <h3 className={SECTION_TITLE}>Negócios</h3>
              <div className="mt-2">
                <EntityDealList deals={deals.data} />
              </div>
            </section>
            <section>
              <h3 className={SECTION_TITLE}>Tarefas</h3>
              {canEdit ? (
                <form onSubmit={onAddTask} className="mt-2 space-y-2">
                  <Input
                    required
                    placeholder="Nova tarefa"
                    aria-label="Nova tarefa"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="datetime-local"
                      aria-label="Prazo"
                      value={taskDueAt}
                      onChange={(e) => setTaskDueAt(e.target.value)}
                      className="flex-1"
                    />
                    <button
                      type="submit"
                      disabled={addTask.isPending}
                      className="shrink-0 rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
                    >
                      Adicionar
                    </button>
                  </div>
                </form>
              ) : null}
              {taskError ? (
                <p role="alert" className="mt-1 text-xs text-destructive">
                  {taskError}
                </p>
              ) : null}
              <ul className="mt-2 divide-y divide-border">
                {(tasks.data ?? []).map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-2 py-2 first:pt-0"
                  >
                    <Checkbox
                      checked={Boolean(task.doneAt)}
                      disabled={!canEdit || toggleTask.isPending}
                      onCheckedChange={() => toggleTask.mutate(task)}
                      aria-label={`Concluir ${task.title}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={
                          task.doneAt
                            ? "truncate text-sm text-muted-foreground line-through"
                            : "truncate text-sm"
                        }
                      >
                        {task.title}
                      </p>
                      {task.dueAt ? (
                        <p
                          className={`text-xs ${
                            !task.doneAt && new Date(task.dueAt) < new Date()
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          Prazo {formatDate(task.dueAt)}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
              {tasks.data?.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Nenhuma tarefa ainda.
                </p>
              ) : null}
            </section>
          </>
        ) : null}
      </div>
    </aside>
  );
}
