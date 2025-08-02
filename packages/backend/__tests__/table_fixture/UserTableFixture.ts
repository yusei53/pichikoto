import type { user } from "../../src/infrastructure/database/schema";
import { UUID } from "../../src/utils/UUID";

/**
 * テスト用のDiscord情報
 */
export const COMMON_DISCORD_INFO = {
  USER_NAME: "TestUserName",
  DISCRIMINATOR: "1234",
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
    discordDiscriminator: COMMON_DISCORD_INFO.DISCRIMINATOR,
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
    discordDiscriminator: COMMON_DISCORD_INFO.DISCRIMINATOR,
    discordAvatar: COMMON_DISCORD_INFO.AVATAR,
    faculty: null,
    department: null,
    createdAt: new Date()
  } satisfies typeof user.$inferInsert;
};
