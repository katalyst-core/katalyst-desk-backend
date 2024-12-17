ALTER TABLE "agent" ALTER COLUMN "name" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "agent" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "agent" ALTER COLUMN "email" SET DATA TYPE varchar(320);--> statement-breakpoint
ALTER TABLE "agent_auth" ALTER COLUMN "auth_type" SET DATA TYPE varchar(24);--> statement-breakpoint
ALTER TABLE "agent_auth" ALTER COLUMN "auth_value" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "auth_type" ALTER COLUMN "type_id" SET DATA TYPE varchar(24);--> statement-breakpoint
ALTER TABLE "channel" ALTER COLUMN "channel_type" SET DATA TYPE varchar(24);--> statement-breakpoint
ALTER TABLE "channel" ALTER COLUMN "channel_name" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "channel" ALTER COLUMN "channel_parent_account" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "channel" ALTER COLUMN "channel_account" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "channel" ALTER COLUMN "channel_config" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "channel_customer" ALTER COLUMN "customer_account" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "channel_customer" ALTER COLUMN "channel_type" SET DATA TYPE varchar(24);--> statement-breakpoint
ALTER TABLE "channel_event_log" ALTER COLUMN "channel_type" SET DATA TYPE varchar(24);--> statement-breakpoint
ALTER TABLE "channel_type" ALTER COLUMN "type_id" SET DATA TYPE varchar(24);--> statement-breakpoint
ALTER TABLE "master_customer" ALTER COLUMN "customer_name" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "message_status" ALTER COLUMN "status_id" SET DATA TYPE varchar(24);--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "name" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "welcome_message" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "team" ALTER COLUMN "name" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "ticket_code" SET DATA TYPE varchar(24);--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "ticket_status" SET DATA TYPE varchar(24);--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "conversation_id" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "ticket_message" ALTER COLUMN "message_code" SET DATA TYPE varchar(64);--> statement-breakpoint
ALTER TABLE "ticket_message" ALTER COLUMN "message_status" SET DATA TYPE varchar(24);--> statement-breakpoint
ALTER TABLE "ticket_message" ALTER COLUMN "message_status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket_status" ALTER COLUMN "status_id" SET DATA TYPE varchar(24);