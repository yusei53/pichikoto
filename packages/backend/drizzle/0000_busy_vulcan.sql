CREATE TABLE "appreciation_receivers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"appreciation_id" uuid NOT NULL,
	"receiver_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uk_appreciation_receiver" UNIQUE("appreciation_id","receiver_id")
);
--> statement-breakpoint
CREATE TABLE "appreciations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"sender_id" text NOT NULL,
	"message" text NOT NULL,
	"point_per_receiver" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chk_point_per_receiver_range" CHECK ("appreciations"."point_per_receiver" >= 1 AND "appreciations"."point_per_receiver" <= 120),
	CONSTRAINT "chk_message_length" CHECK (char_length("appreciations"."message") >= 1 AND char_length("appreciations"."message") <= 200)
);
--> statement-breakpoint
CREATE TABLE "discord_tokens" (
	"discord_user_id" text PRIMARY KEY NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"scope" text NOT NULL,
	"token_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_state" (
	"session_id" text PRIMARY KEY NOT NULL,
	"state" text NOT NULL,
	"nonce" text NOT NULL,
	"code_verifier" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_state_state_unique" UNIQUE("state")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"discord_user_id" text PRIMARY KEY NOT NULL,
	"discord_user_name" text NOT NULL,
	"discord_avatar" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appreciation_receivers" ADD CONSTRAINT "appreciation_receivers_appreciation_id_appreciations_id_fk" FOREIGN KEY ("appreciation_id") REFERENCES "public"."appreciations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appreciation_receivers" ADD CONSTRAINT "appreciation_receivers_receiver_id_user_discord_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("discord_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appreciations" ADD CONSTRAINT "appreciations_sender_id_user_discord_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("discord_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discord_tokens" ADD CONSTRAINT "discord_tokens_discord_user_id_user_discord_user_id_fk" FOREIGN KEY ("discord_user_id") REFERENCES "public"."user"("discord_user_id") ON DELETE cascade ON UPDATE no action;