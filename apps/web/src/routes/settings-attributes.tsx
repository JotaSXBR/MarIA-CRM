import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type {
  AttributeDefinition,
  AttributeEntityType,
  AttributeType,
} from "@/lib/types";
import { useWorkspace } from "@/lib/workspace";
import { Badge } from "@/components/ui/badge";
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

const ENTITY_LABELS: Record<AttributeEntityType, string> = {
  contact: "Contatos",
  company: "Empresas",
  deal: "Negócios",
};

const TYPE_LABELS: Record<AttributeType, string> = {
  text: "Texto",
  number: "Número",
  date: "Data",
  boolean: "Sim/não",
  select: "Seleção",
};

const selectClass =
  "h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

const parseOptions = (raw: string) =>
  raw
    .split(",")
    .map((option) => option.trim())
    .filter(Boolean);

function AttributeRow({
  attribute,
  workspaceId,
  isAdmin,
}: {
  attribute: AttributeDefinition;
  workspaceId: string | undefined;
  isAdmin: boolean;
}) {
  const queryClient = useQueryClient();
  const [label, setLabel] = useState(attribute.label);
  const [options, setOptions] = useState((attribute.options ?? []).join(", "));
  const [error, setError] = useState<string | null>(null);
  const dirty =
    label !== attribute.label ||
    (attribute.type === "select" &&
      options !== (attribute.options ?? []).join(", "));

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["attributes", workspaceId] });

  const update = useMutation({
    mutationFn: () =>
      api<AttributeDefinition>(`/attributes/${attribute.id}`, {
        method: "PATCH",
        workspaceId,
        body: {
          ...(label !== attribute.label ? { label } : {}),
          ...(attribute.type === "select"
            ? { options: parseOptions(options) }
            : {}),
        },
      }),
    onSuccess: async () => {
      setError(null);
      await invalidate();
    },
    onError: () => setError("Não foi possível atualizar o atributo."),
  });

  const remove = useMutation({
    mutationFn: () =>
      api<undefined>(`/attributes/${attribute.id}`, {
        method: "DELETE",
        workspaceId,
      }),
    onSuccess: invalidate,
    onError: () => setError("Não foi possível remover o atributo."),
  });

  return (
    <li className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          aria-label={`Nome do atributo ${attribute.label}`}
          className="w-44"
        />
        <Badge variant="secondary">{TYPE_LABELS[attribute.type]}</Badge>
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          {attribute.key}
        </code>
        {attribute.type === "select" ? (
          <Input
            value={options}
            onChange={(event) => setOptions(event.target.value)}
            aria-label={`Opções do atributo ${attribute.label}`}
            placeholder="Opções separadas por vírgula"
            className="w-64"
          />
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!dirty || !label.trim() || update.isPending}
          onClick={() => update.mutate()}
        >
          Salvar
        </Button>
        {isAdmin ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Remover atributo ${attribute.label}`}
            onClick={() => remove.mutate()}
          >
            <TrashIcon data-icon="inline-start" />
          </Button>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </li>
  );
}

export function SettingsAttributesPage() {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const isAdmin = workspace?.role === "admin";
  const queryClient = useQueryClient();
  const [entityType, setEntityType] = useState<AttributeEntityType>("contact");
  const [label, setLabel] = useState("");
  const [type, setType] = useState<AttributeType>("text");
  const [options, setOptions] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: attributes = [], isLoading } = useQuery({
    queryKey: ["attributes", workspaceId],
    queryFn: () => api<AttributeDefinition[]>("/attributes", { workspaceId }),
    enabled: Boolean(workspaceId),
  });

  const createAttribute = useMutation({
    mutationFn: () =>
      api<AttributeDefinition>("/attributes", {
        method: "POST",
        workspaceId,
        body: {
          entityType,
          label: label.trim(),
          type,
          ...(type === "select" ? { options: parseOptions(options) } : {}),
        },
      }),
    onSuccess: async () => {
      setLabel("");
      setType("text");
      setOptions("");
      setError(null);
      await queryClient.invalidateQueries({
        queryKey: ["attributes", workspaceId],
      });
    },
    onError: (cause) =>
      setError(
        cause instanceof ApiError && cause.status === 409
          ? "Já existe um atributo com essa chave para esta entidade."
          : "Não foi possível criar o atributo.",
      ),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (label.trim()) createAttribute.mutate();
  };

  const byEntity = (kind: AttributeEntityType) =>
    attributes.filter((attribute) => attribute.entityType === kind);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atributos</CardTitle>
        <CardDescription>
          Atributos personalizados aparecem nas páginas de contatos, empresas e
          negócios do workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-attr-entity">Entidade</Label>
            <select
              id="new-attr-entity"
              aria-label="Entidade"
              value={entityType}
              onChange={(event) =>
                setEntityType(event.target.value as AttributeEntityType)
              }
              className={selectClass}
            >
              {Object.entries(ENTITY_LABELS).map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-attr-label">Nome</Label>
            <Input
              id="new-attr-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Ex.: Segmento"
              className="w-44"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-attr-type">Tipo</Label>
            <select
              id="new-attr-type"
              aria-label="Tipo"
              value={type}
              onChange={(event) => setType(event.target.value as AttributeType)}
              className={selectClass}
            >
              {Object.entries(TYPE_LABELS).map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </div>
          {type === "select" ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-attr-options">Opções</Label>
              <Input
                id="new-attr-options"
                value={options}
                onChange={(event) => setOptions(event.target.value)}
                placeholder="Opções separadas por vírgula"
                className="w-64"
              />
            </div>
          ) : null}
          <Button
            type="submit"
            size="sm"
            disabled={
              !label.trim() ||
              (type === "select" && parseOptions(options).length === 0) ||
              createAttribute.isPending
            }
          >
            Criar atributo
          </Button>
        </form>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          (Object.keys(ENTITY_LABELS) as AttributeEntityType[]).map((kind) => (
            <section key={kind} className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                {ENTITY_LABELS[kind]}
              </h3>
              {byEntity(kind).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum atributo criado.
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {byEntity(kind).map((attribute) => (
                    <AttributeRow
                      key={attribute.id}
                      attribute={attribute}
                      workspaceId={workspaceId}
                      isAdmin={isAdmin}
                    />
                  ))}
                </ul>
              )}
            </section>
          ))
        )}
      </CardContent>
    </Card>
  );
}
