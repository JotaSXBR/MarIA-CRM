import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { api } from "@/lib/api";
import type { Company, Contact } from "@/lib/types";
import { useWorkspace } from "@/lib/workspace";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type SearchResults = {
  contacts: Pick<Contact, "id" | "name" | "email">[];
  companies: Pick<Company, "id" | "name">[];
  deals: { id: string; title: string }[];
};

function ResultSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col divide-y">{children}</ul>
      </CardContent>
    </Card>
  );
}

export function SearchPage() {
  const { q } = useSearch({ strict: false }) as { q?: string };
  const query = q ?? "";
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const [input, setInput] = useState(query);

  const results = useQuery({
    queryKey: ["search", workspaceId, query],
    queryFn: () =>
      api<SearchResults>(`/search?q=${encodeURIComponent(query)}`, {
        workspaceId,
      }),
    enabled: Boolean(workspaceId && query),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void navigate({
      to: "/search",
      search: { q: input.trim() || undefined },
    });
  };

  const empty =
    results.data &&
    !results.data.contacts.length &&
    !results.data.companies.length &&
    !results.data.deals.length;

  return (
    <section
      aria-labelledby="search-title"
      className="mx-auto flex max-w-3xl flex-col gap-6"
    >
      <h1 id="search-title" className="text-xl font-semibold">
        Busca
      </h1>

      <form onSubmit={submit} className="flex gap-2">
        <Input
          aria-label="Termo de busca"
          placeholder="Buscar contatos, empresas e negócios"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={!input.trim()}>
          <SearchIcon data-icon="inline-start" />
          Buscar
        </Button>
      </form>

      {!query ? (
        <p className="text-sm text-muted-foreground">
          Digite um nome, email, telefone ou título de negócio.
        </p>
      ) : results.isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : empty ? (
        <p className="text-sm text-muted-foreground">
          Nenhum resultado para “{query}”.
        </p>
      ) : (
        <>
          {results.data?.contacts.length ? (
            <ResultSection title="Contatos">
              {results.data.contacts.map((contact) => (
                <li key={contact.id}>
                  <Link
                    to="/contacts/$contactId"
                    params={{ contactId: contact.id }}
                    className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 hover:underline"
                  >
                    <span className="text-sm font-medium">{contact.name}</span>
                    {contact.email ? (
                      <span className="text-xs text-muted-foreground">
                        {contact.email}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ResultSection>
          ) : null}

          {results.data?.companies.length ? (
            <ResultSection title="Empresas">
              {results.data.companies.map((company) => (
                <li key={company.id}>
                  <Link
                    to="/companies/$companyId"
                    params={{ companyId: company.id }}
                    className="block py-3 text-sm font-medium first:pt-0 last:pb-0 hover:underline"
                  >
                    {company.name}
                  </Link>
                </li>
              ))}
            </ResultSection>
          ) : null}

          {results.data?.deals.length ? (
            <ResultSection title="Negócios">
              {results.data.deals.map((deal) => (
                <li key={deal.id}>
                  <Link
                    to="/deals/$dealId"
                    params={{ dealId: deal.id }}
                    className="block py-3 text-sm font-medium first:pt-0 last:pb-0 hover:underline"
                  >
                    {deal.title}
                  </Link>
                </li>
              ))}
            </ResultSection>
          ) : null}
        </>
      )}
    </section>
  );
}
