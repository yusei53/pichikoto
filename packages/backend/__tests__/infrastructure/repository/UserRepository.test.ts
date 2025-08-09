import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  Department,
  DiscordID,
  Faculty,
  User,
  UserID
} from "../../../src/domain/models/User";
import type { UserRepositoryInterface } from "../../../src/domain/repositories/user";
import { UserRepository } from "../../../src/domain/repositories/user";
import * as schema from "../../../src/infrastructure/database/schema";
import { CreatedAt } from "../../../src/utils/CreatedAt";
import { TestDbClient } from "../../setup/TestDbClient";
import {
  createUserTableFixture,
  createUserTableFixtureWithoutFacultyAndDepartment
} from "../../table_fixture/UserTableFixture";
import {
  deleteFromDatabase,
  insertToDatabase
} from "../../utils/GenericTableHelper";

describe("UserRepository Tests", () => {
  let userRepository: UserRepositoryInterface;

  beforeEach(() => {
    userRepository = getUserRepository();
  });

  describe("findBy", () => {
    const setupUsers = async () => {
      const user1 = createUserTableFixture();
      await insertToDatabase(schema.user, user1);

      const user2 = createUserTableFixtureWithoutFacultyAndDepartment();
      await insertToDatabase(schema.user, user2);

      return { user1, user2 };
    };

    afterEach(async () => {
      await deleteFromDatabase(schema.user);
    });

    it("存在するユーザーを取得できること", async () => {
      // arrange
      const { user1 } = await setupUsers();
      const user = User.reconstruct(
        UserID.from(user1.id),
        DiscordID.from(user1.discordId),
        user1.discordUserName,
        user1.discordDiscriminator,
        user1.discordAvatar,
        Faculty.from(user1.faculty),
        Department.from(user1.department),
        CreatedAt.from(user1.createdAt)
      );

      // act
      const actual = await userRepository.findBy(user.discordID);

      // assert
      expect(actual).toEqual(user);
    });

    it("学部・学科がnullのユーザーを取得できること", async () => {
      // arrange
      const { user2 } = await setupUsers();
      const user = User.reconstruct(
        UserID.from(user2.id),
        DiscordID.from(user2.discordId),
        user2.discordUserName,
        user2.discordDiscriminator,
        user2.discordAvatar,
        user2.faculty,
        user2.department,
        CreatedAt.from(user2.createdAt)
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
        userRecord.discordDiscriminator,
        userRecord.discordAvatar,
        userRecord.faculty ? Faculty.from(userRecord.faculty) : null,
        userRecord.department ? Department.from(userRecord.department) : null,
        CreatedAt.from(userRecord.createdAt)
      );

      // act
      await userRepository.save(user);

      // assert
      const actual = await userRepository.findBy(user.discordID);
      expect(actual).toEqual(user);
    });

    it("学部・学科がnullのユーザーを保存できること", async () => {
      // arrange
      const userRecord = createUserTableFixtureWithoutFacultyAndDepartment();
      const user = User.reconstruct(
        UserID.from(userRecord.id),
        DiscordID.from(userRecord.discordId),
        userRecord.discordUserName,
        userRecord.discordDiscriminator,
        userRecord.discordAvatar,
        userRecord.faculty ? Faculty.from(userRecord.faculty) : null,
        userRecord.department ? Department.from(userRecord.department) : null,
        CreatedAt.from(userRecord.createdAt)
      );

      // act
      await userRepository.save(user);

      // assert
      const actual = await userRepository.findBy(user.discordID);
      expect(actual).toEqual(user);
    });
  });
});

const getUserRepository = (): UserRepositoryInterface => {
  const dbClient = new TestDbClient();
  return new UserRepository(dbClient);
};
