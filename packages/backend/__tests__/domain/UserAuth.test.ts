import { describe, expect, it, vi } from "vitest";
import { UserID } from "../../src/domain/User";
import {
  AccessToken,
  ExpiredAt,
  RefreshToken,
  UserAuth
} from "../../src/domain/UserAuth";
import { CreatedAt } from "../../src/utils/CreatedAt";

const MOCK_UUID = "00000000-0000-0000-0000-000000";
const MOCK_CREATED_AT = "2025-01-01T00:00:00.000Z";
const MOCK_EXPIRES_AT = "2025-01-01T00:00:00.000Z";

vi.mock("../../src/domain/models/User", () => {
  return {
    UserID: {
      new: vi.fn(() => ({
        value: MOCK_UUID
      }))
    }
  };
});

vi.mock("../../src/utils/CreatedAt", () => {
  return {
    CreatedAt: {
      new: vi.fn(() => ({
        value: MOCK_CREATED_AT
      }))
    }
  };
});

vi.mock("../../src/utils/ExpiredAt", () => {
  return {
    ExpiredAt: {
      new: vi.fn(() => ({
        value: MOCK_EXPIRES_AT
      }))
    }
  };
});

describe("UserAuthDomainTest", () => {
  const userId = UserID.new();
  const accessTokenValue = "test_access_token";
  const refreshTokenValue = "test_refresh_token";
  const expiresIn = 3600;
  const scope = "read write";
  const tokenType = "Bearer";

  describe("UserAuthドメインの作成", () => {
    it("UserAuthを作成できること", () => {
      // arrange
      const expected = UserAuth.reconstruct(
        userId,
        AccessToken.from(accessTokenValue),
        RefreshToken.from(refreshTokenValue),
        ExpiredAt.new(expiresIn),
        scope,
        tokenType,
        CreatedAt.new()
      );

      // act
      const actual = UserAuth.create(
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
