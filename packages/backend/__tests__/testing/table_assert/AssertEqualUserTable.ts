import { expect } from "vitest";
import type { User } from "../../../src/domain/models/User";
import type * as schema from "../../../src/infrastructure/database/schema";

/**
 * データベースのuserテーブルと引数で渡されたUserドメインオブジェクトが等しいことをアサート
 * @param expectedUser 期待されるUserドメインオブジェクト
 * @param actualRecord selectOneFromDatabaseから返される単一レコード
 */
export const assertEqualUserTable = async (
  expectedUser: User,
  actualRecord: typeof schema.user.$inferSelect
): Promise<void> => {
  const expectedRecord = {
    id: expectedUser.userID.value.value,
    discordId: expectedUser.discordID.getValue(),
    discordUserName: expectedUser.discordUserName,
    discordDiscriminator: expectedUser.discordDiscriminator,
    discordAvatar: expectedUser.discordAvatar,
    faculty: expectedUser.faculty?.getValue() ?? null,
    department: expectedUser.department?.getValue() ?? null,
    createdAt: expectedUser.createdAt.value
  };

  expect(actualRecord).toEqual(expectedRecord);
};
