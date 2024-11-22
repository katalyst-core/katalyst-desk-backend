CREATE TABLE IF NOT EXISTS "agent" (
	"agent_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"email" varchar,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "agent_agent_id_pk" PRIMARY KEY("agent_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_auth" (
	"agent_id" uuid NOT NULL,
	"auth_type" varchar NOT NULL,
	"auth_value" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "agent_auth_agent_id_auth_type_pk" PRIMARY KEY("agent_id","auth_type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_role" (
	"role_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	CONSTRAINT "agent_role_agent_id_role_id_pk" PRIMARY KEY("agent_id","role_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_session" (
	"session_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"session_token" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "agent_session_session_id_pk" PRIMARY KEY("session_id"),
	CONSTRAINT "agent_session_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agent_team" (
	"organization_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "agent_team_team_id_agent_id_pk" PRIMARY KEY("team_id","agent_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_type" (
	"type_id" varchar NOT NULL,
	CONSTRAINT "auth_type_type_id_pk" PRIMARY KEY("type_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel" (
	"channel_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"channel_type" varchar NOT NULL,
	"channel_name" varchar,
	"channel_parent_account" varchar,
	"channel_account" varchar NOT NULL,
	"channel_config" jsonb,
	"channel_expiry_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "channel_channel_id_pk" PRIMARY KEY("channel_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_customer" (
	"channel_customer_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"master_customer_id" uuid NOT NULL,
	"customer_account" varchar NOT NULL,
	"channel_type" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "channel_customer_channel_customer_id_pk" PRIMARY KEY("channel_customer_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_type" (
	"type_id" varchar NOT NULL,
	CONSTRAINT "channel_type_type_id_pk" PRIMARY KEY("type_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "master_customer" (
	"master_customer_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"customer_name" varchar,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "master_customer_master_customer_id_pk" PRIMARY KEY("master_customer_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "message_status" (
	"status_id" varchar NOT NULL,
	CONSTRAINT "message_status_status_id_pk" PRIMARY KEY("status_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization" (
	"organization_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "organization_organization_id_pk" PRIMARY KEY("organization_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_agent" (
	"organization_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "organization_agent_organization_id_agent_id_pk" PRIMARY KEY("organization_id","agent_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role" (
	"role_id" uuid NOT NULL,
	"role_name" varchar(64) NOT NULL,
	"organization_id" uuid NOT NULL,
	"permission" bit varying(32) NOT NULL,
	CONSTRAINT "role_role_id_pk" PRIMARY KEY("role_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team" (
	"team_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "team_team_id_pk" PRIMARY KEY("team_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket" (
	"ticket_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"ticket_code" varchar NOT NULL,
	"organization_id" uuid NOT NULL,
	"channel_id" uuid,
	"channel_customer_id" uuid NOT NULL,
	"ticket_status" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "ticket_ticket_id_pk" PRIMARY KEY("ticket_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_agent" (
	"ticket_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "ticket_agent_ticket_id_agent_id_pk" PRIMARY KEY("ticket_id","agent_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_message" (
	"message_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"agent_id" uuid,
	"message_code" varchar,
	"is_customer" boolean DEFAULT false NOT NULL,
	"message_content" jsonb NOT NULL,
	"message_status" varchar,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "ticket_message_message_id_pk" PRIMARY KEY("message_id"),
	CONSTRAINT "u_ticket_message_message_code" UNIQUE NULLS NOT DISTINCT("message_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_status" (
	"status_id" varchar NOT NULL,
	CONSTRAINT "ticket_status_status_id_pk" PRIMARY KEY("status_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_team" (
	"ticket_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "ticket_team_ticket_id_team_id_pk" PRIMARY KEY("ticket_id","team_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_auth" ADD CONSTRAINT "agent_auth_agent_id_agent_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent"("agent_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_auth" ADD CONSTRAINT "agent_auth_auth_type_auth_type_type_id_fk" FOREIGN KEY ("auth_type") REFERENCES "public"."auth_type"("type_id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_role" ADD CONSTRAINT "agent_role_role_id_role_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("role_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_role" ADD CONSTRAINT "agent_role_agent_id_organization_id_organization_agent_agent_id_organization_id_fk" FOREIGN KEY ("agent_id","organization_id") REFERENCES "public"."organization_agent"("agent_id","organization_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_session" ADD CONSTRAINT "agent_session_agent_id_agent_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent"("agent_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_team" ADD CONSTRAINT "agent_team_team_id_team_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("team_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agent_team" ADD CONSTRAINT "agent_team_agent_id_organization_id_organization_agent_agent_id_organization_id_fk" FOREIGN KEY ("agent_id","organization_id") REFERENCES "public"."organization_agent"("agent_id","organization_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel" ADD CONSTRAINT "channel_organization_id_organization_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("organization_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel" ADD CONSTRAINT "channel_channel_type_channel_type_type_id_fk" FOREIGN KEY ("channel_type") REFERENCES "public"."channel_type"("type_id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel_customer" ADD CONSTRAINT "channel_customer_master_customer_id_master_customer_master_customer_id_fk" FOREIGN KEY ("master_customer_id") REFERENCES "public"."master_customer"("master_customer_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel_customer" ADD CONSTRAINT "channel_customer_channel_type_channel_type_type_id_fk" FOREIGN KEY ("channel_type") REFERENCES "public"."channel_type"("type_id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization" ADD CONSTRAINT "organization_owner_id_agent_agent_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."agent"("agent_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_agent" ADD CONSTRAINT "organization_agent_organization_id_organization_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("organization_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "organization_agent" ADD CONSTRAINT "organization_agent_agent_id_agent_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent"("agent_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role" ADD CONSTRAINT "role_organization_id_organization_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("organization_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team" ADD CONSTRAINT "team_organization_id_organization_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("organization_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket" ADD CONSTRAINT "ticket_organization_id_organization_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("organization_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket" ADD CONSTRAINT "ticket_channel_id_channel_channel_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channel"("channel_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket" ADD CONSTRAINT "ticket_channel_customer_id_channel_customer_channel_customer_id_fk" FOREIGN KEY ("channel_customer_id") REFERENCES "public"."channel_customer"("channel_customer_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket" ADD CONSTRAINT "ticket_ticket_status_ticket_status_status_id_fk" FOREIGN KEY ("ticket_status") REFERENCES "public"."ticket_status"("status_id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_agent" ADD CONSTRAINT "ticket_agent_ticket_id_ticket_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("ticket_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_agent" ADD CONSTRAINT "ticket_agent_agent_id_organization_id_organization_agent_agent_id_organization_id_fk" FOREIGN KEY ("agent_id","organization_id") REFERENCES "public"."organization_agent"("agent_id","organization_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_message" ADD CONSTRAINT "ticket_message_ticket_id_ticket_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("ticket_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_message" ADD CONSTRAINT "ticket_message_agent_id_agent_agent_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agent"("agent_id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_message" ADD CONSTRAINT "ticket_message_message_status_message_status_status_id_fk" FOREIGN KEY ("message_status") REFERENCES "public"."message_status"("status_id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_team" ADD CONSTRAINT "ticket_team_ticket_id_ticket_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("ticket_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_team" ADD CONSTRAINT "ticket_team_team_id_team_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("team_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
