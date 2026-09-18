import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { api } from "@/lib/api";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  initials,
} from "@/lib/format";
import type { Company, Contact, EntityDeal, Note } from "@/lib/types";
import { useWorkspace } from "@/lib/workspace";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

export function CompanyDetailPage() {
  const { companyId } = useParams({ strict: false }) as { companyId: string };
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;

  const company = useQuery({
    queryKey: ["company", workspaceId, companyId],
    queryFn: () => api<Company>(`/companies/${companyId}`, { workspaceId }),
    enabled: Boolean(workspaceId && companyId),
  });

  const contacts = useQuery({
    queryKey: ["company-contacts", workspaceId, companyId],
    queryFn: () =>
      api<Contact[]>(`/companies/${companyId}/contacts`, { workspaceId }),
    enabled: Boolean(workspaceId && companyId),
  });

  const deals = useQuery({
    queryKey: ["company-deals", workspaceId, companyId],
    queryFn: () =>
      api<EntityDeal[]>(`/companies/${companyId}/deals`, { workspaceId }),
    enabled: Boolean(workspaceId && companyId),
  });

  const notes = useQuery({
    queryKey: ["company-notes", workspaceId, companyId],
    queryFn: () =>
      api<Note[]>(`/companies/${companyId}/notes`, { workspaceId }),
    enabled: Boolean(workspaceId && companyId),
  });

  if (!workspaceId) return <p>Selecione um workspace.</p>;

  if (company.isLoading) {
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

  if (!company.data) {
    return (
      <section className="mx-auto max-w-3xl">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Empresa não encontrada</EmptyTitle>
            <EmptyDescription>
              A empresa pode ter sido removida ou não pertence a este workspace.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/companies" />}
          >
            Voltar para empresas
          </Button>
        </Empty>
      </section>
    );
  }

  const detail = company.data;

  return (
    <section
      aria-labelledby="company-title"
      className="mx-auto flex max-w-3xl flex-col gap-6"
    >
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        nativeButton={false}
        render={<Link to="/companies" />}
      >
        <ArrowLeftIcon data-icon="inline-start" />
        Voltar para empresas
      </Button>

      <header className="flex items-center gap-4">
        <Avatar className="size-12">
          <AvatarFallback>{initials(detail.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 id="company-title" className="truncate text-xl font-semibold">
            {detail.name}
          </h1>
          <p className="truncate text-sm text-muted-foreground">
            Criada em {formatDate(detail.createdAt)}
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Contatos</CardTitle>
        </CardHeader>
        <CardContent>
          {contacts.data?.length ? (
            <ul className="flex flex-col divide-y">
              {contacts.data.map((contact) => (
                <li key={contact.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    to="/contacts/$contactId"
                    params={{ contactId: contact.id }}
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {contact.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {[contact.email, contact.phone]
                      .filter(Boolean)
                      .join(" · ") || "Sem email ou telefone"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum contato vinculado.
            </p>
          )}
        </CardContent>
      </Card>

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
          <CardTitle>Notas</CardTitle>
        </CardHeader>
        <CardContent>
          {notes.data?.length ? (
            <ul className="flex flex-col divide-y">
              {notes.data.map((note) => (
                <li key={note.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm whitespace-pre-wrap">{note.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[
                      note.authorName ?? "Alguém",
                      formatDateTime(note.createdAt),
                    ].join(" · ")}
                  </p>
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
