CREATE TABLE "appreciation_receivers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"appreciation_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uk_appreciation_receiver" UNIQUE("appreciation_id","receiver_id")
);
--> statement-breakpoint
CREATE TABLE "appreciations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"sender_id" uuid NOT NULL,
	"message" text NOT NULL,
	"point_per_receiver" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chk_point_per_receiver_range" CHECK ("appreciations"."point_per_receiver" >= 1 AND "appreciations"."point_per_receiver" <= 120),
	CONSTRAINT "chk_message_length" CHECK (char_length("appreciations"."message") >= 1 AND char_length("appreciations"."message") <= 200)
);
--> statement-breakpoint
CREATE TABLE "consumed_point_log" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"appreciation_id" uuid NOT NULL,
	"week_start_date" date NOT NULL,
	"consumed_points" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chk_consumed_points_range" CHECK ("consumed_point_log"."consumed_points" >= 1 AND "consumed_point_log"."consumed_points" <= 120)
);
--> statement-breakpoint
ALTER TABLE "appreciation_receivers" ADD CONSTRAINT "appreciation_receivers_appreciation_id_appreciations_id_fk" FOREIGN KEY ("appreciation_id") REFERENCES "public"."appreciations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appreciation_receivers" ADD CONSTRAINT "appreciation_receivers_receiver_id_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appreciations" ADD CONSTRAINT "appreciations_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumed_point_log" ADD CONSTRAINT "consumed_point_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumed_point_log" ADD CONSTRAINT "consumed_point_log_appreciation_id_appreciations_id_fk" FOREIGN KEY ("appreciation_id") REFERENCES "public"."appreciations"("id") ON DELETE cascade ON UPDATE no action;