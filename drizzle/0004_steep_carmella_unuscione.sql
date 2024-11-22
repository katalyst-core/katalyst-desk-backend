ALTER TABLE "organization" DROP CONSTRAINT "organization_owner_id_agent_agent_id_fk";
--> statement-breakpoint
ALTER TABLE "organization_agent" ADD COLUMN "is_owner" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN IF EXISTS "owner_id";