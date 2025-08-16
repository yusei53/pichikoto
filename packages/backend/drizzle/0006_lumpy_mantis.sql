ALTER TABLE "discord_tokens" ADD COLUMN "expired_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "discord_tokens" DROP COLUMN "expires_at";