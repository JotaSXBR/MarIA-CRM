import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { useWorkspace } from "@/lib/workspace";
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

export function SettingsProfilePage() {
  const { session } = useWorkspace();
  const queryClient = useQueryClient();
  const [name, setName] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordOk, setPasswordOk] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const saveName = useMutation({
    mutationFn: (value: string) =>
      api("/me", { method: "PATCH", body: { name: value } }),
    onSuccess: async () => {
      setProfileError(null);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => setProfileError("Não foi possível salvar o nome."),
  });

  const savePassword = useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      api("/me", { method: "PATCH", body: input }),
    onSuccess: () => {
      setPasswordError(null);
      setPasswordOk(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      setPasswordOk(false);
      setPasswordError(
        error instanceof ApiError && error.status === 403
          ? "Senha atual incorreta."
          : "Não foi possível alterar a senha.",
      );
    },
  });

  const submitName = (event: FormEvent) => {
    event.preventDefault();
    const value = (name ?? session?.name ?? "").trim();
    if (!value) return;
    saveName.mutate(value);
  };

  const submitPassword = (event: FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      setPasswordError("A nova senha precisa de pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("A confirmação não confere com a nova senha.");
      return;
    }
    savePassword.mutate({ currentPassword, newPassword });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>
            Seu nome aparece para os demais membros do workspace.
          </CardDescription>
        </CardHeader>
        <form onSubmit={submitName}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-name">Nome</Label>
              <Input
                id="profile-name"
                value={name ?? session?.name ?? ""}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" value={session?.email ?? ""} disabled />
            </div>
            {profileError ? (
              <p className="text-sm text-destructive">{profileError}</p>
            ) : null}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={saveName.isPending}>
              {saveName.isPending ? "Salvando…" : "Salvar"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Senha</CardTitle>
          <CardDescription>
            Ao trocar a senha, suas outras sessões são encerradas.
          </CardDescription>
        </CardHeader>
        <form onSubmit={submitPassword}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="current-password">Senha atual</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
            {passwordError ? (
              <p className="text-sm text-destructive">{passwordError}</p>
            ) : null}
            {passwordOk ? (
              <p className="text-sm text-muted-foreground">Senha atualizada.</p>
            ) : null}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={savePassword.isPending}>
              {savePassword.isPending ? "Alterando…" : "Alterar senha"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
