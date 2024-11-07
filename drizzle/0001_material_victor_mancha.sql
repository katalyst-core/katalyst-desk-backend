CREATE TABLE IF NOT EXISTS "channel" (
	"channel_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"channel_auth_id" uuid NOT NULL,
	"channel_type" varchar NOT NULL,
	"channel_name" varchar,
	"channel_account" varchar NOT NULL,
	"channel_config" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "pk_channel" PRIMARY KEY("channel_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_auth" (
	"channel_auth_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"channel_type" varchar NOT NULL,
	"channel_auth_name" varchar,
	"channel_auth_account" varchar NOT NULL,
	"channel_auth_config" jsonb,
	"channelAuthExpiryDate" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "pk_channel_auth" PRIMARY KEY("channel_auth_id")
);
--> statement-breakpoint
ALTER TABLE "agent" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "agent" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "agent_auth" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "agent_auth" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "agent_session" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "agent_session" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "channel_customer" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "channel_customer" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "master_customer" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "master_customer" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organization_agent" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organization_agent" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "team" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "team" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "team_agent" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "team_agent" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ticket_message" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ticket_message" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "agent" ADD COLUMN "email" varchar;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "channel_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket_message" ADD COLUMN "message_code" varchar;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel" ADD CONSTRAINT "fk_organization_id" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("organization_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel" ADD CONSTRAINT "fk_channel_auth_id" FOREIGN KEY ("channel_auth_id") REFERENCES "public"."channel_auth"("channel_auth_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel" ADD CONSTRAINT "fk_channel_type" FOREIGN KEY ("channel_type") REFERENCES "public"."channel_type"("type_id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel_auth" ADD CONSTRAINT "fk_organization_id" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("organization_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel_auth" ADD CONSTRAINT "fk_channel_type" FOREIGN KEY ("channel_type") REFERENCES "public"."channel_type"("type_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket" ADD CONSTRAINT "fk_channel_id" FOREIGN KEY ("channel_id") REFERENCES "public"."channel"("channel_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "ticket_message" ADD CONSTRAINT "u_ticket_message_message_code" UNIQUE NULLS NOT DISTINCT("message_code");