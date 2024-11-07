DO $$ BEGIN
 ALTER TABLE "agent_auth" ADD CONSTRAINT "fk_auth_type" FOREIGN KEY ("auth_type") REFERENCES "public"."auth_type"("type_id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
