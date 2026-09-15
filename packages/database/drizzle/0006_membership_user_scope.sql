DROP POLICY memberships_workspace_scope ON memberships;
--> statement-breakpoint
CREATE POLICY "memberships_scope" ON "memberships"
  USING (
    workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
    OR user_id = nullif(current_setting('app.user_id', true), '')::uuid
  )
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);
