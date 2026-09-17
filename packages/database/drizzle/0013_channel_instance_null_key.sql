DROP INDEX "channel_instances_provider_key_idx";

--> statement-breakpoint
CREATE UNIQUE INDEX "channel_instances_provider_key_idx"
  ON "channel_instances" ("workspace_id", "provider", "provider_instance_id")
  WHERE "provider_instance_id" IS NOT NULL;

--> statement-breakpoint
CREATE UNIQUE INDEX "channel_instances_default_provider_key_idx"
  ON "channel_instances" ("workspace_id", "provider")
  WHERE "provider_instance_id" IS NULL;
