import type { Context } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JwtServiceInterface } from "../../../src/application/services/jwt";
import { JwtRefreshUseCase } from "../../../src/application/use-case/jwt/JwtRefreshUseCase";

// モック定数
const MOCK_BASE_URL = "https://api.test.com";
const MOCK_JWT_SECRET = "test_jwt_secret";
const MOCK_REFRESH_TOKEN = "mock_refresh_token";

const mockContext: Context = {
  env: {
    BASE_URL: MOCK_BASE_URL,
    JWT_SECRET: MOCK_JWT_SECRET
  }
} as Context;

describe("JwtRefreshUseCase Tests", () => {
  // サービスのモック
  const mockJwtService = {
    refreshAccessToken: vi.fn(),
    generateTokens: vi.fn(),
    verify: vi.fn()
  };

  const jwtRefreshUseCase = new JwtRefreshUseCase(
    mockJwtService as JwtServiceInterface
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("execute", () => {
    /**
     * 正常ケース：トークンリフレッシュ成功のテストケース
     *
     * @description 有効なリフレッシュトークンでアクセストークンとリフレッシュトークンが正常に取得されることを確認
     *
     * **Arrange（準備）**
     * - JwtServiceのモックを成功レスポンスに設定
     * - 期待する返却値の定義
     *
     * **Act（実行）**
     * - JwtRefreshUseCaseのexecuteメソッド実行
     *
     * **Assert（検証）**
     * - 正常なトークンペアの返却確認
     * - JwtServiceのメソッド呼び出し確認
     * - 返却されるトークンの正確性確認
     */
    it("有効なリフレッシュトークンで正常にトークンがリフレッシュされること", async () => {
      // Arrange
      const expectedTokens = {
        accessToken: "new_access_token",
        refreshToken: "new_refresh_token"
      };

      mockJwtService.refreshAccessToken.mockResolvedValue(expectedTokens);

      // Act
      const result = await jwtRefreshUseCase.execute(mockContext, MOCK_REFRESH_TOKEN);

      // Assert
      expect(result).toEqual(expectedTokens);
      expect(mockJwtService.refreshAccessToken).toHaveBeenCalledWith(
        mockContext,
        MOCK_REFRESH_TOKEN
      );
      expect(mockJwtService.refreshAccessToken).toHaveBeenCalledTimes(1);
    });

    /**
     * 異常ケース：無効なリフレッシュトークンのテストケース
     *
     * @description 無効なリフレッシュトークンでエラーが正しく処理されることを確認
     *
     * **Arrange（準備）**
     * - JwtServiceのモックをエラーレスポンスに設定
     *
     * **Act & Assert（実行・検証）**
     * - JwtRefreshUseCaseのexecuteメソッド実行でエラーが発生することを確認
     * - エラーメッセージの正確性確認
     */
    it("無効なリフレッシュトークンの場合、JwtRefreshUseCaseErrorが発生すること", async () => {
      // Arrange
      const mockError = new Error("Invalid refresh token");
      mockError.name = "JwtVerificationError";
      mockJwtService.refreshAccessToken.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        jwtRefreshUseCase.execute(mockContext, MOCK_REFRESH_TOKEN)
      ).rejects.toThrowError(
        "JwtRefreshUseCaseError(cause: JwtVerificationError: Invalid refresh token)"
      );

      expect(mockJwtService.refreshAccessToken).toHaveBeenCalledWith(
        mockContext,
        MOCK_REFRESH_TOKEN
      );
      expect(mockJwtService.refreshAccessToken).toHaveBeenCalledTimes(1);
    });

    /**
     * 異常ケース：期限切れリフレッシュトークンのテストケース
     *
     * @description 期限切れのリフレッシュトークンでエラーが正しく処理されることを確認
     */
    it("期限切れのリフレッシュトークンの場合、JwtRefreshUseCaseErrorが発生すること", async () => {
      // Arrange
      const mockError = new Error("Refresh token expired");
      mockError.name = "TokenExpiredError";
      mockJwtService.refreshAccessToken.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        jwtRefreshUseCase.execute(mockContext, MOCK_REFRESH_TOKEN)
      ).rejects.toThrowError(
        "JwtRefreshUseCaseError(cause: TokenExpiredError: Refresh token expired)"
      );
    });

    /**
     * 異常ケース：JWTサービス内部エラーのテストケース
     *
     * @description JWTサービスで内部エラーが発生した場合のエラー処理を確認
     */
    it("JWTサービスで内部エラーが発生した場合、JwtRefreshUseCaseErrorが発生すること", async () => {
      // Arrange
      const mockError = new Error("Internal server error");
      mockError.name = "InternalError";
      mockJwtService.refreshAccessToken.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        jwtRefreshUseCase.execute(mockContext, MOCK_REFRESH_TOKEN)
      ).rejects.toThrowError(
        "JwtRefreshUseCaseError(cause: InternalError: Internal server error)"
      );
    });
  });
});