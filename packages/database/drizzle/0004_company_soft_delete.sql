ALTER TABLE companies ADD COLUMN deleted_at timestamptz;
--> statement-breakpoint
CREATE INDEX companies_workspace_active_idx
  ON companies (workspace_id)
  WHERE deleted_at IS NULL;
