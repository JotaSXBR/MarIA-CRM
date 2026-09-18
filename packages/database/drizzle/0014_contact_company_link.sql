ALTER TABLE "contacts" ADD COLUMN "company_id" uuid REFERENCES "companies"("id");

--> statement-breakpoint
CREATE INDEX "contacts_company_active_idx"
  ON "contacts" ("company_id")
  WHERE "deleted_at" IS NULL;
