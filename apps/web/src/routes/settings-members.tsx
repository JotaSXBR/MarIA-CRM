import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CopyIcon, TrashIcon } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Invitation, WorkspaceMember } from "@/lib/types";
import {
  hasWorkspaceRole,
  useWorkspace,
  WORKSPACE_ROLE_LABELS,
  type WorkspaceRole,
} from "@/lib/workspace";
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

const INVITABLE_ROLES = ["viewer", "agent", "manager"] as const;

function InvitePanel({
  workspaceId,
  myRole,
}: {
  workspaceId: string | undefined;
  myRole: WorkspaceRole;
}) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof INVITABLE_ROLES)[number]>("agent");
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Grants stay strictly below the inviter's rank (`admin` is not invitable).
  const grantable = INVITABLE_ROLES.filter((r) => !hasWorkspaceRole(r, myRole));

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ["invitations", workspaceId],
    queryFn: () => api<Invitation[]>("/invitations", { workspaceId }),
    enabled: Boolean(workspaceId),
  });

  const create = useMutation({
    mutationFn: () =>
      api<{ id: string; token: string }>("/invitations", {
        method: "POST",
        workspaceId,
        body: { email, role },
      }),
    onSuccess: async (result) => {
      setEmail("");
      setError(null);
      setCopied(false);
      setInviteLink(`${window.location.origin}/invite/${result.token}`);
      await queryClient.invalidateQueries({
        queryKey: ["invitations", workspaceId],
      });
    },
    onError: (cause) =>
      setError(
        cause instanceof ApiError && cause.status === 409
          ? "Este email já é membro do workspace."
          : cause instanceof ApiError && cause.status === 403
            ? "Você não pode convidar para esse papel."
            : "Não foi possível criar o convite.",
      ),
  });

  const revoke = useMutation({
    mutationFn: (id: string) =>
      api<undefined>(`/invitations/${id}`, { method: "DELETE", workspaceId }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["invitations", workspaceId] }),
    onError: () => setError("Não foi possível revogar o convite."),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim() && grantable.includes(role)) create.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Convites</CardTitle>
        <CardDescription>
          Gere um link de convite e envie por qualquer canal. O link só é
          exibido uma vez e expira em 7 dias.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="pessoa@empresa.com"
              className="w-64"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-role">Papel</Label>
            <select
              id="invite-role"
              value={role}
              onChange={(event) => setRole(event.target.value as typeof role)}
              className="h-9 w-40 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              {grantable.map((r) => (
                <option key={r} value={r}>
                  {WORKSPACE_ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={!email.trim() || create.isPending}
          >
            Criar convite
          </Button>
        </form>
        {inviteLink ? (
          <div className="flex items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 p-3">
            <code className="min-w-0 flex-1 truncate text-xs text-slate-700">
              {inviteLink}
            </code>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(inviteLink);
                setCopied(true);
              }}
            >
              <CopyIcon data-icon="inline-start" />
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : invitations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum convite pendente.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {invitations.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-wrap items-center gap-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate">{invite.email}</span>
                <span className="text-muted-foreground">
                  {WORKSPACE_ROLE_LABELS[invite.role]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(invite.expiresAt) < new Date()
                    ? "expirado"
                    : `expira em ${new Date(invite.expiresAt).toLocaleDateString("pt-BR")}`}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Revogar convite de ${invite.email}`}
                  onClick={() => revoke.mutate(invite.id)}
                >
                  <TrashIcon data-icon="inline-start" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function SettingsMembersPage() {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const role = workspace?.role;
  const canManage = hasWorkspaceRole(role, "manager");

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: () => api<WorkspaceMember[]>("/members", { workspaceId }),
    enabled: Boolean(workspaceId),
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Equipe</CardTitle>
          <CardDescription>
            Pessoas com acesso a este workspace e seus papéis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <ul className="flex flex-col gap-2">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex flex-wrap items-center gap-2 text-sm"
                >
                  <span className="min-w-0 flex-1">
                    <span className="font-medium">{member.name}</span>{" "}
                    <span className="text-muted-foreground">
                      {member.email}
                    </span>
                  </span>
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                    {WORKSPACE_ROLE_LABELS[member.role]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      {canManage && role ? (
        <InvitePanel workspaceId={workspaceId} myRole={role} />
      ) : null}
    </div>
  );
}
