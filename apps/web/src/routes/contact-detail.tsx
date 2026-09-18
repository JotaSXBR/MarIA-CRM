import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { api } from "@/lib/api";
import { initials } from "@/lib/format";
import type { Company, Contact, EntityDeal } from "@/lib/types";
import { useWorkspace } from "@/lib/workspace";
import { EntityNotesCard, EntityTasksCard } from "@/components/entity-activity";
import { EntityAttributesCard } from "@/components/entity-attributes-card";
import { EntityDealList } from "@/components/entity-deal-list";
import { TagPicker } from "@/components/tag-picker";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

export function ContactDetailPage() {
  const { contactId } = useParams({ strict: false }) as { contactId: string };
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const isAdmin = workspace?.role === "admin";

  const contact = useQuery({
    queryKey: ["contact", workspaceId, contactId],
    queryFn: () => api<Contact>(`/contacts/${contactId}`, { workspaceId }),
    enabled: Boolean(workspaceId && contactId),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["companies", workspaceId],
    queryFn: () => api<Company[]>("/companies", { workspaceId }),
    enabled: Boolean(workspaceId),
  });

  const deals = useQuery({
    queryKey: ["contact-deals", workspaceId, contactId],
    queryFn: () =>
      api<EntityDeal[]>(`/contacts/${contactId}/deals`, { workspaceId }),
    enabled: Boolean(workspaceId && contactId),
  });

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
          {detail.companyId ? (
            <p className="truncate text-sm">
              <Link
                to="/companies/$companyId"
                params={{ companyId: detail.companyId }}
                className="text-muted-foreground hover:underline"
              >
                {companies.find((c) => c.id === detail.companyId)?.name ??
                  "Empresa"}
              </Link>
            </p>
          ) : null}
        </div>
      </header>

      <TagPicker
        workspaceId={workspaceId}
        entityPath={`/contacts/${contactId}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Negócios</CardTitle>
        </CardHeader>
        <CardContent>
          <EntityDealList deals={deals.data} />
        </CardContent>
      </Card>

      <EntityAttributesCard
        workspaceId={workspaceId}
        entityPath={`/contacts/${contactId}`}
      />

      <EntityTasksCard
        workspaceId={workspaceId}
        entityPath={`/contacts/${contactId}`}
        isAdmin={isAdmin}
      />

      <EntityNotesCard
        workspaceId={workspaceId}
        entityPath={`/contacts/${contactId}`}
        isAdmin={isAdmin}
        placeholder="Escreva uma nota sobre este contato"
      />
    </section>
  );
}
