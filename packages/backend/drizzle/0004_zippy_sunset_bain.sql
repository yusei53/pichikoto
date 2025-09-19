ALTER TABLE "user_auth" RENAME TO "discord_tokens";--> statement-breakpoint
ALTER TABLE "discord_tokens" RENAME CONSTRAINT "user_auth_user_id_user_id_fk" TO "discord_tokens_user_id_user_id_fk";