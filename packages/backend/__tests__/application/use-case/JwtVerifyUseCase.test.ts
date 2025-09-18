import type { Context } from "hono";
import { sign } from "hono/jwt";
import { beforeEach, describe, expect, it } from "vitest";
import { JwtVerifyUseCase } from "../../../src/application/use-case/jwt/JwtVerifyUseCase";

// モック定数
const MOCK_BASE_URL = "https://api.test.com";
const MOCK_JWT_SECRET = "test_jwt_secret";
const MOCK_USER_ID = "123456789";

const mockContext: Context = {
  env: {
    BASE_URL: MOCK_BASE_URL,
    JWT_SECRET: MOCK_JWT_SECRET
  }
} as Context;

describe("JwtVerifyUseCase Tests", () => {
  const jwtVerifyUseCase = new JwtVerifyUseCase();

  let validAccessToken: string;

  beforeEach(async () => {
    // テスト用の有効なアクセストークンを生成
    validAccessToken = await sign(
      {
        sub: MOCK_USER_ID,
        exp: Math.floor(Date.now() / 1000) + 3600 // 1時間後に期限切れ
      },
      MOCK_JWT_SECRET
    );
  });

  describe("execute", () => {
    /**
     * 正常ケース：有効なJWTトークン検証成功のテストケース
     *
     * @description 有効なJWTトークンで正常にペイロードが取得されることを確認
     */
    it("有効なJWTトークンで正常にペイロードが取得されること", async () => {
      // Act
      const result = await jwtVerifyUseCase.execute(mockContext, validAccessToken);

      // Assert
      expect(result).not.toBeNull();
      expect(result).toHaveProperty("sub", MOCK_USER_ID);
      expect(result).toHaveProperty("exp");
      expect(typeof result!.exp).toBe("number");
      expect(result!.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });

    /**
     * 正常ケース：無効なトークンでnullが返される場合のテストケース
     *
     * @description 無効なトークンでnullが返されることを確認
     */
    it("無効なJWTトークンの場合、nullが返却されること", async () => {
      // Act
      const result = await jwtVerifyUseCase.execute(mockContext, "invalid_token");

      // Assert
      expect(result).toBeNull();
    });

    /**
     * 異常ケース：期限切れJWTトークンのテストケース
     *
     * @description 期限切れのJWTトークンでnullが返されることを確認
     */
    it("期限切れのJWTトークンの場合、nullが返却されること", async () => {
      // Arrange - 期限切れのトークンを生成
      const expiredToken = await sign(
        {
          sub: MOCK_USER_ID,
          exp: Math.floor(Date.now() / 1000) - 3600 // 1時間前（期限切れ）
        },
        MOCK_JWT_SECRET
      );

      // Act
      const result = await jwtVerifyUseCase.execute(mockContext, expiredToken);

      // Assert
      expect(result).toBeNull();
    });

    /**
     * 異常ケース：不正な形式のJWTトークンのテストケース
     *
     * @description 不正な形式のJWTトークンでnullが返されることを確認
     */
    it("不正な形式のJWTトークンの場合、nullが返却されること", async () => {
      // Act
      const result = await jwtVerifyUseCase.execute(mockContext, "malformed.token");

      // Assert
      expect(result).toBeNull();
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
        jwtVerifyUseCase.execute(contextWithoutSecret, validAccessToken)
      ).rejects.toThrow("JWT_SECRET is not set in environment variables");
    });
  });
});