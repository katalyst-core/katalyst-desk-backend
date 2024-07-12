ALTER TABLE "BasicUserAuthentication" DROP CONSTRAINT "BasicUserAuthentication_user_id_User_user_id_fk";
--> statement-breakpoint
ALTER TABLE "UserSession" DROP CONSTRAINT "UserSession_user_id_User_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BasicUserAuthentication" ADD CONSTRAINT "BasicUserAuthentication_user_id_User_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_user_id_User_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
