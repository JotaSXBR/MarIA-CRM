ALTER TABLE "messages"
  ADD COLUMN "kind" text NOT NULL DEFAULT 'message',
  ADD COLUMN "author_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL;

--> statement-breakpoint
CREATE INDEX "messages_author_user_idx" ON "messages" ("author_user_id");

--> statement-breakpoint
CREATE TABLE "quick_replies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "shortcut" text NOT NULL,
  "body" text NOT NULL,
  "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);

--> statement-breakpoint
CREATE INDEX "quick_replies_workspace_id_idx" ON "quick_replies" ("workspace_id");

--> statement-breakpoint
CREATE UNIQUE INDEX "quick_replies_workspace_shortcut_active_idx"
  ON "quick_replies" ("workspace_id", "shortcut") WHERE "deleted_at" IS NULL;

--> statement-breakpoint
ALTER TABLE "quick_replies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quick_replies" FORCE ROW LEVEL SECURITY;
CREATE POLICY "quick_replies_workspace_scope" ON "quick_replies"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);

--> statement-breakpoint
REVOKE ALL ON quick_replies FROM maria_runtime;
GRANT SELECT, INSERT, UPDATE ON quick_replies TO maria_runtime;
