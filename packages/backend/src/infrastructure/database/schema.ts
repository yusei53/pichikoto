import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  discordUserName: text("discord_user_name").notNull(),
  discordDiscriminator: text("discord_discriminator").notNull(),
  discordAvatar: text("discord_avatar").notNull(),
  faculty: text("faculty"),
  department: text("department"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
