CREATE TABLE IF NOT EXISTS "channel_event_log" (
	"id" bigserial NOT NULL,
	"content" jsonb NOT NULL,
	"is_processed" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "channel_event_log_id_pk" PRIMARY KEY("id")
);
--> statement-breakpoint
ALTER TABLE "agent_role" ADD COLUMN "created_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "agent_role" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "agent_role" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "agent_role" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN "created_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN "updated_by" uuid;