ALTER TABLE "user_auth" ADD COLUMN "expires_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "user_auth" DROP COLUMN "expires_in";