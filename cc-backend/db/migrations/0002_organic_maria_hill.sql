ALTER TABLE "products" ADD COLUMN "age_restricted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sb_auth_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "birth_date" date;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_sb_auth_id_unique" UNIQUE("sb_auth_id");