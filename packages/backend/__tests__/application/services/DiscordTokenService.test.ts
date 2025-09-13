import type { Context } from "hono";
import { describe, expect, it, vi } from "vitest";
import { DiscordJWKService } from "../../../src/application/services/discord-auth/DiscordJWKService";
import {
  DiscordTokenService,
  type DiscordToken
} from "../../../src/application/services/discord-auth/DiscordTokenService";
import { expectErr, expectOk } from "../../testing/utils/AssertResult";

describe("DiscordTokenService Tests", () => {
  const MOCK_CLIENT_ID = "test_client_id";
  const MOCK_CLIENT_SECRET = "test_client_secret";
  const MOCK_BASE_URL = "https://api.test.com";
  const MOCK_CODE = "test_authorization_code";
  const MOCK_CODE_VERIFIER = "test_code_verifier";

  const mockFetch = vi.fn();
  vi.stubGlobal("fetch", mockFetch);

  const mockContext = {
    env: {
      DISCORD_CLIENT_ID: MOCK_CLIENT_ID,
      DISCORD_CLIENT_SECRET: MOCK_CLIENT_SECRET,
      BASE_URL: MOCK_BASE_URL
    }
  } as Context;

  const discordTokenService = new DiscordTokenService(new DiscordJWKService());

  describe("exchangeCodeForTokens", () => {
    /**
     * 正常ケース：Discord認証コードの正常なトークン交換
     *
     * @description 有効なコードとcode_verifierでトークン交換が成功することを確認
     *
     * Arrange
     * - 成功レスポンス（200 OK）をモック
     * - 有効なトークンレスポンスを設定
     *
     * Act
     * - exchangeCodeForTokensメソッドを実行
     *
     * Assert
     * - トークン情報の正確性確認
     * - 適切なAPIリクエストの実行確認
     */
    it("有効なコードとcode_verifierでトークン交換が成功し、正しいトークン情報が返されること", async () => {
      // Arrange
      const expected: DiscordToken = {
        access_token: "mock_access_token",
        expires_in: 3600,
        refresh_token: "mock_refresh_token",
        scope: "identify guilds",
        token_type: "Bearer",
        id_token: "mock_id_token"
      };
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: vi.fn().mockResolvedValue(expected)
      });

      // Act
      const result = await discordTokenService.exchangeCodeForTokens(
        mockContext,
        MOCK_CODE,
        MOCK_CODE_VERIFIER
      );

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        "https://discord.com/api/oauth2/token",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        })
      );

      const tokenResponse = expectOk(result);
      expect(tokenResponse).toEqual(expected);
    });

    /**
     * エラーケース：Discord APIエラーレスポンスのテストケース
     *
     * @description Discord APIが4xxエラーを返した場合の適切なエラー処理
     */
    it("Discord APIが400エラーを返した場合はTokenExchangeFailedErrorが返されること", async () => {
      // Arrange
      const errorText = "invalid_grant";
      mockFetch.mockResolvedValueOnce({
        status: 400,
        ok: false,
        text: vi.fn().mockResolvedValue(errorText),
        json: vi.fn().mockResolvedValue({ error: errorText })
      });

      // Act
      const result = await discordTokenService.exchangeCodeForTokens(
        mockContext,
        MOCK_CODE,
        MOCK_CODE_VERIFIER
      );

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        "https://discord.com/api/oauth2/token",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        })
      );
      const error = expectErr(result);
      expect(error.name).toBe("TokenExchangeFailedError");
      expect(error.message).toContain(
        "Discord token exchange failed: 400 - invalid_grant"
      );
      expect(error.statusCode).toBe(400);
      expect(error.responseText).toBe(errorText);
    });

    /**
     * エラーケース：Discord APIサーバーエラーのテストケース
     *
     * @description Discord APIが5xxエラーを返した場合の適切なエラー処理確認
     */
    it("Discord APIが500エラーを返した場合はTokenExchangeFailedErrorが返されること", async () => {
      // Arrange
      const errorText = "Internal Server Error";
      mockFetch.mockResolvedValueOnce({
        status: 500,
        ok: false,
        text: vi.fn().mockResolvedValue(errorText),
        json: vi.fn().mockResolvedValue({ error: errorText })
      });
      // Act
      const result = await discordTokenService.exchangeCodeForTokens(
        mockContext,
        MOCK_CODE,
        MOCK_CODE_VERIFIER
      );

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        "https://discord.com/api/oauth2/token",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        })
      );
      const error = expectErr(result);
      expect(error.name).toBe("TokenExchangeFailedError");
      expect(error.message).toContain(
        "Discord token exchange failed: 500 - Internal Server Error"
      );
      expect(error.statusCode).toBe(500);
      expect(error.responseText).toBe(errorText);
    });
  });
});
