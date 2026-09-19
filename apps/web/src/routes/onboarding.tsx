import { useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate } from "@tanstack/react-router";
import { CheckIcon, CopyIcon } from "lucide-react";
import { api, ApiError, getToken } from "@/lib/api";
import {
  hasWorkspaceRole,
  WORKSPACE_KEY,
  WORKSPACE_ROLE_LABELS,
  type WorkspaceMembership,
} from "@/lib/workspace";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INVITABLE_ROLES = ["viewer", "agent", "manager"] as const;

type OnboardingStepId = "basics" | "channel" | "team" | "review";
type StepStatus = "pending" | "done" | "skipped";

type OnboardingState = {
  workspaceName: string;
  onboardedAt: string | null;
  steps: {
    id: OnboardingStepId;
    status: StepStatus;
    data?: Record<string, unknown>;
  }[];
};

const STEP_TITLES: Record<OnboardingStepId, string> = {
  basics: "Sobre o workspace",
  channel: "Conectar o WhatsApp",
  team: "Convidar a equipe",
  review: "Revisar e concluir",
};

function StepCard({
  index,
  step,
  children,
}: {
  index: number;
  step: { id: OnboardingStepId; status: StepStatus };
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {step.status === "done" ? (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckIcon className="size-3.5" aria-hidden />
            </span>
          ) : (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs font-medium text-slate-600">
              {index + 1}
            </span>
          )}
          <CardTitle className="text-base">{STEP_TITLES[step.id]}</CardTitle>
          {step.status === "skipped" ? (
            <span className="ml-auto text-xs text-slate-500">Pulado</span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [niche, setNiche] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] =
    useState<(typeof INVITABLE_ROLES)[number]>("agent");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const memberships = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => api<WorkspaceMembership[]>("/me/workspaces"),
    enabled: Boolean(getToken()),
  });
  const workspace =
    memberships.data?.find(
      (m) => m.workspaceId === localStorage.getItem(WORKSPACE_KEY),
    ) ?? memberships.data?.[0];
  const workspaceId = workspace?.workspaceId;
  const canConfigure = hasWorkspaceRole(workspace?.role, "manager");

  const onboarding = useQuery({
    queryKey: ["onboarding", workspaceId],
    queryFn: () => api<OnboardingState>("/onboarding", { workspaceId }),
    enabled: Boolean(workspaceId),
  });

  const saveStep = useMutation({
    mutationFn: (input: {
      step: OnboardingStepId;
      status: "done" | "skipped";
      data?: Record<string, unknown>;
    }) =>
      api<OnboardingState>(`/onboarding/steps/${input.step}`, {
        method: "PATCH",
        workspaceId,
        body: { status: input.status, data: input.data },
      }),
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({
        queryKey: ["onboarding", workspaceId],
      });
    },
    onError: () => setError("Não foi possível salvar a etapa."),
  });

  const createInvite = useMutation({
    mutationFn: () =>
      api<{ id: string; token: string }>("/invitations", {
        method: "POST",
        workspaceId,
        body: { email: inviteEmail, role: inviteRole },
      }),
    onSuccess: async (result) => {
      setInviteLink(`${window.location.origin}/invite/${result.token}`);
      setInviteEmail("");
      await saveStep.mutateAsync({ step: "team", status: "done" });
    },
    onError: () => setError("Não foi possível criar o convite."),
  });

  const complete = useMutation({
    mutationFn: () =>
      api<{ onboardedAt: string }>("/onboarding/complete", {
        method: "POST",
        workspaceId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      await navigate({ to: "/inbox" });
    },
    onError: (cause) =>
      setError(
        cause instanceof ApiError && cause.status === 409
          ? "Ainda há etapas pendentes — conclua ou pule cada uma."
          : "Não foi possível concluir a configuração.",
      ),
  });

  if (!getToken()) return <Navigate to="/login" replace />;

  if (memberships.isPending || (workspaceId && onboarding.isPending)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Carregando configuração…</p>
      </main>
    );
  }

  if (!workspace || onboarding.isError || !onboarding.data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <p role="alert" className="text-sm text-red-600">
          Não foi possível carregar a configuração do workspace.
        </p>
      </main>
    );
  }

  if (onboarding.data.onboardedAt) return <Navigate to="/inbox" replace />;

  const steps = onboarding.data.steps;
  // `review` stays pending until the wizard completes — it never blocks.
  const pending = steps.filter(
    (s) => s.id !== "review" && s.status === "pending",
  );
  const step = (id: OnboardingStepId) => steps.find((s) => s.id === id)!;
  const grantable = INVITABLE_ROLES.filter(
    (r) => !hasWorkspaceRole(r, workspace.role),
  );
  const savedNicheValue = step("basics").data?.niche;
  const savedNiche =
    typeof savedNicheValue === "string" && savedNicheValue
      ? savedNicheValue
      : undefined;

  const submitBasics = (event: FormEvent) => {
    event.preventDefault();
    if (!niche.trim()) return;
    saveStep.mutate({
      step: "basics",
      status: "done",
      data: { niche: niche.trim() },
    });
  };

  const submitInvite = (event: FormEvent) => {
    event.preventDefault();
    if (!inviteEmail.trim()) return;
    createInvite.mutate();
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-xl space-y-6">
        <header className="space-y-1">
          <p className="text-sm font-medium text-slate-500">MarIA CRM</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Configure {onboarding.data.workspaceName}
          </h1>
          <p className="text-sm text-slate-600">
            Quatro etapas e o workspace está pronto para operar.
          </p>
        </header>

        {!canConfigure ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Um administrador ou manager precisa concluir a configuração deste
            workspace. Acompanhe o progresso abaixo.
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <div className="space-y-4">
          <StepCard index={0} step={step("basics")}>
            {canConfigure && step("basics").status === "pending" ? (
              <form onSubmit={submitBasics} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="onboarding-niche">Nicho de atuação</Label>
                  <Input
                    id="onboarding-niche"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Ex.: clínica odontológica, imobiliária"
                    required
                  />
                </div>
                <Button type="submit" disabled={saveStep.isPending}>
                  Salvar e continuar
                </Button>
              </form>
            ) : (
              <p className="text-sm text-slate-600">
                {savedNiche
                  ? `Nicho: ${savedNiche}`
                  : "Nome e nicho do workspace."}
              </p>
            )}
          </StepCard>

          <StepCard index={1} step={step("channel")}>
            {canConfigure && step("channel").status === "pending" ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Conecte uma sessão do WhatsApp para receber conversas neste
                  workspace. Você também pode fazer isso depois.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate({ to: "/settings/channels" })}
                  >
                    Abrir canais
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={saveStep.isPending}
                    onClick={() =>
                      saveStep.mutate({ step: "channel", status: "skipped" })
                    }
                  >
                    Pular por agora
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                {step("channel").status === "done"
                  ? "Canal conectado."
                  : "Conexão de canal adiada."}
              </p>
            )}
          </StepCard>

          <StepCard index={2} step={step("team")}>
            {canConfigure && step("team").status === "pending" ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Gere um link de convite e envie por qualquer canal.
                </p>
                <form onSubmit={submitInvite} className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1.5">
                      <Label htmlFor="onboarding-invite-email">Email</Label>
                      <Input
                        id="onboarding-invite-email"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="onboarding-invite-role">Papel</Label>
                      <select
                        id="onboarding-invite-role"
                        className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm"
                        value={inviteRole}
                        onChange={(e) =>
                          setInviteRole(
                            e.target.value as (typeof INVITABLE_ROLES)[number],
                          )
                        }
                      >
                        {grantable.map((r) => (
                          <option key={r} value={r}>
                            {WORKSPACE_ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createInvite.isPending}>
                      Gerar convite
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={saveStep.isPending}
                      onClick={() =>
                        saveStep.mutate({ step: "team", status: "skipped" })
                      }
                    >
                      Pular por agora
                    </Button>
                  </div>
                </form>
                {inviteLink ? (
                  <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
                    <span className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700">
                      {inviteLink}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label="Copiar link de convite"
                      onClick={async () => {
                        await navigator.clipboard.writeText(inviteLink);
                        setCopied(true);
                      }}
                    >
                      <CopyIcon className="size-4" />
                      {copied ? "Copiado" : "Copiar"}
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                {step("team").status === "done"
                  ? "Equipe convidada."
                  : "Convites adiados."}
              </p>
            )}
          </StepCard>

          <StepCard index={3} step={step("review")}>
            <div className="space-y-3">
              <ul className="space-y-1 text-sm text-slate-600">
                <li>Workspace: {onboarding.data.workspaceName}</li>
                <li>Nicho: {savedNiche ?? "não informado"}</li>
                <li>
                  WhatsApp:{" "}
                  {step("channel").status === "done"
                    ? "conectado"
                    : "não conectado"}
                </li>
                <li>
                  Equipe:{" "}
                  {step("team").status === "done"
                    ? "convite enviado"
                    : "sem convites"}
                </li>
              </ul>
              {canConfigure ? (
                <Button
                  onClick={() => complete.mutate()}
                  disabled={complete.isPending || pending.length > 0}
                >
                  Concluir e entrar
                </Button>
              ) : null}
              {canConfigure && pending.length > 0 ? (
                <p className="text-xs text-slate-500">
                  Conclua ou pule cada etapa para finalizar.
                </p>
              ) : null}
            </div>
          </StepCard>
        </div>
      </div>
    </main>
  );
}
