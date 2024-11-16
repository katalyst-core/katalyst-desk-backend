CREATE TABLE IF NOT EXISTS "ticket_agent" (
	"ticket_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "pk_ticket_agent" PRIMARY KEY("ticket_id","agent_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_agent" ADD CONSTRAINT "fk_ticket_id" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("ticket_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_agent" ADD CONSTRAINT "fk_agent_id" FOREIGN KEY ("agent_id") REFERENCES "public"."agent"("agent_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
