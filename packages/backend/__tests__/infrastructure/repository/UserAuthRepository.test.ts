import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { UserID } from "../../../src/domain/User";
import {
  AccessToken,
  ExpiresAt,
  RefreshToken,
  UserAuth
} from "../../../src/domain/UserAuth";
import * as schema from "../../../src/infrastructure/database/schema";
import type { UserAuthRepositoryInterface } from "../../../src/infrastructure/repositories/UserAuthRepository";
import { UserAuthRepository } from "../../../src/infrastructure/repositories/UserAuthRepository";
import { CreatedAt } from "../../../src/utils/CreatedAt";
import { TestDbClient } from "../../testing/setup/TestDbClient";
import { assertEqualUserAuthTable } from "../../testing/table_assert/AssertEqualUserAuthTable";
import {
  createExpiredUserAuthTableFixture,
  createUserAuthTableFixture
} from "../../testing/table_fixture/UserAuthTableFixture";
import {
  createUserTableFixture,
  createUserTableFixtureWithoutFacultyAndDepartment
} from "../../testing/table_fixture/UserTableFixture";
import {
  deleteFromDatabase,
  insertToDatabase,
  selectOneFromDatabase
} from "../../testing/utils/GenericTableHelper";

describe("UserAuthRepository Tests", () => {
  let userAuthRepository: UserAuthRepositoryInterface;

  beforeEach(() => {
    userAuthRepository = getUserAuthRepository();
  });

  describe("findBy", () => {
    const setupUserAuths = async () => {
      const user1 = createUserTableFixture();
      await insertToDatabase(schema.user, user1);

      const user2 = createUserTableFixtureWithoutFacultyAndDepartment();
      await insertToDatabase(schema.user, user2);

      // userIdを使ってuserAuthレコードを作成
      const userAuth1 = createUserAuthTableFixture(user1.id);
      await insertToDatabase(schema.userAuth, userAuth1);

      const userAuth2 = createExpiredUserAuthTableFixture(user2.id);
      await insertToDatabase(schema.userAuth, userAuth2);

      return { userAuth1, userAuth2 };
    };

    afterEach(async () => {
      // 外部キー制約があるため、user_authを先に削除してからuserを削除
      await deleteFromDatabase(schema.userAuth);
      await deleteFromDatabase(schema.user);
    });

    it("存在するユーザー認証情報を取得できること", async () => {
      // arrange
      const { userAuth1 } = await setupUserAuths();
      const userAuth = UserAuth.reconstruct(
        UserID.from(userAuth1.userId),
        AccessToken.from(userAuth1.accessToken),
        RefreshToken.from(userAuth1.refreshToken),
        ExpiresAt.from(userAuth1.expiresAt),
        userAuth1.scope,
        userAuth1.tokenType,
        CreatedAt.from(userAuth1.createdAt)
      );

      // act
      const actual = await userAuthRepository.findBy(userAuth.userId);

      // assert
      expect(actual).toEqual(userAuth);
    });

    it("期限切れのユーザー認証情報を取得できること", async () => {
      // arrange
      const { userAuth2 } = await setupUserAuths();
      const userAuth = UserAuth.reconstruct(
        UserID.from(userAuth2.userId),
        AccessToken.from(userAuth2.accessToken),
        RefreshToken.from(userAuth2.refreshToken),
        ExpiresAt.from(userAuth2.expiresAt),
        userAuth2.scope,
        userAuth2.tokenType,
        CreatedAt.from(userAuth2.createdAt)
      );

      // act
      const actual = await userAuthRepository.findBy(userAuth.userId);

      // assert
      expect(actual).toEqual(userAuth);
    });

    it("存在しないユーザーIDの場合はnullを返すこと", async () => {
      // arrange
      const nonExistentUserID = UserID.new();

      // act
      const actual = await userAuthRepository.findBy(nonExistentUserID);

      // assert
      expect(actual).toBeNull();
    });
  });

  describe("save", () => {
    afterEach(async () => {
      await deleteFromDatabase(schema.userAuth);
      await deleteFromDatabase(schema.user);
    });

    it("ユーザー認証情報を保存できること", async () => {
      // arrange
      // まずuserレコードを作成
      const user = createUserTableFixture();
      await insertToDatabase(schema.user, user);

      const userAuthRecord = createUserAuthTableFixture(user.id);
      const userAuth = UserAuth.reconstruct(
        UserID.from(userAuthRecord.userId),
        AccessToken.from(userAuthRecord.accessToken),
        RefreshToken.from(userAuthRecord.refreshToken),
        ExpiresAt.from(userAuthRecord.expiresAt),
        userAuthRecord.scope,
        userAuthRecord.tokenType,
        CreatedAt.from(userAuthRecord.createdAt)
      );

      // act
      await userAuthRepository.save(userAuth);

      // assert
      const actualRecord = (await selectOneFromDatabase(
        schema.userAuth
      )) as typeof schema.userAuth.$inferSelect;
      assertEqualUserAuthTable(userAuth, actualRecord);
    });
  });
});

const getUserAuthRepository = (): UserAuthRepositoryInterface => {
  const dbClient = new TestDbClient();
  return new UserAuthRepository(dbClient);
};
