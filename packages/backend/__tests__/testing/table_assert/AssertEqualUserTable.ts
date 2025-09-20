import { expect } from "vitest";
import type * as schema from "../../../database/schema";
import type { User } from "@pichikoto/core/domain/user";

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
    discordId: expectedUser.discordID.value,
    discordUserName: expectedUser.discordUserName,
    discordAvatar: expectedUser.discordAvatar,
    faculty: expectedUser.faculty?.value ?? null,
    department: expectedUser.department?.value ?? null,
    createdAt: actualRecord.createdAt
  };

  expect(actualRecord).toEqual(expectedRecord);
};
