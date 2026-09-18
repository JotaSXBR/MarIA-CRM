import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Tag } from "@/lib/types";
import { hasWorkspaceRole, useWorkspace } from "@/lib/workspace";
import { TagChip } from "@/components/tag-picker";
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

function TagRow({
  tag,
  workspaceId,
  canManage,
}: {
  tag: Tag;
  workspaceId: string | undefined;
  canManage: boolean;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color ?? "");
  const [error, setError] = useState<string | null>(null);
  const dirty = name !== tag.name || (color || null) !== tag.color;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["tags", workspaceId] });

  const update = useMutation({
    mutationFn: () =>
      api<Tag>(`/tags/${tag.id}`, {
        method: "PATCH",
        workspaceId,
        body: {
          ...(name !== tag.name ? { name } : {}),
          color: color || null,
        },
      }),
    onSuccess: async () => {
      setError(null);
      await invalidate();
    },
    onError: (cause) =>
      setError(
        cause instanceof ApiError && cause.status === 409
          ? "Já existe uma tag com esse nome."
          : "Não foi possível atualizar a tag.",
      ),
  });

  const remove = useMutation({
    mutationFn: () =>
      api<undefined>(`/tags/${tag.id}`, {
        method: "DELETE",
        workspaceId,
      }),
    onSuccess: invalidate,
    onError: () => setError("Não foi possível remover a tag."),
  });

  if (!canManage) {
    return (
      <li>
        <TagChip tag={tag} />
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-label={`Nome da tag ${tag.name}`}
          className="w-44"
        />
        <Input
          type="color"
          value={color || "#64748b"}
          onChange={(event) => setColor(event.target.value)}
          aria-label={`Cor da tag ${tag.name}`}
          className="h-8 w-12 cursor-pointer p-1"
        />
        {color ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setColor("")}
          >
            Sem cor
          </Button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!dirty || !name.trim() || update.isPending}
          onClick={() => update.mutate()}
        >
          Salvar
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`Remover tag ${tag.name}`}
          onClick={() => remove.mutate()}
        >
          <TrashIcon data-icon="inline-start" />
        </Button>
        <TagChip tag={{ ...tag, name, color: color || null }} />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </li>
  );
}

export function SettingsTagsPage() {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const canManage = hasWorkspaceRole(workspace?.role, "manager");
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["tags", workspaceId],
    queryFn: () => api<Tag[]>("/tags", { workspaceId }),
    enabled: Boolean(workspaceId),
  });

  const createTag = useMutation({
    mutationFn: (input: { name: string; color: string | null }) =>
      api<Tag>("/tags", {
        method: "POST",
        workspaceId,
        body: input,
      }),
    onSuccess: async () => {
      setName("");
      setColor("");
      setError(null);
      await queryClient.invalidateQueries({
        queryKey: ["tags", workspaceId],
      });
    },
    onError: (cause) =>
      setError(
        cause instanceof ApiError && cause.status === 409
          ? "Já existe uma tag com esse nome."
          : "Não foi possível criar a tag.",
      ),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed) createTag.mutate({ name: trimmed, color: color || null });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
        <CardDescription>
          Tags classificam contatos, empresas e negócios do workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {canManage ? (
          <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-tag-name">Nome</Label>
              <Input
                id="new-tag-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Prioridade"
                className="w-44"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-tag-color">Cor</Label>
              <Input
                id="new-tag-color"
                type="color"
                value={color || "#64748b"}
                onChange={(event) => setColor(event.target.value)}
                className="h-9 w-14 cursor-pointer p-1"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!name.trim() || createTag.isPending}
            >
              Criar tag
            </Button>
          </form>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma tag criada ainda.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {tags.map((tag) => (
              <TagRow
                key={tag.id}
                tag={tag}
                workspaceId={workspaceId}
                canManage={canManage}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
