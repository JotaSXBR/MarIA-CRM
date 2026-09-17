import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api.ts";
import { useWorkspace } from "../lib/workspace.tsx";

type Conversation = {
  id: string;
  workspaceId: string;
  channelInstanceId: string;
  contactId: string | null;
  contactName: string | null;
  providerThreadId: string;
  epoch: number;
  createdAt: string;
  updatedAt: string;
};

type Message = {
  id: string;
  workspaceId: string;
  conversationId: string;
  providerMessageId: string | null;
  direction: string;
  status: string;
  contentType: string;
  body: string | null;
  createdAt: string;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

const STATUS_LABELS: Record<string, string> = {
  pending: "enviando",
  dispatching: "enviando",
  sent: "enviada",
  delivered: "entregue",
  read: "lida",
  failed: "falhou",
  unknown: "não confirmada",
  cancelled: "cancelada",
};

export function InboxPage() {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);

  const { data: conversations = [], isLoading: loadingConversations } =
    useQuery({
      queryKey: ["conversations", workspaceId],
      queryFn: () => api<Conversation[]>("/conversations", { workspaceId }),
      enabled: Boolean(workspaceId),
    });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", workspaceId, selectedId],
    queryFn: () =>
      api<Message[]>(`/conversations/${selectedId}/messages`, { workspaceId }),
    enabled: Boolean(workspaceId && selectedId),
  });

  const selected = conversations.find((c) => c.id === selectedId);

  const sendMessage = useMutation({
    mutationFn: (body: string) =>
      api<Message>(`/conversations/${selectedId}/messages`, {
        method: "POST",
        workspaceId,
        body: { body },
      }),
    onSuccess: async () => {
      setDraft("");
      setSendError(null);
      await queryClient.invalidateQueries({
        queryKey: ["messages", workspaceId, selectedId],
      });
    },
    onError: () => setSendError("Não foi possível enviar a mensagem."),
  });

  const onSend = (event: FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !selectedId) return;
    sendMessage.mutate(body);
  };

  const invalidateMessages = () =>
    queryClient.invalidateQueries({
      queryKey: ["messages", workspaceId, selectedId],
    });

  // ADR 0010: retrying creates a NEW message+intent; the failed bubble stays
  // as history. `unknown` is never resent blindly — it must be resolved first
  // ("not_sent" cancels it, then retry is allowed; "sent" confirms arrival).
  const retryMessage = useMutation({
    mutationFn: (messageId: string) =>
      api<Message>(`/messages/${messageId}/retry`, {
        method: "POST",
        workspaceId,
      }),
    onSuccess: invalidateMessages,
    onError: () => setSendError("Não foi possível reenviar a mensagem."),
  });

  const resolveUnknown = useMutation({
    mutationFn: async (input: {
      messageId: string;
      resolution: "sent" | "not_sent";
    }) => {
      await api<Message>(`/messages/${input.messageId}/resolve`, {
        method: "POST",
        workspaceId,
        body: { resolution: input.resolution },
      });
      if (input.resolution === "not_sent") {
        await api<Message>(`/messages/${input.messageId}/retry`, {
          method: "POST",
          workspaceId,
        });
      }
    },
    onSuccess: invalidateMessages,
    onError: () => setSendError("Não foi possível resolver a mensagem."),
  });

  const actionPending = retryMessage.isPending || resolveUnknown.isPending;

  if (!workspaceId) return <p>Selecione um workspace.</p>;

  return (
    <section
      aria-labelledby="inbox-title"
      className="mx-auto flex h-[calc(100vh-6rem)] max-w-6xl gap-4"
    >
      <h1 id="inbox-title" className="sr-only">
        Caixa de entrada
      </h1>
      <div className="flex w-80 flex-col rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="font-semibold text-slate-800">Conversas</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loadingConversations ? (
            <p className="p-2 text-sm text-slate-500">Carregando...</p>
          ) : conversations.length === 0 ? (
            <p className="p-2 text-sm text-slate-500">Nenhuma conversa.</p>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setSelectedId(conversation.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                  selectedId === conversation.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700"
                }`}
              >
                <p className="font-medium">
                  {conversation.contactName ?? conversation.providerThreadId}
                </p>
                <p className="text-xs text-slate-500">
                  {formatTime(conversation.updatedAt)}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col rounded-lg border border-slate-200 bg-white">
        {selected ? (
          <>
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="font-semibold text-slate-800">
                {selected.contactName ?? selected.providerThreadId}
              </h2>
              <p className="text-xs text-slate-500">
                {selected.providerThreadId}
              </p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {loadingMessages ? (
                <p className="text-sm text-slate-500">
                  Carregando mensagens...
                </p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-slate-500">Sem mensagens.</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.direction === "inbound"
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-md rounded-lg px-3 py-2 text-sm ${
                        message.direction === "inbound"
                          ? "bg-slate-100 text-slate-800"
                          : "bg-indigo-600 text-white"
                      }`}
                    >
                      <p>{message.body ?? "(mídia)"}</p>
                      <p
                        className={`mt-1 text-right text-xs ${
                          message.direction === "inbound"
                            ? "text-slate-500"
                            : "text-indigo-100"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                        {message.direction === "outbound"
                          ? ` · ${STATUS_LABELS[message.status] ?? message.status}`
                          : ""}
                      </p>
                      {message.direction === "outbound" &&
                      ["failed", "cancelled"].includes(message.status) ? (
                        <button
                          type="button"
                          disabled={actionPending}
                          onClick={() => retryMessage.mutate(message.id)}
                          className="mt-1 text-xs font-medium text-indigo-100 underline hover:text-white disabled:opacity-50"
                        >
                          Reenviar
                        </button>
                      ) : null}
                      {message.direction === "outbound" &&
                      message.status === "unknown" ? (
                        <div className="mt-1 flex items-center justify-end gap-2 text-xs">
                          <button
                            type="button"
                            disabled={actionPending}
                            onClick={() =>
                              resolveUnknown.mutate({
                                messageId: message.id,
                                resolution: "sent",
                              })
                            }
                            className="text-indigo-100 underline hover:text-white disabled:opacity-50"
                          >
                            Foi entregue
                          </button>
                          <button
                            type="button"
                            disabled={actionPending}
                            onClick={() =>
                              resolveUnknown.mutate({
                                messageId: message.id,
                                resolution: "not_sent",
                              })
                            }
                            className="font-medium text-indigo-100 underline hover:text-white disabled:opacity-50"
                          >
                            Reenviar
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
            <form
              onSubmit={onSend}
              className="flex items-center gap-2 border-t border-slate-200 p-3"
            >
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Escreva uma mensagem…"
                aria-label="Mensagem"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={sendMessage.isPending || !draft.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Enviar
              </button>
            </form>
            {sendError ? (
              <p className="px-3 pb-3 text-xs text-red-600">{sendError}</p>
            ) : null}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
            Selecione uma conversa para visualizar as mensagens.
          </div>
        )}
      </div>
    </section>
  );
}
