import { Link } from "@tanstack/react-router";
import { formatCurrency } from "@/lib/format";
import type { EntityDeal } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function EntityDealList({ deals }: { deals: EntityDeal[] | undefined }) {
  if (!deals?.length) {
    return (
      <p className="text-sm text-muted-foreground">Nenhum negócio vinculado.</p>
    );
  }
  return (
    <ul className="flex flex-col divide-y">
      {deals.map((deal) => (
        <li
          key={deal.id}
          className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
        >
          <div className="min-w-0">
            <Link
              to="/deals/$dealId"
              params={{ dealId: deal.id }}
              className="truncate text-sm font-medium hover:underline"
            >
              {deal.title}
            </Link>
            <p className="text-xs text-muted-foreground">{deal.pipelineName}</p>
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
  );
}
