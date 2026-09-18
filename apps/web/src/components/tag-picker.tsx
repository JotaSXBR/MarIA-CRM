import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, TagIcon } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Tag } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function TagChip({ tag }: { tag: Tag }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      {tag.color ? (
        <span
          aria-hidden
          className="size-2 rounded-full"
          style={{ backgroundColor: tag.color }}
        />
      ) : null}
      {tag.name}
    </Badge>
  );
}

/** Assigned-tag chips plus the assign/create picker for one entity.
 * `entityPath` is the entity's API path (e.g. `/contacts/<id>`); tags live
 * under `${entityPath}/tags`. */
export function TagPicker({
  workspaceId,
  entityPath,
}: {
  workspaceId: string | undefined;
  entityPath: string;
}) {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const tagsUrl = `${entityPath}/tags`;

  const assigned = useQuery({
    queryKey: ["entity-tags", workspaceId, tagsUrl],
    queryFn: () => api<Tag[]>(tagsUrl, { workspaceId }),
    enabled: Boolean(workspaceId),
  });

  const allTags = useQuery({
    queryKey: ["tags", workspaceId],
    queryFn: () => api<Tag[]>("/tags", { workspaceId }),
    enabled: Boolean(workspaceId),
  });

  const assignedIds = new Set((assigned.data ?? []).map((tag) => tag.id));

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["entity-tags", workspaceId, tagsUrl],
      }),
      queryClient.invalidateQueries({ queryKey: ["tags", workspaceId] }),
    ]);

  const setTags = useMutation({
    mutationFn: (tagIds: string[]) =>
      api<Tag[]>(tagsUrl, {
        method: "PUT",
        workspaceId,
        body: { tagIds },
      }),
    onSuccess: async () => {
      setError(null);
      await invalidate();
    },
    onError: () => setError("Não foi possível atualizar as tags."),
  });

  const createTag = useMutation({
    mutationFn: (name: string) =>
      api<Tag>("/tags", {
        method: "POST",
        workspaceId,
        body: { name },
      }),
    onSuccess: async (tag) => {
      setNewName("");
      setError(null);
      await queryClient.invalidateQueries({
        queryKey: ["tags", workspaceId],
      });
      setTags.mutate([...assignedIds, tag.id]);
    },
    onError: (cause) =>
      setError(
        cause instanceof ApiError && cause.status === 409
          ? "Já existe uma tag com esse nome."
          : "Não foi possível criar a tag.",
      ),
  });

  const toggleTag = (tagId: string, checked: boolean) => {
    const next = new Set(assignedIds);
    if (checked) next.add(tagId);
    else next.delete(tagId);
    setTags.mutate([...next]);
  };

  const submitNewTag = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newName.trim();
    if (name) createTag.mutate(name);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {(assigned.data ?? []).map((tag) => (
        <TagChip key={tag.id} tag={tag} />
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="sm" aria-label="Editar tags" />}
        >
          <TagIcon data-icon="inline-start" />
          Tags
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Tags do workspace</DropdownMenuLabel>
            {(allTags.data ?? []).map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag.id}
                checked={assignedIds.has(tag.id)}
                onCheckedChange={(checked) =>
                  toggleTag(tag.id, checked === true)
                }
              >
                {tag.color ? (
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                ) : null}
                {tag.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
          {allTags.data?.length === 0 ? (
            <p className="px-1.5 py-1 text-sm text-muted-foreground">
              Nenhuma tag criada ainda.
            </p>
          ) : null}
          <DropdownMenuSeparator />
          <form onSubmit={submitNewTag} className="flex gap-1.5 p-1.5">
            <Input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Nova tag"
              aria-label="Nome da nova tag"
              className="h-8"
            />
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              disabled={!newName.trim() || createTag.isPending}
            >
              <PlusIcon data-icon="inline-start" />
              Criar
            </Button>
          </form>
          {error ? (
            <p role="alert" className="px-1.5 pb-1 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
