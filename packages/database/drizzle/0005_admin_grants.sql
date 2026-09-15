GRANT SELECT, INSERT, UPDATE ON organizations, workspaces TO maria_runtime;
--> statement-breakpoint
CREATE UNIQUE INDEX memberships_user_workspace_key
  ON memberships (user_id, workspace_id);
