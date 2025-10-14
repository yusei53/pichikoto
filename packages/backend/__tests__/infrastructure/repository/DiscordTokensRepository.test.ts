import { afterEach, describe, expect, it } from "vitest";
import * as schema from "../../../database/schema";
import {
  AccessToken,
  DiscordTokens,
  ExpiresAt,
  RefreshToken
} from "../../../src/domain/discord-tokens/DiscordTokens";
import { DiscordUserID } from "../../../src/domain/user/User";
import { DiscordTokensRepository } from "../../../src/infrastructure/repositories/DiscordTokensRepository";
import { assertEqualDiscordTokensTable } from "../../testing/table_assert/AssertEqualDiscordTokensTable";
import {
  createDiscordTokensTableFixture,
  createExpiredDiscordTokensTableFixture
} from "../../testing/table_fixture/DiscordTokensTableFixture";
import { createUserTableFixture } from "../../testing/table_fixture/UserTableFixture";
import { getTypedSingleRecord } from "../../testing/utils/DatabaseAssertHelpers";
import {
  deleteFromDatabase,
  insertToDatabase
} from "../../testing/utils/GenericTableHelper";

describe("DiscordTokensRepository Tests", () => {
  const discordTokensRepository = new DiscordTokensRepository();

  describe("findBy", () => {
    const setupDiscordTokens = async () => {
      const user1 = createUserTableFixture();
      await insertToDatabase(schema.user, user1);

      const user2 = createUserTableFixture();
      await insertToDatabase(schema.user, user2);

      const discordTokens1 = createDiscordTokensTableFixture(
        user1.discordUserId
      );
      await insertToDatabase(schema.discordTokens, discordTokens1);

      const discordTokens2 = createExpiredDiscordTokensTableFixture(
        user2.discordUserId
      );
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
        DiscordUserID.from(discordTokens1.discordUserId),
        AccessToken.from(discordTokens1.accessToken),
        RefreshToken.from(discordTokens1.refreshToken),
        ExpiresAt.from(discordTokens1.expiresAt),
        discordTokens1.scope,
        discordTokens1.tokenType
      );

      // act
      const actual = await discordTokensRepository.findBy(
        discordTokens.discordUserId
      );

      // assert
      expect(actual).toEqual(discordTokens);
    });

    it("期限切れのDiscordトークン情報を取得できること", async () => {
      // arrange
      const { discordTokens2 } = await setupDiscordTokens();
      const discordTokens = DiscordTokens.reconstruct(
        DiscordUserID.from(discordTokens2.discordUserId),
        AccessToken.from(discordTokens2.accessToken),
        RefreshToken.from(discordTokens2.refreshToken),
        ExpiresAt.from(discordTokens2.expiresAt),
        discordTokens2.scope,
        discordTokens2.tokenType
      );

      // act
      const actual = await discordTokensRepository.findBy(
        discordTokens.discordUserId
      );

      // assert
      expect(actual).toEqual(discordTokens);
    });

    it("存在しないユーザーIDの場合はnullを返すこと", async () => {
      // arrange
      const nonExistentUserID = DiscordUserID.new();

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

      const discordTokensRecord = createDiscordTokensTableFixture(
        user.discordUserId
      );
      const discordTokens = DiscordTokens.reconstruct(
        DiscordUserID.from(discordTokensRecord.discordUserId),
        AccessToken.from(discordTokensRecord.accessToken),
        RefreshToken.from(discordTokensRecord.refreshToken),
        ExpiresAt.from(discordTokensRecord.expiresAt),
        discordTokensRecord.scope,
        discordTokensRecord.tokenType
      );

      // act
      await discordTokensRepository.save(discordTokens);

      // assert
      const actualRecord = await getTypedSingleRecord(schema.discordTokens);
      assertEqualDiscordTokensTable(discordTokens, actualRecord!);
    });
  });
});
