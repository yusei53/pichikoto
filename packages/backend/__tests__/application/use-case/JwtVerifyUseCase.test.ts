import type { Context } from "hono";
import { sign } from "hono/jwt";
import { describe, expect, it } from "vitest";
import type { AppJwtPayload } from "../../../src/application/use-case/discord-auth/JwtVerifyUseCase";
import { JwtVerifyUseCase } from "../../../src/application/use-case/discord-auth/JwtVerifyUseCase";
import { expectErr, expectOk } from "../../testing/utils/AssertResult";

const MOCK_JWT_SECRET = "test_jwt_secret";

const mockContext: Context = {
  env: {
    JWT_SECRET: MOCK_JWT_SECRET
  }
} as Context;

describe("JwtVerifyUseCase Tests", () => {
  const jwtVerifyUseCase = new JwtVerifyUseCase();

  describe("execute", () => {
    /**
     * 正常ケース：有効なJWTトークン検証成功のテストケース
     */
    it("有効なJWTトークンで正常にペイロードが取得されること", async () => {
      // Arrange
      const MOCK_USER_ID = "123456789";
      const MOCK_EXPIRATION_TIME = Math.floor(Date.now() / 1000) + 3600;
      const mockToken = await sign(
        {
          sub: MOCK_USER_ID,
          exp: MOCK_EXPIRATION_TIME
        },
        MOCK_JWT_SECRET
      );

      const expected = {
        jwtPayload: {
          sub: MOCK_USER_ID,
          exp: MOCK_EXPIRATION_TIME
        }
      } as AppJwtPayload;

      // Act
      const result = await jwtVerifyUseCase.execute(mockContext, mockToken);

      // Assert
      const actualPayload = expectOk(result);
      expect(actualPayload).toMatchObject(expected);
    });
  });

  /**
   * 異常ケース：無効なトークンでエラーが返される場合のテストケース
   *
   * @description 無効なトークンでエラーが返されることを確認
   */
  it("無効なJWTトークンの場合、JwtVerifyUseCaseErrorが返されること", async () => {
    // Act
    const result = await jwtVerifyUseCase.execute(mockContext, "invalid_token");

    // Assert
    const error = expectErr(result);
    expect(error.message).toBe(
      "JWT verification failed: invalid JWT token: invalid_token"
    );
  });

  /**
   * 異常ケース：期限切れJWTトークンのテストケース
   *
   * @description 期限切れのJWTトークンでエラーが返されることを確認
   */
  it("期限切れのJWTトークンの場合、JwtVerifyUseCaseErrorが返されること", async () => {
    // Arrange - 期限切れのトークンを生成
    const expiredToken = await sign(
      {
        sub: "123456789",
        exp: Math.floor(Date.now() / 1000) - 3600 // 1時間前（期限切れ）
      },
      MOCK_JWT_SECRET
    );

    // Act
    const result = await jwtVerifyUseCase.execute(mockContext, expiredToken);

    // Assert
    const error = expectErr(result);
    expect(error.message).toContain("token");
    expect(error.message).toContain("expired");
  });
});
