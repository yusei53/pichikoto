import type { Context } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JwtServiceInterface } from "../../../src/application/services/jwt";
import { JwtVerifyUseCase } from "../../../src/application/use-case/jwt/JwtVerifyUseCase";

// モック定数
const MOCK_BASE_URL = "https://api.test.com";
const MOCK_JWT_SECRET = "test_jwt_secret";
const MOCK_ACCESS_TOKEN = "mock_access_token";
const MOCK_USER_ID = "123456789";

const mockContext: Context = {
  env: {
    BASE_URL: MOCK_BASE_URL,
    JWT_SECRET: MOCK_JWT_SECRET
  }
} as Context;

const mockJwtPayload = {
  sub: MOCK_USER_ID,
  exp: Math.floor(Date.now() / 1000) + 3600 // 1時間後に期限切れ
};

describe("JwtVerifyUseCase Tests", () => {
  // サービスのモック
  const mockJwtService = {
    refreshAccessToken: vi.fn(),
    generateTokens: vi.fn(),
    verify: vi.fn()
  };

  const jwtVerifyUseCase = new JwtVerifyUseCase(
    mockJwtService as JwtServiceInterface
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("execute", () => {
    /**
     * 正常ケース：有効なJWTトークン検証成功のテストケース
     *
     * @description 有効なJWTトークンで正常にペイロードが取得されることを確認
     *
     * **Arrange（準備）**
     * - JwtServiceのモックを成功レスポンスに設定
     * - 期待するペイロードの定義
     *
     * **Act（実行）**
     * - JwtVerifyUseCaseのexecuteメソッド実行
     *
     * **Assert（検証）**
     * - 正常なJWTペイロードの返却確認
     * - JwtServiceのメソッド呼び出し確認
     * - 返却されるペイロードの正確性確認
     */
    it("有効なJWTトークンで正常にペイロードが取得されること", async () => {
      // Arrange
      mockJwtService.verify.mockResolvedValue(mockJwtPayload);

      // Act
      const result = await jwtVerifyUseCase.execute(mockContext, MOCK_ACCESS_TOKEN);

      // Assert
      expect(result).toEqual(mockJwtPayload);
      expect(mockJwtService.verify).toHaveBeenCalledWith(
        mockContext,
        MOCK_ACCESS_TOKEN
      );
      expect(mockJwtService.verify).toHaveBeenCalledTimes(1);
    });

    /**
     * 正常ケース：JWTサービスがnullを返す場合のテストケース
     *
     * @description JWTサービスがnull（無効なトークン）を返した場合の処理を確認
     */
    it("JWTサービスがnullを返す場合、nullが返却されること", async () => {
      // Arrange
      mockJwtService.verify.mockResolvedValue(null);

      // Act
      const result = await jwtVerifyUseCase.execute(mockContext, MOCK_ACCESS_TOKEN);

      // Assert
      expect(result).toBeNull();
      expect(mockJwtService.verify).toHaveBeenCalledWith(
        mockContext,
        MOCK_ACCESS_TOKEN
      );
      expect(mockJwtService.verify).toHaveBeenCalledTimes(1);
    });

    /**
     * 異常ケース：無効なJWTトークンのテストケース
     *
     * @description 無効なJWTトークンでエラーが正しく処理されることを確認
     *
     * **Arrange（準備）**
     * - JwtServiceのモックをエラーレスポンスに設定
     *
     * **Act & Assert（実行・検証）**
     * - JwtVerifyUseCaseのexecuteメソッド実行でエラーが発生することを確認
     * - エラーメッセージの正確性確認
     */
    it("無効なJWTトークンの場合、JwtVerifyUseCaseErrorが発生すること", async () => {
      // Arrange
      const mockError = new Error("Invalid token signature");
      mockError.name = "JwtVerificationError";
      mockJwtService.verify.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        jwtVerifyUseCase.execute(mockContext, MOCK_ACCESS_TOKEN)
      ).rejects.toThrowError(
        "JwtVerifyUseCaseError(cause: JwtVerificationError: Invalid token signature)"
      );

      expect(mockJwtService.verify).toHaveBeenCalledWith(
        mockContext,
        MOCK_ACCESS_TOKEN
      );
      expect(mockJwtService.verify).toHaveBeenCalledTimes(1);
    });

    /**
     * 異常ケース：期限切れJWTトークンのテストケース
     *
     * @description 期限切れのJWTトークンでエラーが正しく処理されることを確認
     */
    it("期限切れのJWTトークンの場合、JwtVerifyUseCaseErrorが発生すること", async () => {
      // Arrange
      const mockError = new Error("Token expired");
      mockError.name = "TokenExpiredError";
      mockJwtService.verify.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        jwtVerifyUseCase.execute(mockContext, MOCK_ACCESS_TOKEN)
      ).rejects.toThrowError(
        "JwtVerifyUseCaseError(cause: TokenExpiredError: Token expired)"
      );
    });

    /**
     * 異常ケース：不正な形式のJWTトークンのテストケース
     *
     * @description 不正な形式のJWTトークンでエラーが正しく処理されることを確認
     */
    it("不正な形式のJWTトークンの場合、JwtVerifyUseCaseErrorが発生すること", async () => {
      // Arrange
      const mockError = new Error("Malformed token");
      mockError.name = "JsonWebTokenError";
      mockJwtService.verify.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        jwtVerifyUseCase.execute(mockContext, MOCK_ACCESS_TOKEN)
      ).rejects.toThrowError(
        "JwtVerifyUseCaseError(cause: JsonWebTokenError: Malformed token)"
      );
    });

    /**
     * 異常ケース：JWTサービス内部エラーのテストケース
     *
     * @description JWTサービスで内部エラーが発生した場合のエラー処理を確認
     */
    it("JWTサービスで内部エラーが発生した場合、JwtVerifyUseCaseErrorが発生すること", async () => {
      // Arrange
      const mockError = new Error("Internal server error");
      mockError.name = "InternalError";
      mockJwtService.verify.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        jwtVerifyUseCase.execute(mockContext, MOCK_ACCESS_TOKEN)
      ).rejects.toThrowError(
        "JwtVerifyUseCaseError(cause: InternalError: Internal server error)"
      );
    });
  });
});