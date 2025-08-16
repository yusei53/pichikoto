import { describe, expect, it, vi } from "vitest";
import {
  AccessToken,
  DiscordToken,
  ExpiredAt,
  RefreshToken
} from "../../src/domain/DiscordToken";
import { UserID } from "../../src/domain/User";
import { CreatedAt } from "../../src/utils/CreatedAt";

const MOCK_UUID = "00000000-0000-0000-0000-000000";
const MOCK_NOW = new Date("2025-01-01T00:00:00.000Z").getTime();

vi.spyOn(Date, "now").mockReturnValue(MOCK_NOW);

vi.mock("../../src/domain/models/User", () => {
  return {
    UserID: {
      new: vi.fn(() => ({
        value: MOCK_UUID
      }))
    }
  };
});

describe("DiscordTokenDomainTest", () => {
  const userId = UserID.new();
  const accessTokenValue = "test_access_token";
  const refreshTokenValue = "test_refresh_token";
  const expiresIn = 3600;
  const scope = "read write";
  const tokenType = "Bearer";

  describe("DiscordTokenドメインの作成", () => {
    it("DiscordTokenを作成できること", () => {
      // arrange
      const expected = DiscordToken.reconstruct(
        userId,
        AccessToken.from(accessTokenValue),
        RefreshToken.from(refreshTokenValue),
        ExpiredAt.new(expiresIn),
        scope,
        tokenType,
        CreatedAt.new()
      );

      // act
      const actual = DiscordToken.create(
        userId,
        accessTokenValue,
        refreshTokenValue,
        expiresIn,
        scope,
        tokenType
      );

      // assert
      expect(actual).toStrictEqual(expected);
    });
  });
});
