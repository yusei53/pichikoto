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
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const tokens = result.value;
        expect(tokens).toHaveProperty("accessToken");
        expect(tokens).toHaveProperty("refreshToken");
        expect(typeof tokens.accessToken).toBe("string");
        expect(typeof tokens.refreshToken).toBe("string");
        expect(tokens.accessToken).not.toBe(validRefreshToken);
        // 新しいトークンは元のトークンとは異なる期限を持つ
        expect(tokens.accessToken.length).toBeGreaterThan(0);
        expect(tokens.refreshToken.length).toBeGreaterThan(0);
      }
    });

    /**
     * 異常ケース：無効なリフレッシュトークンのテストケース
     *
     * @description 無効なリフレッシュトークンでエラーが正しく処理されることを確認
     */
    it("無効なリフレッシュトークンの場合、JwtRefreshUseCaseErrorが返されること", async () => {
      // Act
      const result = await jwtRefreshUseCase.execute(mockContext, "invalid_token");

      // Assert
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.name).toBe("JwtRefreshUseCaseError");
        expect(result.error.message).toContain("JWT refresh failed");
      }
    });

    /**
     * 異常ケース：期限切れリフレッシュトークンのテストケース
     *
     * @description 期限切れのリフレッシュトークンでエラーが正しく処理されることを確認
     */
    it("期限切れのリフレッシュトークンの場合、JwtRefreshUseCaseErrorが返されること", async () => {
      // Arrange - 期限切れのトークンを生成
      const expiredToken = await sign(
        {
          sub: "test_user_id",
          exp: Math.floor(Date.now() / 1000) - 3600 // 1時間前（期限切れ）
        },
        MOCK_JWT_SECRET
      );

      // Act
      const result = await jwtRefreshUseCase.execute(mockContext, expiredToken);

      // Assert
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.name).toBe("JwtRefreshUseCaseError");
        expect(result.error.message).toContain("JWT refresh failed");
      }
    });

    /**
     * 異常ケース：JWT_SECRETが設定されていない場合のテストケース
     *
     * @description JWT_SECRETが環境変数に設定されていない場合のエラー処理を確認
     */
    it("JWT_SECRETが設定されていない場合、エラーが返されること", async () => {
      // Arrange
      const contextWithoutSecret: Context = {
        env: {
          BASE_URL: MOCK_BASE_URL
          // JWT_SECRETを設定しない
        }
      } as Context;

      // Act
      const result = await jwtRefreshUseCase.execute(contextWithoutSecret, validRefreshToken);

      // Assert
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.name).toBe("JwtRefreshUseCaseError");
        expect(result.error.message).toContain("JWT_SECRET is not set in environment variables");
      }
    });
  });
});