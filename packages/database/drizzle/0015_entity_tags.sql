CREATE TABLE "tags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "color" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);
--> statement-breakpoint
CREATE TABLE "contact_tags" (
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "tag_id" uuid NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
  "contact_id" uuid NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("tag_id", "contact_id")
);
--> statement-breakpoint
CREATE TABLE "company_tags" (
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "tag_id" uuid NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
  "company_id" uuid NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("tag_id", "company_id")
);
--> statement-breakpoint
CREATE TABLE "deal_tags" (
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "tag_id" uuid NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
  "deal_id" uuid NOT NULL REFERENCES "deals"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("tag_id", "deal_id")
);
--> statement-breakpoint
CREATE INDEX "tags_workspace_id_idx" ON "tags" ("workspace_id");
--> statement-breakpoint
CREATE INDEX "tags_workspace_active_idx" ON "tags" ("workspace_id") WHERE "deleted_at" IS NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX "tags_workspace_name_active_idx" ON "tags" ("workspace_id", "name") WHERE "deleted_at" IS NULL;
--> statement-breakpoint
CREATE INDEX "contact_tags_contact_idx" ON "contact_tags" ("contact_id");
--> statement-breakpoint
CREATE INDEX "company_tags_company_idx" ON "company_tags" ("company_id");
--> statement-breakpoint
CREATE INDEX "deal_tags_deal_idx" ON "deal_tags" ("deal_id");
--> statement-breakpoint
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tags" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tags_workspace_scope" ON "tags"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "contact_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_tags" FORCE ROW LEVEL SECURITY;
CREATE POLICY "contact_tags_workspace_scope" ON "contact_tags"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "company_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "company_tags" FORCE ROW LEVEL SECURITY;
CREATE POLICY "company_tags_workspace_scope" ON "company_tags"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "deal_tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "deal_tags" FORCE ROW LEVEL SECURITY;
CREATE POLICY "deal_tags_workspace_scope" ON "deal_tags"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON tags TO maria_runtime;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON contact_tags, company_tags, deal_tags TO maria_runtime;
