UPDATE "memberships" SET "role" = 'agent' WHERE "role" = 'member';
--> statement-breakpoint
UPDATE "invitations" SET "role" = 'agent' WHERE "role" = 'member';
