CREATE TABLE "user_auth" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_in" timestamp NOT NULL,
	"scope" text NOT NULL,
	"token_type" text NOT NULL
);
--> statement-breakpoint
DROP TABLE "user_tokens" CASCADE;--> statement-breakpoint
ALTER TABLE "user_auth" ADD CONSTRAINT "user_auth_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;