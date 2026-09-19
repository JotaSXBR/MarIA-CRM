ALTER TABLE "workspaces"
  ADD COLUMN "onboarding_state" jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN "onboarded_at" timestamptz;
