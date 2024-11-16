CREATE TABLE IF NOT EXISTS "ticket_team" (
	"ticket_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "pk_ticket_team" PRIMARY KEY("ticket_id","team_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_team" ADD CONSTRAINT "fk_ticket_id" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("ticket_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_team" ADD CONSTRAINT "fk_team_id" FOREIGN KEY ("team_id") REFERENCES "public"."team"("team_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
