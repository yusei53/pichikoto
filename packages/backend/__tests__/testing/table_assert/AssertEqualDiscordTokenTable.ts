import { expect } from "vitest";
import type { DiscordToken } from "../../../src/domain/DiscordToken";
import type * as schema from "../../../src/infrastructure/database/schema";

/**
 * データベースのdiscordTokensテーブルと引数で渡されたDiscordTokenドメインオブジェクトが等しいことをアサート
 * @param expectedDiscordToken 期待されるDiscordTokenドメインオブジェクト
 * @param actualRecord selectOneFromDatabaseから返される単一レコード
 */
export const assertEqualDiscordTokenTable = (
  expectedDiscordToken: DiscordToken,
  actualRecord: typeof schema.discordTokens.$inferSelect
): void => {
  const expectedRecord = {
    userId: expectedDiscordToken.userId.value.value,
    accessToken: expectedDiscordToken.accessToken.value,
    refreshToken: expectedDiscordToken.refreshToken.value,
    expiredAt: expectedDiscordToken.expiredAt.value,
    scope: expectedDiscordToken.scope,
    tokenType: expectedDiscordToken.tokenType,
    createdAt: expectedDiscordToken.createdAt.value
  };

  // expiredAtとupdatedAtは自動生成されるため、存在確認のみ
  expect(actualRecord.expiredAt).toBeInstanceOf(Date);
  expect(actualRecord.updatedAt).toBeInstanceOf(Date);

  // 主要なフィールドの比較
  expect(actualRecord.userId).toEqual(expectedRecord.userId);
  expect(actualRecord.accessToken).toEqual(expectedRecord.accessToken);
  expect(actualRecord.refreshToken).toEqual(expectedRecord.refreshToken);
  expect(actualRecord.scope).toEqual(expectedRecord.scope);
  expect(actualRecord.tokenType).toEqual(expectedRecord.tokenType);
  expect(actualRecord.createdAt).toEqual(expectedRecord.createdAt);
};
