CREATE TABLE "notes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "contact_id" uuid REFERENCES "contacts"("id"),
  "company_id" uuid REFERENCES "companies"("id"),
  "deal_id" uuid REFERENCES "deals"("id"),
  "author_id" uuid REFERENCES "users"("id"),
  "body" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);
--> statement-breakpoint
CREATE TABLE "tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "contact_id" uuid REFERENCES "contacts"("id"),
  "company_id" uuid REFERENCES "companies"("id"),
  "deal_id" uuid REFERENCES "deals"("id"),
  "assignee_id" uuid REFERENCES "users"("id"),
  "title" text NOT NULL,
  "due_at" timestamptz,
  "done_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);
--> statement-breakpoint
CREATE INDEX "notes_workspace_id_idx" ON "notes" ("workspace_id");
--> statement-breakpoint
CREATE INDEX "notes_contact_active_idx" ON "notes" ("contact_id") WHERE "deleted_at" IS NULL;
--> statement-breakpoint
CREATE INDEX "notes_company_active_idx" ON "notes" ("company_id") WHERE "deleted_at" IS NULL;
--> statement-breakpoint
CREATE INDEX "notes_deal_active_idx" ON "notes" ("deal_id") WHERE "deleted_at" IS NULL;
--> statement-breakpoint
CREATE INDEX "tasks_workspace_id_idx" ON "tasks" ("workspace_id");
--> statement-breakpoint
CREATE INDEX "tasks_contact_active_idx" ON "tasks" ("contact_id") WHERE "deleted_at" IS NULL;
--> statement-breakpoint
CREATE INDEX "tasks_company_active_idx" ON "tasks" ("company_id") WHERE "deleted_at" IS NULL;
--> statement-breakpoint
CREATE INDEX "tasks_deal_active_idx" ON "tasks" ("deal_id") WHERE "deleted_at" IS NULL;
--> statement-breakpoint
ALTER TABLE "notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notes" FORCE ROW LEVEL SECURITY;
CREATE POLICY "notes_workspace_scope" ON "notes"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tasks_workspace_scope" ON "tasks"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON notes, tasks TO maria_runtime;
