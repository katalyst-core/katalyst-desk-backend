ALTER TABLE "ticket_message" DROP CONSTRAINT "ticket_message_ticket_id_ticket_ticket_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_message" ADD CONSTRAINT "ticket_message_ticket_id_ticket_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("ticket_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
