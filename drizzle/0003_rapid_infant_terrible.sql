CREATE TABLE IF NOT EXISTS "Store" (
	"store_id" bigserial PRIMARY KEY NOT NULL,
	"owner_id" bigint,
	"name" varchar NOT NULL,
	"public_id" varchar(16) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Store" ADD CONSTRAINT "Store_owner_id_User_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."User"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
