import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { QuickReply } from "@/lib/types";
import { hasWorkspaceRole, useWorkspace } from "@/lib/workspace";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

function ReplyRow({
  reply,
  workspaceId,
  canEdit,
  canDelete,
}: {
  reply: QuickReply;
  workspaceId: string | undefined;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(reply.title);
  const [shortcut, setShortcut] = useState(reply.shortcut);
  const [body, setBody] = useState(reply.body);
  const [error, setError] = useState<string | null>(null);
  const dirty =
    title !== reply.title || shortcut !== reply.shortcut || body !== reply.body;

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["quick-replies", workspaceId],
    });

  const update = useMutation({
    mutationFn: () =>
      api<QuickReply>(`/quick-replies/${reply.id}`, {
        method: "PATCH",
        workspaceId,
        body: {
          ...(title !== reply.title ? { title } : {}),
          ...(shortcut !== reply.shortcut ? { shortcut } : {}),
          ...(body !== reply.body ? { body } : {}),
        },
      }),
    onSuccess: async () => {
      setError(null);
      await invalidate();
    },
    onError: (cause) =>
      setError(
        cause instanceof ApiError && cause.status === 409
          ? "Já existe uma resposta com esse atalho."
          : "Não foi possível atualizar a resposta.",
      ),
  });

  const remove = useMutation({
    mutationFn: () =>
      api<undefined>(`/quick-replies/${reply.id}`, {
        method: "DELETE",
        workspaceId,
      }),
    onSuccess: invalidate,
    onError: () => setError("Não foi possível remover a resposta."),
  });

  if (!canEdit) {
    return (
      <li className="rounded-md border border-border px-3 py-2">
        <p className="text-sm font-medium text-foreground">{reply.title}</p>
        <p className="text-xs text-muted-foreground">/{reply.shortcut}</p>
        <p className="mt-1 text-sm text-muted-foreground">{reply.body}</p>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-2 rounded-md border border-border px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-label={`Título da resposta ${reply.title}`}
          className="w-52"
        />
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">/</span>
          <Input
            value={shortcut}
            onChange={(event) => setShortcut(event.target.value)}
            aria-label={`Atalho da resposta ${reply.title}`}
            className="w-36"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={
            !dirty ||
            !title.trim() ||
            !shortcut.trim() ||
            !body.trim() ||
            update.isPending
          }
          onClick={() => update.mutate()}
        >
          Salvar
        </Button>
        {canDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Remover resposta ${reply.title}`}
            onClick={() => remove.mutate()}
          >
            <TrashIcon data-icon="inline-start" />
          </Button>
        ) : null}
      </div>
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        aria-label={`Texto da resposta ${reply.title}`}
        rows={2}
      />
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </li>
  );
}

export function SettingsRepliesPage() {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const canEdit = hasWorkspaceRole(workspace?.role, "agent");
  const canDelete = hasWorkspaceRole(workspace?.role, "manager");
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [shortcut, setShortcut] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: replies = [], isLoading } = useQuery({
    queryKey: ["quick-replies", workspaceId],
    queryFn: () => api<QuickReply[]>("/quick-replies", { workspaceId }),
    enabled: Boolean(workspaceId),
  });

  const createReply = useMutation({
    mutationFn: (input: { title: string; shortcut: string; body: string }) =>
      api<QuickReply>("/quick-replies", {
        method: "POST",
        workspaceId,
        body: input,
      }),
    onSuccess: async () => {
      setTitle("");
      setShortcut("");
      setBody("");
      setError(null);
      await queryClient.invalidateQueries({
        queryKey: ["quick-replies", workspaceId],
      });
    },
    onError: (cause) =>
      setError(
        cause instanceof ApiError && cause.status === 409
          ? "Já existe uma resposta com esse atalho."
          : "Não foi possível criar a resposta.",
      ),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedShortcut = shortcut.trim().replace(/^\/+/, "");
    const trimmedBody = body.trim();
    if (trimmedTitle && trimmedShortcut && trimmedBody) {
      createReply.mutate({
        title: trimmedTitle,
        shortcut: trimmedShortcut,
        body: trimmedBody,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Respostas rápidas</CardTitle>
        <CardDescription>
          Textos prontos que o operador insere na conversa com o atalho — ex.:
          /saudacao.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {canEdit ? (
          <form onSubmit={submit} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-reply-title">Título</Label>
                <Input
                  id="new-reply-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex.: Boas-vindas"
                  className="w-52"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-reply-shortcut">Atalho</Label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">/</span>
                  <Input
                    id="new-reply-shortcut"
                    value={shortcut}
                    onChange={(event) => setShortcut(event.target.value)}
                    placeholder="saudacao"
                    className="w-36"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-reply-body">Texto</Label>
              <Textarea
                id="new-reply-body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Olá! Como posso ajudar?"
                rows={3}
              />
            </div>
            <div>
              <Button
                type="submit"
                size="sm"
                disabled={
                  !title.trim() ||
                  !shortcut.trim() ||
                  !body.trim() ||
                  createReply.isPending
                }
              >
                Criar resposta
              </Button>
            </div>
          </form>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : replies.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma resposta rápida ainda — crie a primeira para acelerar o
            atendimento.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {replies.map((reply) => (
              <ReplyRow
                key={reply.id}
                reply={reply}
                workspaceId={workspaceId}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
