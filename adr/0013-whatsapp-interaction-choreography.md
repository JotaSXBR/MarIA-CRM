# 0013 — WhatsApp interaction choreography and LID identity

**Status:** accepted (2026-09-17) · primitives implemented; orchestration activates with the dispatcher

## Context

Production WhatsApp automation must mimic WhatsApp Web behavior or risk account
restriction. A reference n8n workflow demonstrates the accepted choreography
per outbound reply: session `online` → mark chat seen → `typing` for a duration
proportional to the text → `paused` → send → settle → session `offline`.
WAHA exposes all primitives on every engine including GOWS:
`POST /api/{session}/presence` (`online`/`offline` global; `typing`/`recording`/
`paused` chat-scoped), `POST /api/sendSeen`, `POST /api/startTyping`,
`POST /api/stopTyping`.

WhatsApp also privacy-masks senders as `@lid` threads whose digits are not a
phone number. The real number is resolvable via `GET /api/{session}/lids/{lid}`
(and may appear in alternate-identity payload fields under some engines).

## Decision

Extend `MessagingProvider` (ADR 0008/0010) with optional best-effort
primitives: `setPresence`, `sendSeen`, `resolveLid`, and capability flags
(`presenceSignals`, `readReceipts`, `lidResolution`). They carry no durable
state: a lost presence/seen call never fails or blocks the send itself.

The dispatcher — not the synchronous API request path — orchestrates timing,
because delays of 1–8 s must survive restarts and never hold an HTTP request:

1. `setPresence(online)` once per session burst.
2. `sendSeen(chatId, messageIds?)` for the inbound message(s) being answered.
3. `setPresence(chatId, typing)`; for future voice replies use `recording`.
4. Wait `clamp(text.length * 0.07, 1.5, 8) * U(0.9, 1.1)` seconds.
5. `setPresence(chatId, paused)`, short settle wait (~0.2–0.6 s), then `send`.
6. Between message parts wait ~0.4–1.2 s; when the burst ends,
   `setPresence(offline)` so the handset keeps receiving push notifications.

Step 4's duration policy is the default; agents/operators may shorten it, and
`WAHA_PRESENCE_AUTO_ONLINE=false` in compose keeps WAHA from fighting the
sequence. Human quick-replies may use the minimal subset (seen → typing →
paused → send) with a shorter cap. Audio replies substitute `recording` for
`typing`; media sends (`sendImage`/`sendVideo`/`sendVoice`/`sendFile`) replace
the text call and are added when the dispatch ledger carries media intents.

Inbound normalization drops `status@broadcast` pseudo-chats and never filters
on message text — anything arriving on our number is user data and reaches the
inbox verbatim (attribution prefixes like `_#Name:_` included). `@lid` senders
keep `sender.lid` with no
synthetic phone; the webhook route resolves the real number through
`resolveLid`, with alternate-identity payload fields as a free first look.
Replies continue to target the `@lid` thread id.

## Consequences

Presence/seen failures are swallowed by the adapter and never change ADR 0010
send classification. `resolveLid` failure leaves the conversation without a
contact phone — reconcilable on the next inbound message. Contact records
created from a LID before resolution may later merge once the number is known;
that merge flow is future work. Meta Cloud API capabilities differ (typing
indicators exist; LID resolution does not) and are mapped when that adapter
lands. Engine pinning moves to the GOWS image tag (`devlikeapro/waha:gows-*`),
which `WHATSAPP_DEFAULT_ENGINE=GOWS` requires.

Rejected alternatives: synchronous waits inside `POST /conversations/:id/messages`
(holds HTTP, lost on restart, unobservable); storing LID digits as contact phone
(corrupts identity and breaks contact matching); content-based inbound filtering
such as dropping bot-style attribution prefixes (message text is user data —
filtering by body shape would silently drop legitimate conversations).
