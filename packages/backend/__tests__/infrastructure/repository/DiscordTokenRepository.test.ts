import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AccessToken,
  DiscordToken,
  ExpiredAt,
  RefreshToken
} from "../../../src/domain/DiscordToken";
import { UserID } from "../../../src/domain/User";
import * as schema from "../../../src/infrastructure/database/schema";
import type { DiscordTokenRepositoryInterface } from "../../../src/infrastructure/repositories/DiscordTokenRepository";
import { DiscordTokenRepository } from "../../../src/infrastructure/repositories/DiscordTokenRepository";
import { CreatedAt } from "../../../src/utils/CreatedAt";
import { TestDbClient } from "../../testing/setup/TestDbClient";

import { assertEqualDiscordTokenTable } from "../../testing/table_assert/AssertEqualDiscordTokenTable";
import {
  createDiscordTokenTableFixture,
  createExpiredDiscordTokenTableFixture
} from "../../testing/table_fixture/DiscordTokenTableFixture";
import {
  createUserTableFixture,
  createUserTableFixtureWithoutFacultyAndDepartment
} from "../../testing/table_fixture/UserTableFixture";
import {
  deleteFromDatabase,
  insertToDatabase,
  selectOneFromDatabase
} from "../../testing/utils/GenericTableHelper";

describe("DiscordTokenRepository Tests", () => {
  let discordTokenRepository: DiscordTokenRepositoryInterface;

  beforeEach(() => {
    discordTokenRepository = getDiscordTokenRepository();
  });

  describe("findBy", () => {
    const setupDiscordTokens = async () => {
      const user1 = createUserTableFixture();
      await insertToDatabase(schema.user, user1);

      const user2 = createUserTableFixtureWithoutFacultyAndDepartment();
      await insertToDatabase(schema.user, user2);

      // userIdを使ってdiscordTokenレコードを作成
      const discordToken1 = createDiscordTokenTableFixture(user1.id);
      await insertToDatabase(schema.discordTokens, discordToken1);

      const discordToken2 = createExpiredDiscordTokenTableFixture(user2.id);
      await insertToDatabase(schema.discordTokens, discordToken2);

      return { discordToken1, discordToken2 };
    };

    afterEach(async () => {
      // 外部キー制約があるため、discord_tokensを先に削除してからuserを削除
      await deleteFromDatabase(schema.discordTokens);
      await deleteFromDatabase(schema.user);
    });

    it("存在するユーザー認証情報を取得できること", async () => {
      // arrange
      const { discordToken1 } = await setupDiscordTokens();
      const discordToken = DiscordToken.reconstruct(
        UserID.from(discordToken1.userId),
        AccessToken.from(discordToken1.accessToken),
        RefreshToken.from(discordToken1.refreshToken),
        ExpiredAt.from(discordToken1.expiredAt),
        discordToken1.scope,
        discordToken1.tokenType,
        CreatedAt.from(discordToken1.createdAt)
      );

      // act
      const actual = await discordTokenRepository.findBy(discordToken.userId);

      // assert
      expect(actual).toEqual(discordToken);
    });

    it("期限切れのユーザー認証情報を取得できること", async () => {
      // arrange
      const { discordToken2 } = await setupDiscordTokens();
      const discordToken = DiscordToken.reconstruct(
        UserID.from(discordToken2.userId),
        AccessToken.from(discordToken2.accessToken),
        RefreshToken.from(discordToken2.refreshToken),
        ExpiredAt.from(discordToken2.expiredAt),
        discordToken2.scope,
        discordToken2.tokenType,
        CreatedAt.from(discordToken2.createdAt)
      );

      // act
      const actual = await discordTokenRepository.findBy(discordToken.userId);

      // assert
      expect(actual).toEqual(discordToken);
    });

    it("存在しないユーザーIDの場合はnullを返すこと", async () => {
      // arrange
      const nonExistentUserID = UserID.new();

      // act
      const actual = await discordTokenRepository.findBy(nonExistentUserID);

      // assert
      expect(actual).toBeNull();
    });
  });

  describe("save", () => {
    afterEach(async () => {
      await deleteFromDatabase(schema.discordTokens);
      await deleteFromDatabase(schema.user);
    });

    it("ユーザー認証情報を保存できること", async () => {
      // arrange
      // まずuserレコードを作成
      const user = createUserTableFixture();
      await insertToDatabase(schema.user, user);

      const discordTokenRecord = createDiscordTokenTableFixture(user.id);
      const discordToken = DiscordToken.reconstruct(
        UserID.from(discordTokenRecord.userId),
        AccessToken.from(discordTokenRecord.accessToken),
        RefreshToken.from(discordTokenRecord.refreshToken),
        ExpiredAt.from(discordTokenRecord.expiredAt),
        discordTokenRecord.scope,
        discordTokenRecord.tokenType,
        CreatedAt.from(discordTokenRecord.createdAt)
      );

      // act
      await discordTokenRepository.save(discordToken);

      // assert
      const actualRecord = (await selectOneFromDatabase(
        schema.discordTokens
      )) as typeof schema.discordTokens.$inferSelect;
      assertEqualDiscordTokenTable(discordToken, actualRecord);
    });
  });
});

const getDiscordTokenRepository = (): DiscordTokenRepositoryInterface => {
  const dbClient = new TestDbClient();
  return new DiscordTokenRepository(dbClient);
};

