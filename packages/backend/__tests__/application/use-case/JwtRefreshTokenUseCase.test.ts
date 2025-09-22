import type { Context } from "hono";
import { sign, verify } from "hono/jwt";
import { describe, expect, it } from "vitest";
import { JwtVerifyService } from "../../../src/application/services/jwt/JWTVerifyService";
import { JwtRefreshTokenUseCase } from "../../../src/application/use-case/jwt-auth/JwtRefreshTokenUseCase";

// モック定数
const MOCK_JWT_SECRET = "test_jwt_secret";
const MOCK_USER_ID = "test_user_id";

const mockContext: Context = {
  env: {
    JWT_SECRET: MOCK_JWT_SECRET
  }
} as Context;

describe("JwtRefreshTokenUseCase Tests", () => {
  const jwtRefreshTokenUseCase = new JwtRefreshTokenUseCase(
    new JwtVerifyService()
  );

  describe("execute", () => {
    /**
     * 正常ケース：有効なリフレッシュトークンで新しいトークンペアが生成されることのテストケース
     *
     * @description 有効なリフレッシュトークンを用いて、新しいアクセストークンとリフレッシュトークンが正常に生成されることを確認
     *
     * Arrange
     * - 有効なリフレッシュトークンを作成
     *
     * Act
     * - JwtRefreshTokenUseCaseのexecuteメソッド実行
     *
     * Assert
     * - 新しいアクセストークンとリフレッシュトークンが返却されること
     * - 返却されたトークンが検証可能であること
     * - ユーザーIDが正しく引き継がれていること
     */
    it("有効なリフレッシュトークンで新しいトークンペアが生成されること", async () => {
      // Arrange
      const validRefreshToken = await sign(
        {
          sub: MOCK_USER_ID,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365
        },
        MOCK_JWT_SECRET
      );

      // Act
      const result = await jwtRefreshTokenUseCase.execute(
        mockContext,
        validRefreshToken
      );

      // Assert
      const accessTokenPayload = await verify(
        result.accessToken,
        MOCK_JWT_SECRET
      );
      const refreshTokenPayload = await verify(
        result.refreshToken,
        MOCK_JWT_SECRET
      );

      expect(accessTokenPayload.sub).toBe(MOCK_USER_ID);
      expect(refreshTokenPayload.sub).toBe(MOCK_USER_ID);
      expect(accessTokenPayload.exp).toBeDefined();
      expect(refreshTokenPayload.exp).toBeDefined();
    });

    /**
     * 異常ケース：無効なリフレッシュトークンでエラーが発生することのテストケース
     *
     * @description 無効なリフレッシュトークンを用いた場合、適切なエラーが発生することを確認
     */
    it("無効なリフレッシュトークンでエラーが発生すること", async () => {
      // Arrange
      const invalidRefreshToken = "invalid_token";

      // Act & Assert
      await expect(
        jwtRefreshTokenUseCase.execute(mockContext, invalidRefreshToken)
      ).rejects.toThrowError(
        /JwtRefreshTokenUseCaseError.*JwtVerifyServiceError.*JWT verification failed.*invalid JWT token/
      );
    });

    /**
     * 異常ケース：期限切れのリフレッシュトークンでエラーが発生することのテストケース
     *
     * @description 期限切れのリフレッシュトークンを用いた場合、適切なエラーが発生することを確認
     */
    it("期限切れのリフレッシュトークンでエラーが発生すること", async () => {
      // Arrange
      const expiredRefreshToken = await sign(
        {
          sub: MOCK_USER_ID,
          exp: Math.floor(Date.now() / 1000) - 3600 // 1時間前に期限切れ
        },
        MOCK_JWT_SECRET
      );

      // Act & Assert
      await expect(
        jwtRefreshTokenUseCase.execute(mockContext, expiredRefreshToken)
      ).rejects.toThrowError(
        /JwtRefreshTokenUseCaseError.*JwtVerifyServiceError.*JWT verification failed.*token.*expired/
      );
    });

    /**
     * 異常ケース：異なるシークレットで署名されたトークンでエラーが発生することのテストケース
     *
     * @description 異なるシークレットで署名されたリフレッシュトークンを用いた場合、適切なエラーが発生することを確認
     */
    it("異なるシークレットで署名されたトークンでエラーが発生すること", async () => {
      // Arrange
      const differentSecret = "different_secret";
      const tokenWithDifferentSecret = await sign(
        {
          sub: MOCK_USER_ID,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365
        },
        differentSecret
      );

      // Act & Assert
      await expect(
        jwtRefreshTokenUseCase.execute(mockContext, tokenWithDifferentSecret)
      ).rejects.toThrowError(
        /JwtRefreshTokenUseCaseError.*JwtVerifyServiceError.*JWT verification failed.*signature mismatched/
      );
    });
  });
});
