import { expect } from "vitest";
import type { User } from "../../src/domain/models/User";
import * as schema from "../../src/infrastructure/database/schema";
import { TestDbClient } from "../setup/TestDbClient";

/**
 * ユーザーをデータベースに挿入する
 */
export const insertUserToDatabase = async (user: User): Promise<void> => {
  const dbClient = new TestDbClient();
  const db = dbClient.getDb();
  await db.insert(schema.user).values({
    id: user.userID.value.value,
    discordId: user.discordID.getValue(),
    discordUserName: user.discordUserName,
    discordDiscriminator: user.discordDiscriminator,
    discordAvatar: user.discordAvatar,
    faculty: user.faculty?.getValue() ?? null,
    department: user.department?.getValue() ?? null,
    createdAt: user.createdAt.value
  });
};

/**
 * createdAtを除いてUserオブジェクトを比較するカスタムマッチャー
 */
export const assertUserEqualTable = (actual: User | null, expected: User) => {
  if (!actual) throw new Error("Expected user to exist, but got null");

  expect(actual.userID).toStrictEqual(expected.userID);
  expect(actual.discordID).toStrictEqual(expected.discordID);
  expect(actual.discordUserName).toStrictEqual(expected.discordUserName);
  expect(actual.discordDiscriminator).toStrictEqual(
    expected.discordDiscriminator
  );
  expect(actual.discordAvatar).toStrictEqual(expected.discordAvatar);
  expect(actual.faculty).toStrictEqual(expected.faculty);
  expect(actual.department).toStrictEqual(expected.department);
  expect(actual.createdAt.value).toStrictEqual(expected.createdAt.value);
};
