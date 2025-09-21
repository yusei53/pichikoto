import type { user } from "../../../database/schema";
import { UUID } from "../../../src/utils/UUID";

/**
 * テスト用のDiscord情報
 */
export const COMMON_DISCORD_INFO = {
  USER_NAME: "TestUserName",
  AVATAR:
    "https://cdn.discordapp.com/sample-avatar/123456789/000000000000000000.png"
} as const;

/**
 * テスト用のDiscordID
 */
const createDiscordID = () => {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
};

/**
 * ユーザーのfixture
 */
export const createUserTableFixture = () => {
  return {
    id: UUID.new().value,
    discordId: createDiscordID(),
    discordUserName: COMMON_DISCORD_INFO.USER_NAME,
    discordAvatar: COMMON_DISCORD_INFO.AVATAR,
    createdAt: new Date()
  } satisfies typeof user.$inferInsert;
};
