import { sql } from "drizzle-orm";
import {
  check,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  discordUserId: text("discord_user_id").primaryKey(),
  discordUserName: text("discord_user_name").notNull(),
  discordGlobalName: text("discord_global_name"),
  discordAvatar: text("discord_avatar").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const discordTokens = pgTable("discord_tokens", {
  discordUserId: text("discord_user_id")
    .primaryKey()
    .references(() => user.discordUserId, { onDelete: "cascade" }),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  scope: text("scope").notNull(),
  tokenType: text("token_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const oauthState = pgTable("oauth_state", {
  sessionId: text("session_id").primaryKey(),
  state: text("state").notNull().unique(),
  nonce: text("nonce").notNull(),
  codeVerifier: text("code_verifier").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const appreciations = pgTable(
  "appreciations",
  {
    id: uuid("id").primaryKey(),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.discordUserId, { onDelete: "cascade" }),
    message: text("message").notNull(),
    pointPerReceiver: integer("point_per_receiver").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow()
  },
  (table) => [
    check(
      "chk_point_per_receiver_range",
      sql`${table.pointPerReceiver} >= 1 AND ${table.pointPerReceiver} <= 120`
    ),
    check(
      "chk_message_length",
      sql`char_length(${table.message}) >= 1 AND char_length(${table.message}) <= 200`
    )
  ]
);

export const appreciationReceivers = pgTable(
  "appreciation_receivers",
  {
    id: uuid("id").primaryKey(),
    appreciationId: uuid("appreciation_id")
      .notNull()
      .references(() => appreciations.id, { onDelete: "cascade" }),
    receiverId: text("receiver_id")
      .notNull()
      .references(() => user.discordUserId, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow()
  },
  (table) => [
    unique("uk_appreciation_receiver").on(
      table.appreciationId,
      table.receiverId
    )
  ]
);
