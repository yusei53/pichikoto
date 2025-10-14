import type { discordTokens } from "../../../database/schema";

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
 * DiscordTokensテーブルのfixture
 */
export const createDiscordTokensTableFixture = (userID: string) => {
  const expiresAt = new Date(Date.now() + 3600 * 1000); // 1時間後

  return {
    discordUserId: userID,
    accessToken: generateUniqueToken("test_access_token"),
    refreshToken: generateUniqueToken("test_refresh_token"),
    expiresAt,
    scope: COMMON_TOKEN_INFO.SCOPE,
    tokenType: COMMON_TOKEN_INFO.TOKEN_TYPE,
    createdAt: new Date()
  } satisfies typeof discordTokens.$inferInsert;
};

/**
 * 期限切れのDiscordTokensのfixture
 */
export const createExpiredDiscordTokensTableFixture = (userID: string) => {
  const expiresAt = new Date(Date.now() - 3600 * 1000); // 1時間前（期限切れ）

  return {
    discordUserId: userID,
    accessToken: generateUniqueToken("test_access_token"),
    refreshToken: generateUniqueToken("test_refresh_token"),
    expiresAt,
    scope: COMMON_TOKEN_INFO.SCOPE,
    tokenType: COMMON_TOKEN_INFO.TOKEN_TYPE,
    createdAt: new Date()
  } satisfies typeof discordTokens.$inferInsert;
};
