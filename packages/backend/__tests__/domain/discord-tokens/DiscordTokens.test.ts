import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AccessToken,
  DiscordTokens,
  ExpiresAt,
  RefreshToken
} from "../../../src/domain/discord-tokens/DiscordTokens";
import { UserID } from "../../../src/domain/user/User";

const MOCK_UUID = "00000000-0000-0000-0000-000000";
const MOCK_TIMESTAMP = 1728734572000; // 固定のタイムスタンプ (2024-10-12T11:02:52.000Z)

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

  beforeEach(() => {
    // Date.now()を固定値でモック
    vi.spyOn(Date, "now").mockReturnValue(MOCK_TIMESTAMP);
  });

  afterEach(() => {
    // モックをリセット
    vi.restoreAllMocks();
  });

  describe("DiscordTokensドメインの作成", () => {
    it("DiscordTokensを作成できること", () => {
      // arrange
      const expected = DiscordTokens.reconstruct(
        userId,
        AccessToken.from(accessTokenValue),
        RefreshToken.from(refreshTokenValue),
        ExpiresAt.new(expiresIn),
        scope,
        tokenType
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
