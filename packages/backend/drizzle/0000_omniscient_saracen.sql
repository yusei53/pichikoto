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
