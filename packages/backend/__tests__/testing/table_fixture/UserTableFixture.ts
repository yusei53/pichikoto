import type { user } from "../../../database/schema";
import { UUID } from "@pichikoto/core/utils";

/**
 * テスト用のDiscord情報
 */
export const COMMON_DISCORD_INFO = {
  USER_NAME: "TestUserName",
  AVATAR:
    "https://cdn.discordapp.com/sample-avatar/123456789/000000000000000000.png"
} as const;

/**
 * 学部・学科を持つユーザーのfixture
 */
export const createUserTableFixture = () => {
  return {
    id: UUID.new().value,
    discordId: "123456789",
    discordUserName: COMMON_DISCORD_INFO.USER_NAME,
    discordAvatar: COMMON_DISCORD_INFO.AVATAR,
    faculty: "Test学部",
    department: "Test学科",
    createdAt: new Date()
  } satisfies typeof user.$inferInsert;
};

/**
 * 学部・学科を持たないユーザーのfixture
 */
export const createUserTableFixtureWithoutFacultyAndDepartment = () => {
  return {
    id: UUID.new().value,
    discordId: "987654321",
    discordUserName: COMMON_DISCORD_INFO.USER_NAME,
    discordAvatar: COMMON_DISCORD_INFO.AVATAR,
    faculty: null,
    department: null,
    createdAt: new Date()
  } satisfies typeof user.$inferInsert;
};
