# Messaging & Realtime

## Internal provider contract

All channel providers implement a normalized `MessagingProvider` boundary. Domain code does not
switch on WAHA/Meta payload shapes.

Typical capabilities:
- connect/provision channel;
- send text/media/template;
- normalize inbound message;
- normalize delivery/read/failure status;
- resolve provider identity;
- reconcile message status where supported;
- verify webhook authenticity.

Store:
- internal message ID;
- provider/channel ID;
- provider external message ID;
- dedup key;
- timestamps from provider + receipt;
- normalized status;
- raw payload only when necessary, encrypted/retention-controlled.

## WAHA

WAHA remains the first WhatsApp adapter because it is stable for the current MVP and deploys easily
with Docker/Coolify.

Requirements:
- pin a versioned image, never `latest` in production;
- use API key/auth;
- verify webhook HMAC on the raw request body;
- subscribe only to required events;
- enable bounded webhook retries;
- expose WAHA only on the internal network where possible;
- isolate session credentials/storage and back them up appropriately.

## Meta WhatsApp Cloud API

The official adapter exists from day one even if not enabled for every tenant.

Requirements:
- webhook verification endpoint;
- verify `x-hub-signature-256` using Meta app secret;
- subscribe WABA;
- support status webhooks and templates;
- model onboarding separately (Embedded Signup can be added when product onboarding requires it);
- keep WABA/phone-number identifiers provider-scoped.

## Realtime browser strategy

Default:
- HTTP/REST for client mutations;
- SSE for server→client inbox, message, deal and run-state updates;
- cursor/sequence IDs for reconnect and gap recovery.

Why:
- one-way server event delivery matches most CRM UI traffic;
- simpler proxy/reconnect semantics than a universal WebSocket bus;
- standard HTTP authorization/observability.

Use WebSocket only for a concrete full-duplex need such as high-frequency typing/presence. It must
still reconcile from durable state after reconnect.

## Webchat

The native webchat can use:
- POST for outbound visitor message;
- SSE for incoming/status updates;
- short-lived scoped visitor/channel token;
- idempotency key per send;
- server-assigned monotonic event cursor.

Never trust client clocks or client-provided workspace IDs.

## Delivery reliability

Provider webhook is primary status path. For statuses that remain transitional beyond a defined
window, a reconciliation job may query the provider if its API supports it.

All inbound webhooks:
1. authenticate signature/HMAC first;
2. parse/validate provider schema;
3. deduplicate;
4. normalize;
5. persist message/event + outbox transactionally;
6. return promptly;
7. process business/AI effects asynchronously.
