import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  discordUserName: text("discord_user_name").notNull(),
  discordAvatar: text("discord_avatar").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const discordTokens = pgTable("discord_tokens", {
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
  codeVerifier: text("code_verifier").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
