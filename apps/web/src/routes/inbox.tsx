import { useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiBlob, ApiError } from "@/lib/api";
import { formatTime } from "@/lib/format";
import type {
  Contact,
  Conversation,
  ConversationAssignment,
  Message,
  WorkspaceMember,
} from "@/lib/types";
import { hasWorkspaceRole, useWorkspace } from "@/lib/workspace";

type QueueFilter = "all" | "mine" | "unassigned";

const QUEUE_TABS: { key: QueueFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "mine", label: "Minhas" },
  { key: "unassigned", label: "Sem responsável" },
];

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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Renders an attachment bubble: bytes are fetched with the session token
 * (media routes are workspace-scoped) and shown via a temporary object URL. */
function MediaAttachment({
  message,
  workspaceId,
}: {
  message: Message;
  workspaceId: string;
}) {
  const { data: url } = useQuery({
    queryKey: ["media", workspaceId, message.id],
    queryFn: async () => {
      const blob = await apiBlob(`/messages/${message.id}/media`, {
        workspaceId,
      });
      return URL.createObjectURL(blob);
    },
    enabled: message.hasMedia,
    staleTime: Infinity,
  });
  if (!message.hasMedia) return null;
  const label = message.mediaFilename ?? "anexo";
  if (!url) {
    return <p className="text-xs opacity-80">Carregando anexo…</p>;
  }
  switch (message.contentType) {
    case "image":
      return (
        <a href={url} target="_blank" rel="noreferrer">
          <img
            src={url}
            alt={label}
            className="max-h-64 rounded-md object-contain"
          />
        </a>
      );
    case "video":
      return <video src={url} controls className="max-h-64 rounded-md" />;
    case "audio":
      return <audio src={url} controls className="w-64" />;
    default:
      return (
        <a
          href={url}
          download={label}
          className="flex items-center gap-2 rounded-md border border-current/30 px-3 py-2 text-xs underline"
        >
          {message.contentType === "contact" ? "Contato" : "Documento"}: {label}
        </a>
      );
  }
}

