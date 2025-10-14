import { expect } from "vitest";
import type * as schema from "../../../database/schema";
import type { DiscordTokens } from "../../../src/domain/discord-tokens/DiscordTokens";

/**
 * データベースのdiscordTokensテーブルと引数で渡されたDiscordTokensドメインオブジェクトが等しいことをアサート
 * @param expectedDiscordTokens 期待されるDiscordTokensドメインオブジェクト
 * @param actualRecord selectOneFromDatabaseから返される単一レコード
 */
export const assertEqualDiscordTokensTable = (
  expectedDiscordTokens: DiscordTokens,
  actualRecord: typeof schema.discordTokens.$inferSelect
): void => {
  const expectedRecord = {
    discordUserId: expectedDiscordTokens.discordUserId.value,
    accessToken: expectedDiscordTokens.accessToken.value,
    refreshToken: expectedDiscordTokens.refreshToken.value,
    expiresAt: expectedDiscordTokens.expiresAt.value,
    scope: expectedDiscordTokens.scope,
    tokenType: expectedDiscordTokens.tokenType,
    createdAt: actualRecord.createdAt
  };

  expect(actualRecord).toEqual(expectedRecord);
};
