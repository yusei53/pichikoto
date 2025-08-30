import { describe, expect, it, vi } from "vitest";
import {
  AccessToken,
  DiscordTokens,
  ExpiresAt,
  RefreshToken
} from "../../src/domain/DiscordTokens";
import { UserID } from "../../src/domain/User";
import { CreatedAt } from "../../src/utils/CreatedAt";

const MOCK_UUID = "00000000-0000-0000-0000-000000";
const MOCK_NOW = new Date("2025-01-01T00:00:00.000Z");

// Mock system time to ensure consistent Date creation
vi.setSystemTime(MOCK_NOW);

vi.mock("../../src/domain/models/User", () => {
  return {
    UserID: {
      new: vi.fn(() => ({
        value: MOCK_UUID
      }))
    }
  };
});

describe("DiscordTokensDomainTest", () => {
  const userId = UserID.new();
  const accessTokenValue = "test_access_token";
  const refreshTokenValue = "test_refresh_token";
  const expiresIn = 3600;
  const scope = "read write";
  const tokenType = "Bearer";

  describe("DiscordTokensドメインの作成", () => {
    it("DiscordTokensを作成できること", () => {
      // arrange
      const expected = DiscordTokens.reconstruct(
        userId,
        AccessToken.from(accessTokenValue),
        RefreshToken.from(refreshTokenValue),
        ExpiresAt.new(expiresIn),
        scope,
        tokenType,
        CreatedAt.new()
      );

      // act
      const actual = DiscordTokens.create(
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
