import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  Department,
  DiscordID,
  Faculty,
  User,
  UserID
} from "../src/domain/models/User";
import type { UserRepositoryInterface } from "../src/domain/repositories/user";
import { UserRepository } from "../src/domain/repositories/user";
import { TYPES } from "../src/infrastructure/config/types";
import * as schema from "../src/infrastructure/database/schema";
import { CreatedAt } from "../src/utils/CreatedAt";
import { UUID } from "../src/utils/UUID";
import { createTestContainer } from "./setup/createTestContainer";
import { TestDbClient } from "./setup/TestDbClient";
import {
  assertUserEqualTable,
  insertUserToDatabase
} from "./table_helper/UserTableHelper";

describe("UserRepository Tests", () => {
  const discordID1 = DiscordID.from("123456789");
  const discordID2 = DiscordID.from("987654321");
  const discordUserName = "TestUserName";
  const discordDiscriminator = "1234";
  const discordAvatar =
    "https://cdn.discordapp.com/sample-avatar/123456789/000000000000000000.png";
  const faculty = Faculty.from("Test学部");
  const department = Department.from("Test学科");

  const user = User.reconstruct(
    UserID.from(UUID.new().value),
    discordID1,
    discordUserName,
    discordDiscriminator,
    discordAvatar,
    faculty,
    department,
    CreatedAt.from(new Date())
  );

  const userWithoutFacultyAndDepartment = User.reconstruct(
    UserID.from(UUID.new().value),
    discordID2,
    discordUserName,
    discordDiscriminator,
    discordAvatar,
    null,
    null,
    CreatedAt.from(new Date())
  );

  describe("findBy", () => {
    beforeEach(async () => {
      await insertUserToDatabase(user);
      await insertUserToDatabase(userWithoutFacultyAndDepartment);
    });

    afterEach(async () => {
      const dbClient = new TestDbClient();
      const db = dbClient.getDb();
      await db.delete(schema.user);
    });

    it("存在するユーザーを取得できること", async () => {
      // arrange
      const expected = user;
      const userRepository = getUserRepository();

      // act
      const actual = await userRepository.findBy(user.discordID);

      // assert
      assertUserEqualTable(actual, expected);
    });

    it("存在しないユーザーの場合はnullを返すこと", async () => {
      // arrange
      const nonExistentDiscordID = DiscordID.from("999999999");
      const userRepository = getUserRepository();

      // act
      const actual = await userRepository.findBy(nonExistentDiscordID);

      // assert
      expect(actual).toBeNull();
    });

    it("学部・学科がnullのユーザーを取得できること", async () => {
      // arrange
      const expected = userWithoutFacultyAndDepartment;
      const userRepository = getUserRepository();

      // act
      const actual = await userRepository.findBy(
        userWithoutFacultyAndDepartment.discordID
      );

      // assert
      assertUserEqualTable(actual, expected);
    });
  });

  describe("save", () => {
    afterEach(async () => {
      const dbClient = new TestDbClient();
      const db = dbClient.getDb();
      await db.delete(schema.user);
    });

    it("ユーザーを保存できること", async () => {
      // arrange
      const expected = user;
      const userRepository = getUserRepository();

      // act
      await userRepository.save(user);

      // assert
      const actual = await userRepository.findBy(user.discordID);
      assertUserEqualTable(actual, expected);
    });

    it("学部・学科がnullのユーザーを保存できること", async () => {
      // arrange
      const expected = userWithoutFacultyAndDepartment;
      const userRepository = getUserRepository();

      // act
      await userRepository.save(userWithoutFacultyAndDepartment);

      // assert
      const actual = await userRepository.findBy(
        userWithoutFacultyAndDepartment.discordID
      );
      assertUserEqualTable(actual, expected);
    });
  });
});

const getUserRepository = (): UserRepositoryInterface => {
  const dbClient = new TestDbClient();
  const container = createTestContainer(dbClient, (c) => {
    c.bind<UserRepositoryInterface>(TYPES.UserRepository)
      .to(UserRepository)
      .inRequestScope();
  });
  return container.get<UserRepositoryInterface>(TYPES.UserRepository);
};
