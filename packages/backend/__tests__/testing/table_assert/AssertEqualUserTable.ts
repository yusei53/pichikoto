import { expect } from "vitest";
import type * as schema from "../../../database/schema";
import type { User } from "../../../src/domain/User";

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
    id: expectedUser.userID.value.value,
    discordId: expectedUser.discordID.getValue(),
    discordUserName: expectedUser.discordUserName,
    discordAvatar: expectedUser.discordAvatar,
    faculty: expectedUser.faculty?.getValue() ?? null,
    department: expectedUser.department?.getValue() ?? null,
    createdAt: expectedUser.createdAt.value
  };

  expect(actualRecord).toEqual(expectedRecord);
};
