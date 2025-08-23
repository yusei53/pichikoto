CREATE TABLE "oauth_state" (
	"session_id" text PRIMARY KEY NOT NULL,
	"state" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_state_state_unique" UNIQUE("state")
);
