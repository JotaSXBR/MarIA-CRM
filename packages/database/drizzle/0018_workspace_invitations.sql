ALTER TABLE "invitations" RENAME COLUMN "token" TO "token_hash";
--> statement-breakpoint
ALTER TABLE "invitations" RENAME CONSTRAINT "invitations_token_key" TO "invitations_token_hash_key";
--> statement-breakpoint
ALTER TABLE "invitations" RENAME COLUMN "used_at" TO "consumed_at";
--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "invited_by" uuid REFERENCES "users"("id") ON DELETE SET NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX "invitations_live_workspace_email_key"
  ON "invitations" ("workspace_id", "email")
  WHERE "consumed_at" IS NULL;
--> statement-breakpoint
DROP POLICY "invitations_workspace_scope" ON "invitations";
--> statement-breakpoint
CREATE POLICY "invitations_scope" ON "invitations"
  USING (
    workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid
    OR token_hash = nullif(current_setting('app.invite_token_hash', true), '')
  )
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);
