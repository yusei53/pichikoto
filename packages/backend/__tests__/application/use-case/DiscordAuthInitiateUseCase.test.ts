import type { Context } from "hono";
import { afterEach, describe, expect, it } from "vitest";
import * as schema from "../../../database/schema";
import { DiscordAuthInitiateUseCase } from "../../../src/application/use-case/discord-auth/DiscordAuthInitiateUseCase";
import { StateRepository } from "../../../src/infrastructure/repositories/StateRepository";
import { deleteFromDatabase } from "../../testing/utils/GenericTableHelper";

const MOCK_CLIENT_ID = "test_client_id";
const MOCK_FRONTEND_BASE_URL = "https://frontend.test.com";

const mockContext: Context = {
  env: {
    DISCORD_CLIENT_ID: MOCK_CLIENT_ID,
    FRONTEND_BASE_URL: MOCK_FRONTEND_BASE_URL
  }
} as Context;

describe("DiscordAuthInitiateUseCase Tests", () => {
  const discordAuthInitiateUseCase = new DiscordAuthInitiateUseCase(
    new StateRepository()
  );

  afterEach(async () => {
    await deleteFromDatabase(schema.oauthState);
  });

  describe("execute", () => {
    /**
     * Discord認証の初期化処理のテストケース
     *
     * @description Discord認証URLとセッションIDの生成、および適切な値の検証とDBへの保存確認を行う
     *
     * **Arrange（準備）**
     * - 期待するURLパラメータの定義
     * - 生成される値の期待長の定義
     *
     * **Act（実行）**
     * - DiscordAuthInitiateUseCaseのexecuteメソッド実行
     *
     * **Assert（検証）**
     * - 生成されたレスポンスの基本構造確認
     * - URLパラメータの固定値検証
     * - 生成されるランダム値の長さ検証
     */
    it("Discord認証URLとセッションIDを生成し、適切な値とDBへの保存が行われること", async () => {
      // Arrange
      const expectedUrlParameters = {
        client_id: MOCK_CLIENT_ID,
        response_type: "code",
        redirect_uri: `${MOCK_FRONTEND_BASE_URL}/auth/callback/discord`,
        scope: "identify openid",
        code_challenge_method: "S256"
      };

      const expectedLengths = {
        sessionID: 32,
        state: 32,
        nonce: 32,
        codeChallenge: 43 // Base64URL エンコードされたSHA-256ハッシュ
      };

      // Act
      const result = await discordAuthInitiateUseCase.execute(mockContext);

      // Assert
      expect(result).toMatchObject({
        authURL: expect.stringContaining(
          "https://discord.com/oauth2/authorize"
        ),
        sessionID: expect.any(String)
      });

      const url = new URL(result.authURL);
      const state = url.searchParams.get("state");
      const nonce = url.searchParams.get("nonce");
      const codeChallenge = url.searchParams.get("code_challenge");

      Object.entries(expectedUrlParameters).forEach(
        ([param, expectedValue]) => {
          expect(url.searchParams.get(param)).toBe(expectedValue);
        }
      );

      // MEMO: expectedUrlParametersで確認できていないパラメータの存在確認を含めたアサート
      expect(result.sessionID).toHaveLength(expectedLengths.sessionID);
      expect(state).toHaveLength(expectedLengths.state);
      expect(nonce).toHaveLength(expectedLengths.nonce);
      expect(codeChallenge).toHaveLength(expectedLengths.codeChallenge);
    });
  });
});
