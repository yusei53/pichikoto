import type { user } from "../../../database/schema";
import { DiscordUserID } from "../../../src/domain/user/User";

/**
 * テスト用のDiscord情報
 */
export const COMMON_DISCORD_INFO = {
  USER_NAME: "TestUserName",
  AVATAR:
    "https://cdn.discordapp.com/sample-avatar/123456789/000000000000000000.png"
} as const;

/**
 * ユーザーのfixture
 */
export const createUserTableFixture = () => {
  return {
    discordUserId: DiscordUserID.new().value,
    discordUserName: COMMON_DISCORD_INFO.USER_NAME,
    discordAvatar: COMMON_DISCORD_INFO.AVATAR,
    createdAt: new Date()
  } satisfies typeof user.$inferInsert;
};
