import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AttributeValue, EntityAttribute } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type EntityAttributesCardProps = {
  workspaceId: string | undefined;
  /** Entity API path, e.g. `/contacts/<id>` — attributes live under
   * `${entityPath}/attributes`. */
  entityPath: string;
  canEdit: boolean;
};

const selectClass =
  "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

function AttributeInput({
  attribute,
  value,
  onChange,
}: {
  attribute: EntityAttribute;
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
}) {
  const id = `attr-${attribute.id}`;
  switch (attribute.type) {
    case "number":
      return (
        <Input
          id={id}
          type="number"
          step="any"
          value={typeof value === "number" ? value : ""}
          onChange={(event) =>
            onChange(
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
        />
      );
    case "date":
      return (
        <Input
          id={id}
          type="date"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value || null)}
        />
      );
    case "boolean":
      return (
        <Checkbox
          id={id}
          checked={value === true}
          onCheckedChange={(checked) => onChange(checked === true)}
          aria-label={attribute.label}
        />
      );
    case "select":
      return (
        <select
          id={id}
          aria-label={attribute.label}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value || null)}
          className={selectClass}
        >
          <option value="">—</option>
          {(attribute.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    default:
      return (
        <Input
          id={id}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value || null)}
        />
      );
  }
}

export function EntityAttributesCard({
  workspaceId,
  entityPath,
  canEdit,
}: EntityAttributesCardProps) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Record<string, AttributeValue>>({});
  const [error, setError] = useState<string | null>(null);
  const attributesUrl = `${entityPath}/attributes`;
  const queryKey = ["entity-attributes", workspaceId, entityPath];

  const attributes = useQuery({
    queryKey,
    queryFn: () => api<EntityAttribute[]>(attributesUrl, { workspaceId }),
    enabled: Boolean(workspaceId),
  });

  const list = Array.isArray(attributes.data) ? attributes.data : [];

  const valueOf = (attribute: EntityAttribute): AttributeValue =>
    attribute.id in draft ? (draft[attribute.id] ?? null) : attribute.value;

  const dirty = list.some(
    (attribute) => valueOf(attribute) !== attribute.value,
  );

  const save = useMutation({
    mutationFn: () =>
      api<EntityAttribute[]>(attributesUrl, {
        method: "PUT",
        workspaceId,
        body: {
          values: list.map((attribute) => ({
            attributeId: attribute.id,
            value: valueOf(attribute),
          })),
        },
      }),
    onSuccess: async () => {
      setDraft({});
      setError(null);
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: () => setError("Não foi possível salvar os atributos."),
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
  };

  if (!attributes.isPending && list.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atributos</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={onSubmit}>
          <fieldset disabled={!canEdit} className="contents">
            <FieldGroup className="gap-3">
              {list.map((attribute) => (
                <Field
                  key={attribute.id}
                  orientation={
                    attribute.type === "boolean" ? "horizontal" : "vertical"
                  }
                >
                  <FieldLabel htmlFor={`attr-${attribute.id}`}>
                    {attribute.label}
                  </FieldLabel>
                  <AttributeInput
                    attribute={attribute}
                    value={valueOf(attribute)}
                    onChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        [attribute.id]: value,
                      }))
                    }
                  />
                </Field>
              ))}
              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={!dirty || save.isPending}
                >
                  Salvar atributos
                </Button>
              </div>
            </FieldGroup>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  );
}
