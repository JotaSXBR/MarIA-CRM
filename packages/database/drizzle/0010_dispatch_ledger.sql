CREATE TABLE "dispatch_intents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "conversation_id" uuid NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "channel_instance_id" uuid NOT NULL REFERENCES "channel_instances"("id") ON DELETE CASCADE,
  "message_id" uuid NOT NULL REFERENCES "messages"("id") ON DELETE CASCADE,
  "epoch" integer NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

--> statement-breakpoint
CREATE UNIQUE INDEX "dispatch_intents_effect_key_idx"
  ON "dispatch_intents" ("channel_instance_id", "message_id");

--> statement-breakpoint
CREATE INDEX "dispatch_intents_workspace_status_idx"
  ON "dispatch_intents" ("workspace_id", "status");

--> statement-breakpoint
CREATE TABLE "dispatch_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "intent_id" uuid NOT NULL REFERENCES "dispatch_intents"("id") ON DELETE CASCADE,
  "fencing_token" uuid NOT NULL DEFAULT gen_random_uuid(),
  "lease_expires_at" timestamptz NOT NULL,
  "status" text NOT NULL DEFAULT 'dispatching',
  "error" text,
  "started_at" timestamptz NOT NULL DEFAULT now(),
  "completed_at" timestamptz
);

--> statement-breakpoint
CREATE UNIQUE INDEX "dispatch_attempts_intent_active_idx"
  ON "dispatch_attempts" ("intent_id")
  WHERE "completed_at" IS NULL;

--> statement-breakpoint
CREATE INDEX "dispatch_attempts_lease_idx"
  ON "dispatch_attempts" ("lease_expires_at")
  WHERE "completed_at" IS NULL;

--> statement-breakpoint
ALTER TABLE "dispatch_intents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dispatch_intents" FORCE ROW LEVEL SECURITY;
CREATE POLICY "dispatch_intents_workspace_scope" ON "dispatch_intents"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);

--> statement-breakpoint
ALTER TABLE "dispatch_attempts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dispatch_attempts" FORCE ROW LEVEL SECURITY;
CREATE POLICY "dispatch_attempts_workspace_scope" ON "dispatch_attempts"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);

--> statement-breakpoint
REVOKE ALL ON dispatch_intents, dispatch_attempts FROM maria_runtime;
GRANT SELECT, INSERT, UPDATE ON dispatch_intents, dispatch_attempts TO maria_runtime;
