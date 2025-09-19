CREATE TABLE "user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"discord_id" text NOT NULL,
	"discord_user_name" text NOT NULL,
	"discord_discriminator" text NOT NULL,
	"discord_avatar" text NOT NULL,
	"faculty" text,
	"department" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_discord_id_unique" UNIQUE("discord_id")
);
--> statement-breakpoint
CREATE TABLE "user_auth" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_in" timestamp NOT NULL,
	"scope" text NOT NULL,
	"token_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_auth" ADD CONSTRAINT "user_auth_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;