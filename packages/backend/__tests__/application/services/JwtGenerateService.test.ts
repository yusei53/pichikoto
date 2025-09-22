import type { Context } from "hono";
import { sign } from "hono/jwt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  JwtGenerateService,
  JwtGenerateServiceError
} from "../../../src/application/services/jwt/JwtGenerateService";
import { expectErr, expectOk } from "../../testing/utils/AssertResult";

// hono/jwtモジュールをモック
vi.mock("hono/jwt", async () => {
  const actual = await vi.importActual("hono/jwt");
  return {
    ...actual,
    sign: vi.fn()
  };
});

const MOCK_JWT_SECRET = "test_jwt_secret";
const MOCK_USER_ID = "123456789";

const mockContext: Context = {
  env: {
    JWT_SECRET: MOCK_JWT_SECRET
  }
} as Context;

describe("JwtGenerateService Tests", () => {
  const jwtGenerateService = new JwtGenerateService();

  describe("execute", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });
    /**
     * 正常ケース：JWT生成成功のテストケース
     */
    it("有効なユーザーIDでアクセストークンとリフレッシュトークンが正常に生成されること", async () => {
      // Arrange - 正常なsign関数の動作をセットアップ
      const mockAccessToken = "mock.access.token";
      const mockRefreshToken = "mock.refresh.token";

      vi.mocked(sign)
        .mockResolvedValueOnce(mockAccessToken)
        .mockResolvedValueOnce(mockRefreshToken);

      // Act
      const result = await jwtGenerateService.execute(
        mockContext,
        MOCK_USER_ID
      );

      // Assert
      const tokens = expectOk(result);

      // トークンが生成されていることを確認
      expect(tokens.accessToken).toBe(mockAccessToken);
      expect(tokens.refreshToken).toBe(mockRefreshToken);
    });

    /**
     * 異常ケース：JWT生成時にエラーが発生した場合
     */
    it("JWT生成時にエラーが発生した場合、JwtGenerateServiceErrorが返されること", async () => {
      // Arrange - sign関数をモックしてエラーを発生させる
      const mockError = new Error("JWT signing failed");
      vi.mocked(sign).mockRejectedValue(mockError);

      // Act
      const result = await jwtGenerateService.execute(
        mockContext,
        MOCK_USER_ID
      );

      // Assert
      const error = expectErr(result);
      expect(error).toBeInstanceOf(JwtGenerateServiceError);
      expect(error.message).toBe("JWT generation failed: JWT signing failed");
      expect(error.cause).toBe(mockError);
    });
  });
});
