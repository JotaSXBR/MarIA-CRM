CREATE TABLE "channel_instances" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "provider_instance_id" text,
  "webhook_secret" text NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

--> statement-breakpoint
CREATE INDEX "channel_instances_workspace_id_idx" ON "channel_instances" ("workspace_id");

--> statement-breakpoint
CREATE UNIQUE INDEX "channel_instances_provider_key_idx"
  ON "channel_instances" ("workspace_id", "provider", "provider_instance_id");

--> statement-breakpoint
CREATE TABLE "conversations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "channel_instance_id" uuid NOT NULL REFERENCES "channel_instances"("id") ON DELETE CASCADE,
  "contact_id" uuid REFERENCES "contacts"("id"),
  "provider_thread_id" text NOT NULL,
  "epoch" integer NOT NULL DEFAULT 1,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

--> statement-breakpoint
CREATE INDEX "conversations_workspace_id_idx" ON "conversations" ("workspace_id");

--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_thread_key_idx"
  ON "conversations" ("channel_instance_id", "provider_thread_id");

--> statement-breakpoint
CREATE TABLE "messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "conversation_id" uuid NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "provider_message_id" text,
  "direction" text NOT NULL,
  "status" text NOT NULL DEFAULT 'received',
  "content_type" text NOT NULL DEFAULT 'text',
  "body" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

--> statement-breakpoint
CREATE INDEX "messages_conversation_id_idx" ON "messages" ("conversation_id");

--> statement-breakpoint
CREATE UNIQUE INDEX "messages_provider_id_idx"
  ON "messages" ("conversation_id", "provider_message_id");

--> statement-breakpoint
CREATE TABLE "webhook_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "channel_instance_id" uuid NOT NULL REFERENCES "channel_instances"("id") ON DELETE CASCADE,
  "provider_event_id" text NOT NULL,
  "provider_event_kind" text NOT NULL,
  "payload" jsonb NOT NULL,
  "signature_verified" boolean NOT NULL,
  "processed_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("channel_instance_id", "provider_event_id", "provider_event_kind")
);

--> statement-breakpoint
CREATE INDEX "webhook_events_channel_id_idx" ON "webhook_events" ("channel_instance_id");

--> statement-breakpoint
ALTER TABLE "channel_instances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "channel_instances" FORCE ROW LEVEL SECURITY;
CREATE POLICY "channel_instances_workspace_scope" ON "channel_instances"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);

--> statement-breakpoint
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations" FORCE ROW LEVEL SECURITY;
CREATE POLICY "conversations_workspace_scope" ON "conversations"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);

--> statement-breakpoint
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" FORCE ROW LEVEL SECURITY;
CREATE POLICY "messages_workspace_scope" ON "messages"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);

--> statement-breakpoint
ALTER TABLE "webhook_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "webhook_events" FORCE ROW LEVEL SECURITY;
CREATE POLICY "webhook_events_workspace_scope" ON "webhook_events"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);

--> statement-breakpoint
REVOKE ALL ON channel_instances, conversations, messages, webhook_events FROM maria_runtime;
GRANT SELECT, INSERT, UPDATE ON channel_instances, conversations, messages, webhook_events TO maria_runtime;
