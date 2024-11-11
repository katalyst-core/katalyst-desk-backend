ALTER TABLE "channel" DROP CONSTRAINT "fk_channel_auth_id";
ALTER TABLE "channel" DROP COLUMN IF EXISTS "channel_auth_id";
ALTER TABLE "channel_auth" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "channel_auth" CASCADE;--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "channel" ADD COLUMN "channel_parent_account" varchar;--> statement-breakpoint
ALTER TABLE "channel" ADD COLUMN "channel_expiry_date" timestamp with time zone;--> statement-breakpoint