export function InboxPage() {
  const { workspace, session } = useWorkspace();
  const workspaceId = workspace?.workspaceId;
  const canEdit = hasWorkspaceRole(workspace?.role, "agent");
  const canDelegate = hasWorkspaceRole(workspace?.role, "manager");
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [queue, setQueue] = useState<QueueFilter>("all");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [contactPickerOpen, setContactPickerOpen] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const imageVideoInput = useRef<HTMLInputElement>(null);
  const documentInput = useRef<HTMLInputElement>(null);

  const { data: conversations = [], isLoading: loadingConversations } =
    useQuery({
      queryKey: ["conversations", workspaceId, queue],
      queryFn: () =>
        api<Conversation[]>(`/conversations?queue=${queue}`, { workspaceId }),
      enabled: Boolean(workspaceId),
    });

  const { data: members = [] } = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: () => api<WorkspaceMember[]>("/members", { workspaceId }),
    enabled: Boolean(workspaceId),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["assignments", workspaceId, selectedId],
    queryFn: () =>
      api<ConversationAssignment[]>(
        `/conversations/${selectedId}/assignments`,
        { workspaceId },
      ),
    enabled: Boolean(workspaceId && selectedId && historyOpen),
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", workspaceId, selectedId],
    queryFn: () =>
      api<Message[]>(`/conversations/${selectedId}/messages`, { workspaceId }),
    enabled: Boolean(workspaceId && selectedId),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts", workspaceId],
    queryFn: () => api<Contact[]>("/contacts", { workspaceId }),
    enabled: Boolean(workspaceId && contactPickerOpen),
  });

  const selected = conversations.find((c) => c.id === selectedId);
  const assignableMembers = members.filter((m) => m.role !== "viewer");

  const assignConversation = useMutation({
    mutationFn: (assigneeId: string | null) =>
      api<Conversation>(`/conversations/${selectedId}/assignment`, {
        method: "PATCH",
        workspaceId,
        body: { assigneeId },
      }),
    onSuccess: async () => {
      setAssignError(null);
      await queryClient.invalidateQueries({
        queryKey: ["conversations", workspaceId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["assignments", workspaceId, selectedId],
      });
    },
    onError: (error) =>
      setAssignError(
        error instanceof ApiError && error.status === 403
          ? "Você não tem permissão para essa atribuição."
          : error instanceof ApiError && error.status === 409
            ? "Esse membro não pode assumir conversas."
            : "Não foi possível atualizar o responsável.",
      ),
  });

  const sendMessage = useMutation({
    mutationFn: async (input: { body: string; file: File | null }) => {
      if (input.file) {
        return api<Message>(`/conversations/${selectedId}/messages`, {
          method: "POST",
          workspaceId,
          body: {
            ...(input.body ? { body: input.body } : {}),
            attachment: {
              data: await fileToBase64(input.file),
              mimetype: input.file.type || "application/octet-stream",
              filename: input.file.name,
            },
          },
        });
      }
      return api<Message>(`/conversations/${selectedId}/messages`, {
        method: "POST",
        workspaceId,
        body: { body: input.body },
      });
    },
    onSuccess: async () => {
      setDraft("");
      setAttachment(null);
      setSendError(null);
      await queryClient.invalidateQueries({
        queryKey: ["messages", workspaceId, selectedId],
      });
    },
    onError: () => setSendError("Não foi possível enviar a mensagem."),
  });

  const sendContact = useMutation({
    mutationFn: (contact: Contact) =>
      api<Message>(`/conversations/${selectedId}/messages`, {
        method: "POST",
        workspaceId,
        body: {
          contact: { fullName: contact.name, phoneNumber: contact.phone },
        },
      }),
    onSuccess: async () => {
      setContactPickerOpen(false);
      setSendError(null);
      await queryClient.invalidateQueries({
        queryKey: ["messages", workspaceId, selectedId],
      });
    },
    onError: () => setSendError("Não foi possível enviar o contato."),
  });

  const onSend = (event: FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!selectedId || (!body && !attachment)) return;
    sendMessage.mutate({ body, file: attachment });
  };

  const onAttach = (input: React.RefObject<HTMLInputElement | null>) => () => {
    setAttachMenuOpen(false);
    input.current?.click();
  };

  const onFilePicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setAttachment(file);
    event.target.value = "";
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
  const sendable = Boolean(draft.trim() || attachment);
  const phoneContacts = contacts.filter((contact) => contact.phone);

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
          <div className="mt-2 flex gap-1" role="tablist" aria-label="Fila">
            {QUEUE_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={queue === tab.key}
                onClick={() => setQueue(tab.key)}
                className={`rounded-md px-2 py-1 text-xs ${
                  queue === tab.key
                    ? "bg-indigo-100 font-medium text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
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
                onClick={() => {
                  setSelectedId(conversation.id);
                  setHistoryOpen(false);
                  setAssignError(null);
                }}
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
                <p className="text-xs text-slate-400">
                  {conversation.assignedUserName ?? "Sem responsável"}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col rounded-lg border border-slate-200 bg-white">
        {selected ? (
          <>
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="font-semibold text-slate-800">
                  {selected.contactName ?? selected.providerThreadId}
                </h2>
                <p className="text-xs text-slate-500">
                  {selected.providerThreadId}
                </p>
                <button
                  type="button"
                  onClick={() => setHistoryOpen((open) => !open)}
                  className="mt-1 text-xs text-slate-500 hover:underline"
                >
                  {historyOpen
                    ? "Ocultar histórico"
                    : "Histórico de atribuição"}
                </button>
              </div>
              <div className="flex flex-col items-end gap-1">
                {canDelegate ? (
                  <select
                    aria-label="Responsável"
                    value={selected.assignedUserId ?? ""}
                    disabled={assignConversation.isPending}
                    onChange={(event) =>
                      assignConversation.mutate(event.target.value || null)
                    }
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700"
                  >
                    <option value="">Sem responsável</option>
                    {assignableMembers.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                ) : canEdit && !selected.assignedUserId ? (
                  <button
                    type="button"
                    disabled={assignConversation.isPending}
                    onClick={() =>
                      session && assignConversation.mutate(session.userId)
                    }
                    className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                  >
                    Assumir
                  </button>
                ) : canEdit && selected.assignedUserId === session?.userId ? (
                  <button
                    type="button"
                    disabled={assignConversation.isPending}
                    onClick={() => assignConversation.mutate(null)}
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Liberar
                  </button>
                ) : (
                  <p className="text-xs text-slate-500">
                    Responsável:{" "}
                    {selected.assignedUserName ?? "Sem responsável"}
                  </p>
                )}
                {assignError ? (
                  <p className="text-xs text-red-600">{assignError}</p>
                ) : null}
              </div>
            </div>
            {historyOpen ? (
              <div className="border-b border-slate-200 px-4 py-2 text-xs text-slate-600">
                {assignments.length === 0 ? (
                  <p>Nenhuma atribuição registrada.</p>
                ) : (
                  assignments.map((entry) => (
                    <p key={entry.id}>
                      {entry.assignedUserName
                        ? `Atribuída a ${entry.assignedUserName}`
                        : "Ficou sem responsável"}
                      {entry.assignedByName
                        ? ` por ${entry.assignedByName}`
                        : ""}{" "}
                      · {formatTime(entry.createdAt)}
                    </p>
                  ))
                )}
              </div>
            ) : null}
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
                      <MediaAttachment
                        message={message}
                        workspaceId={workspaceId}
                      />
                      {message.body ? <p>{message.body}</p> : null}
                      {!message.body && !message.hasMedia ? (
                        <p>(mídia)</p>
                      ) : null}
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
                      {canEdit &&
                      message.direction === "outbound" &&
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
                      {canEdit &&
                      message.direction === "outbound" &&
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
            {canEdit && attachment ? (
              <div className="flex items-center gap-2 border-t border-slate-200 px-3 py-2 text-xs text-slate-600">
                <span className="truncate">
                  Anexo: {attachment.name} ({Math.ceil(attachment.size / 1024)}{" "}
                  KB)
                </span>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="font-medium text-red-600 hover:underline"
                >
                  Remover
                </button>
              </div>
            ) : null}
            {canEdit ? (
              <form
                onSubmit={onSend}
                className="flex items-center gap-2 border-t border-slate-200 p-3"
              >
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Anexar"
                    onClick={() => {
                      setContactPickerOpen(false);
                      setAttachMenuOpen((open) => !open);
                    }}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    +
                  </button>
                  {attachMenuOpen ? (
                    <div className="absolute bottom-11 left-0 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                      <button
                        type="button"
                        onClick={onAttach(imageVideoInput)}
                        className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Fotos e vídeos
                      </button>
                      <button
                        type="button"
                        onClick={onAttach(documentInput)}
                        className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Documento
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachMenuOpen(false);
                          setContactPickerOpen(true);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Contato
                      </button>
                    </div>
                  ) : null}
                </div>
                <input
                  ref={imageVideoInput}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={onFilePicked}
                />
                <input
                  ref={documentInput}
                  type="file"
                  className="hidden"
                  onChange={onFilePicked}
                />
                <input
                  type="text"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={
                    attachment ? "Legenda (opcional)…" : "Escreva uma mensagem…"
                  }
                  aria-label="Mensagem"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={sendMessage.isPending || !sendable}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Enviar
                </button>
              </form>
            ) : null}
            {canEdit && contactPickerOpen ? (
              <div className="max-h-48 overflow-y-auto border-t border-slate-200">
                <div className="flex items-center justify-between px-4 py-2">
                  <p className="text-xs font-medium text-slate-600">
                    Enviar contato
                  </p>
                  <button
                    type="button"
                    onClick={() => setContactPickerOpen(false)}
                    className="text-xs text-slate-500 hover:underline"
                  >
                    Fechar
                  </button>
                </div>
                {phoneContacts.length === 0 ? (
                  <p className="px-4 pb-3 text-xs text-slate-500">
                    Nenhum contato com telefone.
                  </p>
                ) : (
                  phoneContacts.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      disabled={sendContact.isPending}
                      onClick={() => sendContact.mutate(contact)}
                      className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {contact.name}{" "}
                      <span className="text-xs text-slate-500">
                        {contact.phone}
                      </span>
                    </button>
                  ))
                )}
              </div>
            ) : null}
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
