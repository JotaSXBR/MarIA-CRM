CREATE TABLE "attribute_definitions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "entity_type" text NOT NULL,
  "key" text NOT NULL,
  "label" text NOT NULL,
  "type" text NOT NULL,
  "options" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);
--> statement-breakpoint
CREATE TABLE "entity_attribute_values" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "attribute_id" uuid NOT NULL REFERENCES "attribute_definitions"("id") ON DELETE CASCADE,
  "entity_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "value" jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "attribute_definitions_workspace_id_idx" ON "attribute_definitions" ("workspace_id");
--> statement-breakpoint
CREATE INDEX "attribute_definitions_entity_idx" ON "attribute_definitions" ("workspace_id", "entity_type");
--> statement-breakpoint
CREATE UNIQUE INDEX "attribute_definitions_workspace_entity_key_active_idx" ON "attribute_definitions" ("workspace_id", "entity_type", "key") WHERE "deleted_at" IS NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX "entity_attribute_values_attribute_entity_idx" ON "entity_attribute_values" ("attribute_id", "entity_id");
--> statement-breakpoint
CREATE INDEX "entity_attribute_values_entity_idx" ON "entity_attribute_values" ("workspace_id", "entity_type", "entity_id");
--> statement-breakpoint
ALTER TABLE "attribute_definitions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attribute_definitions" FORCE ROW LEVEL SECURITY;
CREATE POLICY "attribute_definitions_workspace_scope" ON "attribute_definitions"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);
--> statement-breakpoint
ALTER TABLE "entity_attribute_values" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "entity_attribute_values" FORCE ROW LEVEL SECURITY;
CREATE POLICY "entity_attribute_values_workspace_scope" ON "entity_attribute_values"
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON attribute_definitions TO maria_runtime;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON entity_attribute_values TO maria_runtime;
