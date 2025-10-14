import { afterEach, describe, expect, it } from "vitest";
import * as schema from "../../../database/schema";
import { DiscordUserID, User } from "../../../src/domain/user/User";
import { UserRepository } from "../../../src/infrastructure/repositories/UserRepository";
import { assertEqualUserTable } from "../../testing/table_assert/AssertEqualUserTable";
import {
  createUserTableFixture,
  createUserTableFixtureWithNullGlobalName
} from "../../testing/table_fixture/UserTableFixture";
import { getTypedSingleRecord } from "../../testing/utils/DatabaseAssertHelpers";
import {
  deleteFromDatabase,
  insertToDatabase
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
        DiscordUserID.from(user2.discordUserId),
        user2.discordUserName,
        user2.discordGlobalName,
        user2.discordAvatar
      );

      // act
      const actual = await userRepository.findBy(user.discordUserID);

      // assert
      expect(actual).toEqual(user);
    });

    it("存在しないユーザーの場合はnullを返すこと", async () => {
      // arrange
      const nonExistentDiscordID = DiscordUserID.from("000000000");

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
        DiscordUserID.from(userRecord.discordUserId),
        userRecord.discordUserName,
        userRecord.discordGlobalName,
        userRecord.discordAvatar
      );

      // act
      await userRepository.save(user);

      // assert
      const actualRecord = await getTypedSingleRecord(schema.user);
      assertEqualUserTable(user, actualRecord!);
    });

    it("discordGlobalNameがnullのユーザーを保存できること", async () => {
      // arrange
      const userRecord = createUserTableFixtureWithNullGlobalName();
      const user = User.reconstruct(
        DiscordUserID.from(userRecord.discordUserId),
        userRecord.discordUserName,
        userRecord.discordGlobalName,
        userRecord.discordAvatar
      );

      // act
      await userRepository.save(user);

      // assert
      const actualRecord = await getTypedSingleRecord(schema.user);
      assertEqualUserTable(user, actualRecord!);
    });
  });
});
