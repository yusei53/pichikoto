import type { discordTokens } from "../../../src/infrastructure/database/schema";

/**
 * ユニークなトークンを生成するヘルパー関数
 */
const generateUniqueToken = (prefix: string): string => {
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString();
  return `${prefix}_${timestamp}_${randomSuffix}`;
};

export const COMMON_TOKEN_INFO = {
  SCOPE: "read write",
  TOKEN_TYPE: "Bearer"
} as const;

/**
 * UserAuthテーブルのfixture
 */
export const createUserAuthTableFixture = (userID: string) => {
  const expiresAt = new Date(Date.now() + 3600 * 1000); // 1時間後

  return {
    userId: userID,
    accessToken: generateUniqueToken("test_access_token"),
    refreshToken: generateUniqueToken("test_refresh_token"),
    expiresAt,
    scope: COMMON_TOKEN_INFO.SCOPE,
    tokenType: COMMON_TOKEN_INFO.TOKEN_TYPE,
    createdAt: new Date()
  } satisfies typeof discordTokens.$inferInsert;
};

/**
 * 期限切れのUserAuthのfixture
 */
export const createExpiredUserAuthTableFixture = (userID: string) => {
  const expiresAt = new Date(Date.now() - 3600 * 1000); // 1時間前（期限切れ）

  return {
    userId: userID,
    accessToken: generateUniqueToken("test_access_token"),
    refreshToken: generateUniqueToken("test_refresh_token"),
    expiresAt,
    scope: COMMON_TOKEN_INFO.SCOPE,
    tokenType: COMMON_TOKEN_INFO.TOKEN_TYPE,
    createdAt: new Date()
  } satisfies typeof discordTokens.$inferInsert;
};
