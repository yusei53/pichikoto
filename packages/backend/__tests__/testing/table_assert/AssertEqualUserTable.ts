import { expect } from "vitest";
import type * as schema from "../../../database/schema";
import type { User } from "../../../src/domain/user/User";

/**
 * データベースのuserテーブルと引数で渡されたUserドメインオブジェクトが等しいことをアサート
 * @param expectedUser 期待されるUserドメインオブジェクト
 * @param actualRecord selectOneFromDatabaseから返される単一レコード
 */
export const assertEqualUserTable = (
  expectedUser: User,
  actualRecord: typeof schema.user.$inferSelect
): void => {
  const expectedRecord = {
    discordUserId: expectedUser.discordUserID.value,
    discordUserName: expectedUser.discordUserName,
    discordGlobalName: expectedUser.discordGlobalName,
    discordAvatar: expectedUser.discordAvatar,
    createdAt: actualRecord.createdAt
  };

  expect(actualRecord).toEqual(expectedRecord);
};
