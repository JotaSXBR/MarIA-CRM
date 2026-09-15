CREATE TABLE "pipelines" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "position" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);
--> statement-breakpoint
CREATE TABLE "stages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "pipeline_id" uuid NOT NULL REFERENCES "pipelines"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "position" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);
--> statement-breakpoint
CREATE TABLE "deals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "pipeline_id" uuid NOT NULL REFERENCES "pipelines"("id") ON DELETE CASCADE,
  "stage_id" uuid NOT NULL REFERENCES "stages"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "value_cents" bigint,
  "contact_id" uuid REFERENCES "contacts"("id"),
  "company_id" uuid REFERENCES "companies"("id"),
  "position" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);
--> statement-breakpoint
CREATE INDEX "pipelines_workspace_id_idx" ON "pipelines" ("workspace_id");
--> statement-breakpoint
CREATE INDEX "pipelines_workspace_active_idx" ON "pipelines" ("workspace_id") WHERE "deleted_at" IS NULL;
--> statement-breakpoint
CREATE INDEX "stages_workspace_id_idx" ON "stages" ("workspace_id");
--> statement-breakpoint
CREATE INDEX "stages_pipeline_active_idx" ON "stages" ("pipeline_id") WHERE "deleted_at" IS NULL;
--> statement-breakpoint
CREATE INDEX "deals_workspace_id_idx" ON "deals" ("workspace_id");
--> statement-breakpoint
CREATE INDEX "deals_stage_active_idx" ON "deals" ("stage_id") WHERE "deleted_at" IS NULL;
--> statement-breakpoint
ALTER TABLE "pipelines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pipelines" FORCE ROW LEVEL SECURITY;
CREATE POLICY "pipelines_workspace_scope" ON "pipelines"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "stages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stages" FORCE ROW LEVEL SECURITY;
CREATE POLICY "stages_workspace_scope" ON "stages"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "deals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "deals" FORCE ROW LEVEL SECURITY;
CREATE POLICY "deals_workspace_scope" ON "deals"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);
--> statement-breakpoint
REVOKE ALL ON pipelines, stages, deals FROM maria_runtime;
GRANT SELECT, INSERT, UPDATE ON pipelines, stages, deals TO maria_runtime;
