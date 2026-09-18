import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatTime } from "@/lib/format";
import type { ChannelInstance } from "@/lib/types";
import { hasWorkspaceRole, useWorkspace } from "@/lib/workspace";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function generateSecret() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function SettingsChannelsPage() {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const canManage = hasWorkspaceRole(workspace?.role, "manager");
  const queryClient = useQueryClient();
  const [providerInstanceId, setProviderInstanceId] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: instances = [], isLoading } = useQuery({
    queryKey: ["channel-instances", workspaceId],
    queryFn: () =>
      api<ChannelInstance[]>("/channel-instances", { workspaceId }),
    enabled: Boolean(workspaceId),
  });

  const createInstance = useMutation({
    mutationFn: (input: {
      provider: string;
      providerInstanceId: string | null;
      webhookSecret: string;
    }) =>
      api<ChannelInstance>("/channel-instances", {
        method: "POST",
        workspaceId,
        body: input,
      }),
    onSuccess: async () => {
      setError(null);
      setProviderInstanceId("");
      setWebhookSecret("");
      await queryClient.invalidateQueries({
        queryKey: ["channel-instances", workspaceId],
      });
    },
    onError: () => setError("Não foi possível registrar o canal."),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    createInstance.mutate({
      provider: "waha",
      providerInstanceId: providerInstanceId.trim() || null,
      webhookSecret: webhookSecret.trim(),
    });
  };

  if (!workspaceId) return <p>Selecione um workspace.</p>;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Canais</CardTitle>
          <CardDescription>
            Sessões de provedor conectadas a este workspace. O WhatsApp usa o
            adaptador WAHA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : instances.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum canal registrado.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {instances.map((instance) => (
                <li
                  key={instance.id}
                  className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm"
                >
                  <span className="font-medium uppercase">
                    {instance.provider}
                  </span>
                  <span className="truncate text-muted-foreground">
                    {instance.providerInstanceId ?? "sessão padrão"}
                  </span>
                  <span
                    className={
                      instance.isActive
                        ? "ml-auto text-xs text-emerald-600"
                        : "ml-auto text-xs text-muted-foreground"
                    }
                  >
                    {instance.isActive ? "Ativo" : "Inativo"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(instance.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle>Novo canal</CardTitle>
            <CardDescription>
              Registre uma sessão WAHA. O segredo valida a assinatura dos
              webhooks recebidos — guarde-o com cuidado.
            </CardDescription>
          </CardHeader>
          <form onSubmit={submit}>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="channel-provider">Provedor</Label>
                <Input id="channel-provider" value="WAHA" disabled />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="channel-instance">Sessão do provedor</Label>
                <Input
                  id="channel-instance"
                  placeholder="default"
                  value={providerInstanceId}
                  onChange={(event) =>
                    setProviderInstanceId(event.target.value)
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="channel-secret">Segredo do webhook</Label>
                <div className="flex gap-2">
                  <Input
                    id="channel-secret"
                    value={webhookSecret}
                    onChange={(event) => setWebhookSecret(event.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setWebhookSecret(generateSecret())}
                  >
                    Gerar
                  </Button>
                </div>
              </div>
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                disabled={createInstance.isPending || !webhookSecret.trim()}
              >
                {createInstance.isPending ? "Registrando…" : "Registrar canal"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
