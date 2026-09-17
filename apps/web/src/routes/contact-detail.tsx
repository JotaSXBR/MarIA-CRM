import { useState, type FormEvent } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, TrashIcon } from "lucide-react";
import { api } from "@/lib/api";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  initials,
} from "@/lib/format";
import type { Contact, ContactDeal, Note, Task } from "@/lib/types";
import { useWorkspace } from "@/lib/workspace";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

export function ContactDetailPage() {
  const { contactId } = useParams({ strict: false }) as { contactId: string };
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const isAdmin = workspace?.role === "admin";
  const queryClient = useQueryClient();
  const [noteBody, setNoteBody] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueAt, setTaskDueAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const contact = useQuery({
    queryKey: ["contact", workspaceId, contactId],
    queryFn: () => api<Contact>(`/contacts/${contactId}`, { workspaceId }),
    enabled: Boolean(workspaceId && contactId),
  });

  const deals = useQuery({
    queryKey: ["contact-deals", workspaceId, contactId],
    queryFn: () =>
      api<ContactDeal[]>(`/contacts/${contactId}/deals`, { workspaceId }),
    enabled: Boolean(workspaceId && contactId),
  });

  const notes = useQuery({
    queryKey: ["contact-notes", workspaceId, contactId],
    queryFn: () => api<Note[]>(`/contacts/${contactId}/notes`, { workspaceId }),
    enabled: Boolean(workspaceId && contactId),
  });

  const tasks = useQuery({
    queryKey: ["contact-tasks", workspaceId, contactId],
    queryFn: () => api<Task[]>(`/contacts/${contactId}/tasks`, { workspaceId }),
    enabled: Boolean(workspaceId && contactId),
  });

  const invalidate = (key: string) =>
    queryClient.invalidateQueries({ queryKey: [key, workspaceId, contactId] });

  const addNote = useMutation({
    mutationFn: () =>
      api<Note>(`/contacts/${contactId}/notes`, {
        method: "POST",
        workspaceId,
        body: { body: noteBody },
      }),
    onSuccess: async () => {
      setNoteBody("");
      setError(null);
      await invalidate("contact-notes");
    },
    onError: () => setError("Não foi possível adicionar a nota."),
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
      setError(null);
      await invalidate("contact-tasks");
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
    onSuccess: () => invalidate("contact-tasks"),
    onError: () => setError("Não foi possível atualizar a tarefa."),
  });

  const removeNote = useMutation({
    mutationFn: (id: string) =>
      api<void>(`/notes/${id}`, { method: "DELETE", workspaceId }),
    onSuccess: () => invalidate("contact-notes"),
    onError: () => setError("Não foi possível remover a nota."),
  });

  const removeTask = useMutation({
    mutationFn: (id: string) =>
      api<void>(`/tasks/${id}`, { method: "DELETE", workspaceId }),
    onSuccess: () => invalidate("contact-tasks"),
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

  if (contact.isLoading) {
    return (
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </section>
    );
  }

  if (!contact.data) {
    return (
      <section className="mx-auto max-w-3xl">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Contato não encontrado</EmptyTitle>
            <EmptyDescription>
              O contato pode ter sido removido ou não pertence a este workspace.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/contacts" />}
          >
            Voltar para contatos
          </Button>
        </Empty>
      </section>
    );
  }

  const detail = contact.data;

  return (
    <section
      aria-labelledby="contact-title"
      className="mx-auto flex max-w-3xl flex-col gap-6"
    >
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        nativeButton={false}
        render={<Link to="/contacts" />}
      >
        <ArrowLeftIcon data-icon="inline-start" />
        Voltar para contatos
      </Button>

      <header className="flex items-center gap-4">
        <Avatar className="size-12">
          <AvatarFallback>{initials(detail.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 id="contact-title" className="truncate text-xl font-semibold">
            {detail.name}
          </h1>
          <p className="truncate text-sm text-muted-foreground">
            {[detail.email, detail.phone].filter(Boolean).join(" · ") ||
              "Sem email ou telefone"}
          </p>
        </div>
      </header>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Negócios</CardTitle>
        </CardHeader>
        <CardContent>
          {deals.data?.length ? (
            <ul className="flex flex-col divide-y">
              {deals.data.map((deal) => (
                <li
                  key={deal.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{deal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {deal.pipelineName}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {deal.valueCents !== null ? (
                      <span className="text-sm font-medium">
                        {formatCurrency(deal.valueCents)}
                      </span>
                    ) : null}
                    <Badge variant="secondary">{deal.stageName}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum negócio vinculado.
            </p>
          )}
        </CardContent>
      </Card>

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
                  placeholder="Escreva uma nota sobre este contato"
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
    </section>
  );
}
