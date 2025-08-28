import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  discordUserName: text("discord_user_name").notNull(),
  discordAvatar: text("discord_avatar").notNull(),
  faculty: text("faculty"),
  department: text("department"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const userAuth = pgTable("user_auth", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
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
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
