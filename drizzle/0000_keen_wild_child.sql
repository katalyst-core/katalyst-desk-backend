CREATE TABLE IF NOT EXISTS "BasicUserAuthentication" (
	"user_id" bigint PRIMARY KEY NOT NULL,
	"password_hash" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" bigint,
	"updated_by" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"user_id" bigserial PRIMARY KEY NOT NULL,
	"public_id" varchar(16) NOT NULL,
	"name" varchar NOT NULL,
	"username" varchar NOT NULL,
	"email" varchar NOT NULL,
	"email_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" bigint,
	"updated_by" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "UserSession" (
	"user_id" bigint,
	"session_token" varchar(16),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" bigint,
	"updated_by" bigint,
	CONSTRAINT "UserSession_user_id_session_token_pk" PRIMARY KEY("user_id","session_token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BasicUserAuthentication" ADD CONSTRAINT "BasicUserAuthentication_user_id_User_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_user_id_User_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
