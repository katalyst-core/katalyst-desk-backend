ALTER TABLE "ticket" ADD COLUMN "conversation_id" varchar;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "conversation_expiration" timestamp with time zone;