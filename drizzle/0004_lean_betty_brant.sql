CREATE TABLE IF NOT EXISTS "MasterProduct" (
	"product_id" bigserial PRIMARY KEY NOT NULL,
	"store_id" bigint,
	"name" varchar NOT NULL,
	"sku" varchar,
	"description" varchar,
	"stock" integer,
	"active" boolean
);
--> statement-breakpoint
ALTER TABLE "Store" DROP CONSTRAINT "Store_owner_id_User_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "MasterProduct" ADD CONSTRAINT "MasterProduct_store_id_Store_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."Store"("store_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Store" ADD CONSTRAINT "Store_owner_id_User_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."User"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
