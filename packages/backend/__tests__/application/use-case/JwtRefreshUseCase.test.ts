import type { Context } from "hono";
import { sign } from "hono/jwt";
import { beforeEach, describe, expect, it } from "vitest";
import { JwtRefreshUseCase } from "../../../src/application/use-case/jwt/JwtRefreshUseCase";

// モック定数
const MOCK_BASE_URL = "https://api.test.com";
const MOCK_JWT_SECRET = "test_jwt_secret";

const mockContext: Context = {
  env: {
    BASE_URL: MOCK_BASE_URL,
    JWT_SECRET: MOCK_JWT_SECRET
  }
} as Context;

describe("JwtRefreshUseCase Tests", () => {
  const jwtRefreshUseCase = new JwtRefreshUseCase();

  let validRefreshToken: string;

  beforeEach(async () => {
    // テスト用の有効なリフレッシュトークンを生成
    validRefreshToken = await sign(
      {
        sub: "test_user_id",
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 // 1年後
      },
      MOCK_JWT_SECRET
    );
  });

  describe("execute", () => {
    /**
     * 正常ケース：トークンリフレッシュ成功のテストケース
     *
     * @description 有効なリフレッシュトークンでアクセストークンとリフレッシュトークンが正常に取得されることを確認
     *
     * **Arrange（準備）**
     * - 有効なリフレッシュトークンを生成
     *
     * **Act（実行）**
     * - JwtRefreshUseCaseのexecuteメソッド実行
     *
     * **Assert（検証）**
     * - 正常なトークンペアの返却確認
     * - 返却されるトークンが文字列であることを確認
     */
    it("有効なリフレッシュトークンで正常にトークンがリフレッシュされること", async () => {
      // Act
      const result = await jwtRefreshUseCase.execute(mockContext, validRefreshToken);

      // Assert
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(typeof result.accessToken).toBe("string");
      expect(typeof result.refreshToken).toBe("string");
      expect(result.accessToken).not.toBe(validRefreshToken);
      // リフレッシュトークンは新しく生成されるが、同じユーザーIDと期限なので同じになる可能性がある
      // 新しいトークンは元のトークンとは異なる期限を持つ
      expect(result.accessToken.length).toBeGreaterThan(0);
      expect(result.refreshToken.length).toBeGreaterThan(0);
    });

    /**
     * 異常ケース：無効なリフレッシュトークンのテストケース
     *
     * @description 無効なリフレッシュトークンでエラーが正しく処理されることを確認
     */
    it("無効なリフレッシュトークンの場合、JwtRefreshUseCaseErrorが発生すること", async () => {
      // Act & Assert
      await expect(
        jwtRefreshUseCase.execute(mockContext, "invalid_token")
      ).rejects.toThrow("JwtRefreshUseCaseError");
    });

    /**
     * 異常ケース：期限切れリフレッシュトークンのテストケース
     *
     * @description 期限切れのリフレッシュトークンでエラーが正しく処理されることを確認
     */
    it("期限切れのリフレッシュトークンの場合、JwtRefreshUseCaseErrorが発生すること", async () => {
      // Arrange - 期限切れのトークンを生成
      const expiredToken = await sign(
        {
          sub: "test_user_id",
          exp: Math.floor(Date.now() / 1000) - 3600 // 1時間前（期限切れ）
        },
        MOCK_JWT_SECRET
      );

      // Act & Assert
      await expect(
        jwtRefreshUseCase.execute(mockContext, expiredToken)
      ).rejects.toThrow("JwtRefreshUseCaseError");
    });

    /**
     * 異常ケース：JWT_SECRETが設定されていない場合のテストケース
     *
     * @description JWT_SECRETが環境変数に設定されていない場合のエラー処理を確認
     */
    it("JWT_SECRETが設定されていない場合、エラーが発生すること", async () => {
      // Arrange
      const contextWithoutSecret: Context = {
        env: {
          BASE_URL: MOCK_BASE_URL
          // JWT_SECRETを設定しない
        }
      } as Context;

      // Act & Assert
      await expect(
        jwtRefreshUseCase.execute(contextWithoutSecret, validRefreshToken)
      ).rejects.toThrow("JWT_SECRET is not set in environment variables");
    });
  });
});