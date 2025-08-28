import { expect } from "vitest";
import type { UserAuth } from "../../../src/domain/UserAuth";
import type * as schema from "../../../src/infrastructure/database/schema";

/**
 * データベースのdiscordTokensテーブルと引数で渡されたUserAuthドメインオブジェクトが等しいことをアサート
 * @param expectedUserAuth 期待されるUserAuthドメインオブジェクト
 * @param actualRecord selectOneFromDatabaseから返される単一レコード
 */
export const assertEqualUserAuthTable = (
  expectedUserAuth: UserAuth,
  actualRecord: typeof schema.discordTokens.$inferSelect
): void => {
  const expectedRecord = {
    userId: expectedUserAuth.userId.value.value,
    accessToken: expectedUserAuth.accessToken.value,
    refreshToken: expectedUserAuth.refreshToken.value,
    expiresAt: expectedUserAuth.expiresAt.value,
    scope: expectedUserAuth.scope,
    tokenType: expectedUserAuth.tokenType,
    createdAt: expectedUserAuth.createdAt.value
  };

  expect(actualRecord).toEqual(expectedRecord);
};
