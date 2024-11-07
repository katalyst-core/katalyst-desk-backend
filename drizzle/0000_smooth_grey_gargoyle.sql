CREATE TABLE IF NOT EXISTS "agent" (
	"agent_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "pk_agent" PRIMARY KEY("agent_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_auth" (
	"agent_id" uuid NOT NULL,
	"auth_type" varchar NOT NULL,
	"auth_value" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "pk_agent_auth" PRIMARY KEY("agent_id","auth_type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_session" (
	"session_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"session_token" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "pk_agent_session" PRIMARY KEY("session_id"),
	CONSTRAINT "agent_session_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_type" (
	"type_id" varchar NOT NULL,
	CONSTRAINT "pk_auth_type" PRIMARY KEY("type_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_customer" (
	"channel_customer_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"master_customer_id" uuid NOT NULL,
	"customer_account" varchar NOT NULL,
	"channel_type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "pk_channel_customer" PRIMARY KEY("channel_customer_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_type" (
	"type_id" varchar NOT NULL,
	CONSTRAINT "pk_channel_type" PRIMARY KEY("type_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "master_customer" (
	"master_customer_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"customer_name" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "pk_master_customer" PRIMARY KEY("master_customer_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "message_status" (
	"status_id" varchar NOT NULL,
	CONSTRAINT "pk_message_status" PRIMARY KEY("status_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization" (
	"organization_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "pk_organization" PRIMARY KEY("organization_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_agent" (
	"organization_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "pk_organization_agent" PRIMARY KEY("organization_id","agent_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team" (
	"team_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "pk_team" PRIMARY KEY("team_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_agent" (
	"team_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "pk_team_agent" PRIMARY KEY("team_id","agent_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket" (
	"ticket_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"ticket_code" varchar NOT NULL,
	"organization_id" uuid NOT NULL,
	"channel_customer_id" uuid NOT NULL,
	"ticket_status" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "pk_ticket" PRIMARY KEY("ticket_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_message" (
	"message_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"agent_id" uuid,
	"is_customer" boolean DEFAULT false NOT NULL,
	"message_content" text NOT NULL,
	"message_status" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "pk_ticket_message" PRIMARY KEY("message_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_status" (
	"status_id" varchar NOT NULL,
	CONSTRAINT "pk_ticket_status" PRIMARY KEY("status_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_auth" ADD CONSTRAINT "fk_agent_id" FOREIGN KEY ("agent_id") REFERENCES "public"."agent"("agent_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_session" ADD CONSTRAINT "fk_agent_id" FOREIGN KEY ("agent_id") REFERENCES "public"."agent"("agent_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel_customer" ADD CONSTRAINT "fk_master_customer_id" FOREIGN KEY ("master_customer_id") REFERENCES "public"."master_customer"("master_customer_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel_customer" ADD CONSTRAINT "fk_channel_type" FOREIGN KEY ("channel_type") REFERENCES "public"."channel_type"("type_id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization" ADD CONSTRAINT "fk_owner_id" FOREIGN KEY ("owner_id") REFERENCES "public"."agent"("agent_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_agent" ADD CONSTRAINT "fk_organization_id" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("organization_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team" ADD CONSTRAINT "fk_organization_id" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("organization_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_agent" ADD CONSTRAINT "fk_team_id" FOREIGN KEY ("team_id") REFERENCES "public"."team"("team_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_agent" ADD CONSTRAINT "fk_agent_id" FOREIGN KEY ("agent_id") REFERENCES "public"."agent"("agent_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket" ADD CONSTRAINT "fk_organization_id" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("organization_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket" ADD CONSTRAINT "fk_channel_customer_id" FOREIGN KEY ("channel_customer_id") REFERENCES "public"."channel_customer"("channel_customer_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket" ADD CONSTRAINT "fk_ticket_status" FOREIGN KEY ("ticket_status") REFERENCES "public"."ticket_status"("status_id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_message" ADD CONSTRAINT "fk_ticket_id" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("ticket_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_message" ADD CONSTRAINT "fk_agent_id" FOREIGN KEY ("agent_id") REFERENCES "public"."agent"("agent_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_message" ADD CONSTRAINT "fk_message_status" FOREIGN KEY ("message_status") REFERENCES "public"."message_status"("status_id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
