import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Note, Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type EntityActivityProps = {
  workspaceId: string | undefined;
  /** Entity API path, e.g. `/contacts/<id>` — activity lives under
   * `${entityPath}/notes` and `${entityPath}/tasks`. */
  entityPath: string;
  isAdmin: boolean;
};

export function EntityTasksCard({
  workspaceId,
  entityPath,
  isAdmin,
}: EntityActivityProps) {
  const queryClient = useQueryClient();
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueAt, setTaskDueAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const tasksUrl = `${entityPath}/tasks`;
  const queryKey = ["entity-tasks", workspaceId, entityPath];

  const tasks = useQuery({
    queryKey,
    queryFn: () => api<Task[]>(tasksUrl, { workspaceId }),
    enabled: Boolean(workspaceId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const addTask = useMutation({
    mutationFn: () =>
      api<Task>(tasksUrl, {
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
      await invalidate();
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
    onSuccess: () => invalidate(),
    onError: () => setError("Não foi possível atualizar a tarefa."),
  });

  const removeTask = useMutation({
    mutationFn: (id: string) =>
      api<void>(`/tasks/${id}`, { method: "DELETE", workspaceId }),
    onSuccess: () => invalidate(),
    onError: () => setError("Não foi possível remover a tarefa."),
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    addTask.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarefas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={onSubmit}>
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

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

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
          <p className="text-sm text-muted-foreground">Nenhuma tarefa ainda.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function EntityNotesCard({
  workspaceId,
  entityPath,
  isAdmin,
  placeholder = "Escreva uma nota",
}: EntityActivityProps & { placeholder?: string }) {
  const queryClient = useQueryClient();
  const [noteBody, setNoteBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const notesUrl = `${entityPath}/notes`;
  const queryKey = ["entity-notes", workspaceId, entityPath];

  const notes = useQuery({
    queryKey,
    queryFn: () => api<Note[]>(notesUrl, { workspaceId }),
    enabled: Boolean(workspaceId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const addNote = useMutation({
    mutationFn: () =>
      api<Note>(notesUrl, {
        method: "POST",
        workspaceId,
        body: { body: noteBody },
      }),
    onSuccess: async () => {
      setNoteBody("");
      setError(null);
      await invalidate();
    },
    onError: () => setError("Não foi possível adicionar a nota."),
  });

  const removeNote = useMutation({
    mutationFn: (id: string) =>
      api<void>(`/notes/${id}`, { method: "DELETE", workspaceId }),
    onSuccess: () => invalidate(),
    onError: () => setError("Não foi possível remover a nota."),
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    addNote.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={onSubmit}>
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel htmlFor="note-body" className="sr-only">
                Nova nota
              </FieldLabel>
              <Textarea
                id="note-body"
                required
                placeholder={placeholder}
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

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

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
  );
}
