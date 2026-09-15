ALTER TABLE contacts ADD COLUMN deleted_at timestamptz;
--> statement-breakpoint
CREATE INDEX contacts_workspace_active_idx
  ON contacts (workspace_id)
  WHERE deleted_at IS NULL;
