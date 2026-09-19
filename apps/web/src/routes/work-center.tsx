import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { WorkQueue } from "@/lib/types";
import { useWorkspace } from "@/lib/workspace";

function QueueSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-white">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="px-4 py-2">{children}</div>
    </section>
  );
}

function EmptyRow() {
  return <p className="py-2 text-sm text-muted-foreground">Nada pendente.</p>;
}

function conversationLabel(contactName: string | null, threadId: string) {
  return contactName ?? threadId;
}

/** Operator work center: the single actionable queue — unassigned and
 * unanswered conversations, sends needing resolution, overdue tasks and
 * deals with no open next step. Every row links to the owning surface. */
export function WorkCenterPage() {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const queue = useQuery({
    queryKey: ["work-queue", workspaceId],
    queryFn: () => api<WorkQueue>("/work-queue", { workspaceId }),
    enabled: Boolean(workspaceId),
  });
  const data = queue.data;

  return (
    <section
      aria-labelledby="work-center-title"
      className="mx-auto max-w-3xl space-y-4"
    >
      <h1
        id="work-center-title"
        className="text-lg font-semibold text-foreground"
      >
        Central do operador
      </h1>
      {queue.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando fila...</p>
      ) : !data ? (
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar a fila.
        </p>
      ) : (
        <>
          <QueueSection
            title="Aguardando resposta"
            count={data.awaitingReply.length}
          >
            {data.awaitingReply.length === 0 ? (
              <EmptyRow />
            ) : (
              <ul className="divide-y divide-border">
                {data.awaitingReply.map((item) => (
                  <li key={item.id} className="py-2 first:pt-0 last:pb-0">
                    <Link
                      to="/inbox"
                      className="flex items-center justify-between gap-3 text-sm hover:underline"
                    >
                      <span className="truncate font-medium">
                        {conversationLabel(
                          item.contactName,
                          item.providerThreadId,
                        )}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {item.lastInboundAt
                          ? formatDateTime(item.lastInboundAt)
                          : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </QueueSection>

          <QueueSection title="Sem responsável" count={data.unassigned.length}>
            {data.unassigned.length === 0 ? (
              <EmptyRow />
            ) : (
              <ul className="divide-y divide-border">
                {data.unassigned.map((item) => (
                  <li key={item.id} className="py-2 first:pt-0 last:pb-0">
                    <Link
                      to="/inbox"
                      className="flex items-center justify-between gap-3 text-sm hover:underline"
                    >
                      <span className="truncate font-medium">
                        {conversationLabel(
                          item.contactName,
                          item.providerThreadId,
                        )}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {item.updatedAt ? formatDateTime(item.updatedAt) : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </QueueSection>

          <QueueSection
            title="Envios para revisar"
            count={data.sendIssues.length}
          >
            {data.sendIssues.length === 0 ? (
              <EmptyRow />
            ) : (
              <ul className="divide-y divide-border">
                {data.sendIssues.map((item) => (
                  <li key={item.id} className="py-2 first:pt-0 last:pb-0">
                    <Link
                      to="/inbox"
                      className="flex items-center justify-between gap-3 text-sm hover:underline"
                    >
                      <span className="truncate font-medium">
                        {item.contactName ?? "Contato"}
                      </span>
                      <span className="flex shrink-0 items-center gap-2 text-xs">
                        <span
                          className={
                            item.status === "failed"
                              ? "text-destructive"
                              : "text-amber-600"
                          }
                        >
                          {item.status === "failed"
                            ? "Falhou"
                            : "Resultado desconhecido"}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDateTime(item.createdAt)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </QueueSection>

          <QueueSection
            title="Tarefas vencidas"
            count={data.overdueTasks.length}
          >
            {data.overdueTasks.length === 0 ? (
              <EmptyRow />
            ) : (
              <ul className="divide-y divide-border">
                {data.overdueTasks.map((task) => (
                  <li key={task.id} className="py-2 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate font-medium">{task.title}</span>
                      <span className="shrink-0 text-xs text-destructive">
                        {formatDateTime(task.dueAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {[
                        task.assigneeName,
                        task.contactId && task.contactName ? (
                          <Link
                            key="contact"
                            to="/contacts/$contactId"
                            params={{ contactId: task.contactId }}
                            className="hover:underline"
                          >
                            {task.contactName}
                          </Link>
                        ) : (
                          task.contactName
                        ),
                      ]
                        .filter(Boolean)
                        .reduce<React.ReactNode[]>(
                          (acc, part, index) =>
                            index === 0 ? [part] : [...acc, " · ", part],
                          [],
                        )}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </QueueSection>

          <QueueSection
            title="Negócios sem próxima ação"
            count={data.idleDeals.length}
          >
            {data.idleDeals.length === 0 ? (
              <EmptyRow />
            ) : (
              <ul className="divide-y divide-border">
                {data.idleDeals.map((deal) => (
                  <li key={deal.id} className="py-2 first:pt-0 last:pb-0">
                    <Link
                      to="/deals/$dealId"
                      params={{ dealId: deal.id }}
                      className="flex items-center justify-between gap-3 text-sm hover:underline"
                    >
                      <span className="truncate font-medium">{deal.title}</span>
                      <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                        {deal.valueCents !== null
                          ? formatCurrency(deal.valueCents)
                          : null}
                        <span>
                          {deal.pipelineName} · {deal.stageName}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </QueueSection>
        </>
      )}
    </section>
  );
}
