CREATE UNIQUE INDEX IF NOT EXISTS contacts_workspace_phone_active_idx
ON contacts (workspace_id, phone)
WHERE deleted_at IS NULL;
