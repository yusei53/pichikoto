import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AccessToken,
  DiscordTokens,
  ExpiresAt,
  RefreshToken
} from "../../../src/domain/DiscordTokens";
import { UserID } from "../../../src/domain/User";
import * as schema from "../../../src/infrastructure/database/schema";
import type { DiscordTokensRepositoryInterface } from "../../../src/infrastructure/repositories/DiscordTokensRepository";
import { DiscordTokensRepository } from "../../../src/infrastructure/repositories/DiscordTokensRepository";
import { CreatedAt } from "../../../src/utils/CreatedAt";
import { TestDbClient } from "../../testing/setup/TestDbClient";
import { assertEqualDiscordTokensTable } from "../../testing/table_assert/AssertEqualDiscordTokensTable";
import {
  createDiscordTokensTableFixture,
  createExpiredDiscordTokensTableFixture
} from "../../testing/table_fixture/DiscordTokensTableFixture";
import {
  createUserTableFixture,
  createUserTableFixtureWithoutFacultyAndDepartment
} from "../../testing/table_fixture/UserTableFixture";
import {
  deleteFromDatabase,
  insertToDatabase,
  selectOneFromDatabase
} from "../../testing/utils/GenericTableHelper";

describe("DiscordTokensRepository Tests", () => {
  let discordTokensRepository: DiscordTokensRepositoryInterface;

  beforeEach(() => {
    discordTokensRepository = getDiscordTokensRepository();
  });

  describe("findBy", () => {
    const setupDiscordTokens = async () => {
      const user1 = createUserTableFixture();
      await insertToDatabase(schema.user, user1);

      const user2 = createUserTableFixtureWithoutFacultyAndDepartment();
      await insertToDatabase(schema.user, user2);

      // userIdを使ってdiscordTokensレコードを作成
      const discordTokens1 = createDiscordTokensTableFixture(user1.id);
      await insertToDatabase(schema.discordTokens, discordTokens1);

      const discordTokens2 = createExpiredDiscordTokensTableFixture(user2.id);
      await insertToDatabase(schema.discordTokens, discordTokens2);

      return { discordTokens1, discordTokens2 };
    };

    afterEach(async () => {
      // 外部キー制約があるため、discord_tokensを先に削除してからuserを削除
      await deleteFromDatabase(schema.discordTokens);
      await deleteFromDatabase(schema.user);
    });

    it("存在するDiscordトークン情報を取得できること", async () => {
      // arrange
      const { discordTokens1 } = await setupDiscordTokens();
      const discordTokens = DiscordTokens.reconstruct(
        UserID.from(discordTokens1.userId),
        AccessToken.from(discordTokens1.accessToken),
        RefreshToken.from(discordTokens1.refreshToken),
        ExpiresAt.from(discordTokens1.expiresAt),
        discordTokens1.scope,
        discordTokens1.tokenType,
        CreatedAt.from(discordTokens1.createdAt)
      );

      // act
      const actual = await discordTokensRepository.findBy(discordTokens.userId);

      // assert
      expect(actual).toEqual(discordTokens);
    });

    it("期限切れのDiscordトークン情報を取得できること", async () => {
      // arrange
      const { discordTokens2 } = await setupDiscordTokens();
      const discordTokens = DiscordTokens.reconstruct(
        UserID.from(discordTokens2.userId),
        AccessToken.from(discordTokens2.accessToken),
        RefreshToken.from(discordTokens2.refreshToken),
        ExpiresAt.from(discordTokens2.expiresAt),
        discordTokens2.scope,
        discordTokens2.tokenType,
        CreatedAt.from(discordTokens2.createdAt)
      );

      // act
      const actual = await discordTokensRepository.findBy(discordTokens.userId);

      // assert
      expect(actual).toEqual(discordTokens);
    });

    it("存在しないユーザーIDの場合はnullを返すこと", async () => {
      // arrange
      const nonExistentUserID = UserID.new();

      // act
      const actual = await discordTokensRepository.findBy(nonExistentUserID);

      // assert
      expect(actual).toBeNull();
    });
  });

  describe("save", () => {
    afterEach(async () => {
      await deleteFromDatabase(schema.discordTokens);
      await deleteFromDatabase(schema.user);
    });

    it("Discordトークン情報を保存できること", async () => {
      // arrange
      // まずuserレコードを作成
      const user = createUserTableFixture();
      await insertToDatabase(schema.user, user);

      const discordTokensRecord = createDiscordTokensTableFixture(user.id);
      const discordTokens = DiscordTokens.reconstruct(
        UserID.from(discordTokensRecord.userId),
        AccessToken.from(discordTokensRecord.accessToken),
        RefreshToken.from(discordTokensRecord.refreshToken),
        ExpiresAt.from(discordTokensRecord.expiresAt),
        discordTokensRecord.scope,
        discordTokensRecord.tokenType,
        CreatedAt.from(discordTokensRecord.createdAt)
      );

      // act
      await discordTokensRepository.save(discordTokens);

      // assert
      const actualRecord = (await selectOneFromDatabase(
        schema.discordTokens
      )) as typeof schema.discordTokens.$inferSelect;
      assertEqualDiscordTokensTable(discordTokens, actualRecord);
    });
  });
});

const getDiscordTokensRepository = (): DiscordTokensRepositoryInterface => {
  const dbClient = new TestDbClient();
  return new DiscordTokensRepository(dbClient);
};
