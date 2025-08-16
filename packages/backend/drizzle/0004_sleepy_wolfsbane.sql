CREATE TABLE "discord_tokens" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_in" timestamp NOT NULL,
	"scope" text NOT NULL,
	"token_type" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "user_auth" CASCADE;--> statement-breakpoint
ALTER TABLE "discord_tokens" ADD CONSTRAINT "discord_tokens_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "discord_discriminator";