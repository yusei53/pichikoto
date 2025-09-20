import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AccessToken,
  DiscordTokens,
  ExpiresAt,
  RefreshToken
} from "../../../src/domain/discord-tokens";
import { UserID } from "../../../src/domain/user";
import { UUID } from "../../../src/utils";

const MOCK_UUID = "00000000-0000-0000-0000-000000000000";

describe("DiscordTokensDomainTest", () => {
  const accessTokenValue = "test_access_token";
  const refreshTokenValue = "test_refresh_token";
  const expiresIn = 3600;
  const scope = "read write";
  const tokenType = "Bearer";

  beforeEach(() => {
    vi.spyOn(UUID, "new").mockReturnValue(UUID.from(MOCK_UUID));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("DiscordTokensドメインの作成", () => {
    it("DiscordTokensを作成できること", () => {
      const userId = UserID.new();

      const expected = DiscordTokens.reconstruct(
        userId,
        AccessToken.from(accessTokenValue),
        RefreshToken.from(refreshTokenValue),
        ExpiresAt.new(expiresIn),
        scope,
        tokenType
      );

      const actual = DiscordTokens.create(
        userId,
        accessTokenValue,
        refreshTokenValue,
        expiresIn,
        scope,
        tokenType
      );

      expect(actual).toStrictEqual(expected);
    });
  });
});
