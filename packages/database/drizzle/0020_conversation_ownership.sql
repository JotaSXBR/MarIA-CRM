ALTER TABLE "conversations"
  ADD COLUMN "assigned_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  ADD COLUMN "assigned_at" timestamptz;

--> statement-breakpoint
CREATE INDEX "conversations_assigned_user_idx"
  ON "conversations" ("workspace_id", "assigned_user_id");

--> statement-breakpoint
CREATE TABLE "conversation_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "conversation_id" uuid NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "assigned_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "assigned_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

--> statement-breakpoint
CREATE INDEX "conversation_assignments_conversation_idx"
  ON "conversation_assignments" ("conversation_id");

--> statement-breakpoint
ALTER TABLE "conversation_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversation_assignments" FORCE ROW LEVEL SECURITY;
CREATE POLICY "conversation_assignments_workspace_scope" ON "conversation_assignments"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);

--> statement-breakpoint
REVOKE ALL ON conversation_assignments FROM maria_runtime;
GRANT SELECT, INSERT ON conversation_assignments TO maria_runtime;
