import { useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Company, Contact, DealDetail } from "@/lib/types";
import { useWorkspace } from "@/lib/workspace";
import { DealEditor } from "@/components/deal-editor";
import { EntityNotesCard, EntityTasksCard } from "@/components/entity-activity";
import { TagPicker } from "@/components/tag-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

export function DealDetailPage() {
  const { dealId } = useParams({ strict: false }) as { dealId: string };
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const isAdmin = workspace?.role === "admin";
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

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

  const invalidate = (key: string) =>
    queryClient.invalidateQueries({ queryKey: [key, workspaceId, dealId] });

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
        <TagPicker workspaceId={workspaceId} entityPath={`/deals/${dealId}`} />
      </header>

      <EntityTasksCard
        workspaceId={workspaceId}
        entityPath={`/deals/${dealId}`}
        isAdmin={isAdmin}
      />

      <EntityNotesCard
        workspaceId={workspaceId}
        entityPath={`/deals/${dealId}`}
        isAdmin={isAdmin}
        placeholder="Escreva uma nota sobre este negócio"
      />

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
