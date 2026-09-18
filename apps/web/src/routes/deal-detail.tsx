import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, PencilIcon, TrashIcon } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import type { Company, Contact, DealDetail, Note, Task } from "@/lib/types";
import { useWorkspace } from "@/lib/workspace";
import { DealEditor } from "@/components/deal-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export function DealDetailPage() {
  const { dealId } = useParams({ strict: false }) as { dealId: string };
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const isAdmin = workspace?.role === "admin";
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [noteBody, setNoteBody] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueAt, setTaskDueAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const deal = useQuery({
    queryKey: ["deal", workspaceId, dealId],
    queryFn: () => api<DealDetail>(`/deals/${dealId}`, { workspaceId }),
    enabled: Boolean(workspaceId && dealId),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts", workspaceId],
    queryFn: () => api<Contact[]>("/contacts", { workspaceId }),
    enabled: Boolean(workspaceId && editing),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["companies", workspaceId],
    queryFn: () => api<Company[]>("/companies", { workspaceId }),
    enabled: Boolean(workspaceId && editing),
  });

  const notes = useQuery({
    queryKey: ["deal-notes", workspaceId, dealId],
    queryFn: () => api<Note[]>(`/deals/${dealId}/notes`, { workspaceId }),
    enabled: Boolean(workspaceId && dealId),
  });

  const tasks = useQuery({
    queryKey: ["deal-tasks", workspaceId, dealId],
    queryFn: () => api<Task[]>(`/deals/${dealId}/tasks`, { workspaceId }),
    enabled: Boolean(workspaceId && dealId),
  });

  const invalidate = (key: string) =>
    queryClient.invalidateQueries({ queryKey: [key, workspaceId, dealId] });

  const addNote = useMutation({
    mutationFn: () =>
      api<Note>(`/deals/${dealId}/notes`, {
        method: "POST",
        workspaceId,
        body: { body: noteBody },
      }),
    onSuccess: async () => {
      setNoteBody("");
      setError(null);
      await invalidate("deal-notes");
    },
    onError: () => setError("Não foi possível adicionar a nota."),
  });

  const addTask = useMutation({
    mutationFn: () =>
      api<Task>(`/deals/${dealId}/tasks`, {
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
      setError(null);
      await invalidate("deal-tasks");
    },
    onError: () => setError("Não foi possível adicionar a tarefa."),
  });

  const toggleTask = useMutation({
    mutationFn: (task: Task) =>
      api<Task>(`/tasks/${task.id}`, {
        method: "PATCH",
        workspaceId,
        body: { done: !task.doneAt },
      }),
    onSuccess: () => invalidate("deal-tasks"),
    onError: () => setError("Não foi possível atualizar a tarefa."),
  });

  const removeNote = useMutation({
    mutationFn: (id: string) =>
      api<void>(`/notes/${id}`, { method: "DELETE", workspaceId }),
    onSuccess: () => invalidate("deal-notes"),
    onError: () => setError("Não foi possível remover a nota."),
  });

  const removeTask = useMutation({
    mutationFn: (id: string) =>
      api<void>(`/tasks/${id}`, { method: "DELETE", workspaceId }),
    onSuccess: () => invalidate("deal-tasks"),
    onError: () => setError("Não foi possível remover a tarefa."),
  });

  const onNoteSubmit = (event: FormEvent) => {
    event.preventDefault();
    addNote.mutate();
  };

  const onTaskSubmit = (event: FormEvent) => {
    event.preventDefault();
    addTask.mutate();
  };

  if (!workspaceId) return <p>Selecione um workspace.</p>;

  if (deal.isLoading) {
    return (
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        <Skeleton className="h-4 w-32" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </section>
    );
  }

  if (!deal.data) {
    return (
      <section className="mx-auto max-w-3xl">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Negócio não encontrado</EmptyTitle>
            <EmptyDescription>
              O negócio pode ter sido removido ou não pertence a este workspace.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/pipelines" />}
          >
            Voltar para pipelines
          </Button>
        </Empty>
      </section>
    );
  }

  const detail = deal.data;

  return (
    <section
      aria-labelledby="deal-title"
      className="mx-auto flex max-w-3xl flex-col gap-6"
    >
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          nativeButton={false}
          render={<Link to="/pipelines" />}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Voltar para pipelines
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          <PencilIcon data-icon="inline-start" />
          Editar
        </Button>
      </div>

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 id="deal-title" className="text-xl font-semibold">
            {detail.title}
          </h1>
          <Badge variant="secondary">{detail.stageName}</Badge>
          {detail.valueCents !== null ? (
            <span className="text-lg font-semibold">
              {formatCurrency(detail.valueCents)}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {[
            detail.pipelineName,
            detail.contactName ? `Contato: ${detail.contactName}` : null,
            detail.companyName ? `Empresa: ${detail.companyName}` : null,
            `Criado em ${formatDate(detail.createdAt)}`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className="flex flex-wrap gap-2">
          {detail.contactId && detail.contactName ? (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <Link
                  to="/contacts/$contactId"
                  params={{ contactId: detail.contactId }}
                />
              }
            >
              {detail.contactName}
            </Button>
          ) : null}
          {detail.companyId && detail.companyName ? (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <Link
                  to="/companies/$companyId"
                  params={{ companyId: detail.companyId }}
                />
              }
            >
              {detail.companyName}
            </Button>
          ) : null}
        </div>
      </header>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Tarefas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={onTaskSubmit}>
            <FieldGroup className="gap-3">
              <div className="flex gap-2">
                <Field className="flex-1">
                  <FieldLabel htmlFor="task-title" className="sr-only">
                    Título da tarefa
                  </FieldLabel>
                  <Input
                    id="task-title"
                    required
                    placeholder="Nova tarefa"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                </Field>
                <Field className="w-44">
                  <FieldLabel htmlFor="task-due-at" className="sr-only">
                    Prazo
                  </FieldLabel>
                  <Input
                    id="task-due-at"
                    type="datetime-local"
                    aria-label="Prazo"
                    value={taskDueAt}
                    onChange={(e) => setTaskDueAt(e.target.value)}
                  />
                </Field>
                <Button type="submit" disabled={addTask.isPending}>
                  Adicionar tarefa
                </Button>
              </div>
            </FieldGroup>
          </form>

          {tasks.data?.length ? (
            <ul className="flex flex-col divide-y">
              {tasks.data.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <Checkbox
                    checked={Boolean(task.doneAt)}
                    onCheckedChange={() => toggleTask.mutate(task)}
                    aria-label={`Concluir ${task.title}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={
                        task.doneAt
                          ? "truncate text-sm text-muted-foreground line-through"
                          : "truncate text-sm font-medium"
                      }
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[
                        task.assigneeName,
                        task.dueAt ? `Prazo ${formatDate(task.dueAt)}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  {isAdmin ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remover ${task.title}`}
                      onClick={() => removeTask.mutate(task.id)}
                    >
                      <TrashIcon />
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma tarefa ainda.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={onNoteSubmit}>
            <FieldGroup className="gap-3">
              <Field>
                <FieldLabel htmlFor="note-body" className="sr-only">
                  Nova nota
                </FieldLabel>
                <Textarea
                  id="note-body"
                  required
                  placeholder="Escreva uma nota sobre este negócio"
                  rows={3}
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                />
              </Field>
              <Button
                type="submit"
                disabled={addNote.isPending}
                className="w-fit"
              >
                Adicionar nota
              </Button>
            </FieldGroup>
          </form>

          {notes.data?.length ? (
            <ul className="flex flex-col divide-y">
              {notes.data.map((note) => (
                <li
                  key={note.id}
                  className="flex gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm whitespace-pre-wrap">{note.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[
                        note.authorName ?? "Alguém",
                        formatDateTime(note.createdAt),
                      ].join(" · ")}
                    </p>
                  </div>
                  {isAdmin ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remover nota"
                      onClick={() => removeNote.mutate(note.id)}
                    >
                      <TrashIcon />
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma nota ainda.</p>
          )}
        </CardContent>
      </Card>

      {editing ? (
        <DealEditor
          deal={detail}
          isAdmin={isAdmin}
          contacts={contacts}
          companies={companies}
          onClose={() => setEditing(false)}
          onSaved={() => invalidate("deal")}
          onDeleted={() => navigate({ to: "/pipelines" })}
        />
      ) : null}
    </section>
  );
}
