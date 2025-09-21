import { afterEach, describe, expect, it } from "vitest";
import * as schema from "../../../database/schema";
import { DiscordID, User, UserID } from "../../../src/domain/user/User";
import { UserRepository } from "../../../src/infrastructure/repositories/UserRepository";
import { assertEqualUserTable } from "../../testing/table_assert/AssertEqualUserTable";
import { createUserTableFixture } from "../../testing/table_fixture/UserTableFixture";
import {
  deleteFromDatabase,
  insertToDatabase,
  selectOneFromDatabase
} from "../../testing/utils/GenericTableHelper";

describe("UserRepository Tests", () => {
  const userRepository = new UserRepository();

  describe("findBy", () => {
    const setupUsers = async () => {
      const user2 = createUserTableFixture();
      await insertToDatabase(schema.user, user2);

      return { user2 };
    };

    afterEach(async () => {
      await deleteFromDatabase(schema.user);
    });

    it("存在するユーザーを取得できること", async () => {
      // arrange
      const { user2 } = await setupUsers();
      const user = User.reconstruct(
        UserID.from(user2.id),
        DiscordID.from(user2.discordId),
        user2.discordUserName,
        user2.discordAvatar
      );

      // act
      const actual = await userRepository.findBy(user.discordID);

      // assert
      expect(actual).toEqual(user);
    });

    it("存在しないユーザーの場合はnullを返すこと", async () => {
      // arrange
      const nonExistentDiscordID = DiscordID.from("000000000");

      // act
      const actual = await userRepository.findBy(nonExistentDiscordID);

      // assert
      expect(actual).toBeNull();
    });
  });

  describe("save", () => {
    afterEach(async () => {
      await deleteFromDatabase(schema.user);
    });

    it("ユーザーを保存できること", async () => {
      // arrange
      const userRecord = createUserTableFixture();
      const user = User.reconstruct(
        UserID.from(userRecord.id),
        DiscordID.from(userRecord.discordId),
        userRecord.discordUserName,
        userRecord.discordAvatar
      );

      // act
      await userRepository.save(user);

      // assert
      const actualRecord = (await selectOneFromDatabase(
        schema.user
      )) as typeof schema.user.$inferSelect;
      assertEqualUserTable(user, actualRecord);
    });
  });
});
