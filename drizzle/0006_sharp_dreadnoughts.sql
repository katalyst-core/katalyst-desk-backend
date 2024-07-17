ALTER TABLE "MasterProduct" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "MasterProduct" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "MasterProduct" ADD COLUMN "created_by" bigint;--> statement-breakpoint
ALTER TABLE "MasterProduct" ADD COLUMN "updated_by" bigint;--> statement-breakpoint
ALTER TABLE "Store" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "Store" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "Store" ADD COLUMN "created_by" bigint;--> statement-breakpoint
ALTER TABLE "Store" ADD COLUMN "updated_by" bigint;