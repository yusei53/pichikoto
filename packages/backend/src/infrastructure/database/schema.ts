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

export const discordTokens = pgTable("discord_tokens", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiredAt: timestamp("expired_at").notNull(),
  scope: text("scope").notNull(),
  tokenType: text("token_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()) // 期限切れたらrefresh_token で再取得しdiscord_tokensを更新するため、updatedAtを用意
});
