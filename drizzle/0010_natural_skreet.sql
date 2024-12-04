ALTER TABLE "channel_event_log" ADD COLUMN "channel_type" varchar NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "channel_event_log" ADD CONSTRAINT "channel_event_log_channel_type_channel_type_type_id_fk" FOREIGN KEY ("channel_type") REFERENCES "public"."channel_type"("type_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
