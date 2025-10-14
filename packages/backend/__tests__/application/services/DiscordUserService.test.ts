import { describe, expect, it, vi } from "vitest";
import {
  DiscordUserService,
  type DiscordUserResource
} from "../../../src/application/services/discord-auth/DiscordUserService";
import { expectErr, expectOk } from "../../testing/utils/AssertResult";

describe("DiscordUserService Tests", () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  const MOCK_ACCESS_TOKEN = "test_access_token";
  const MOCK_USER_ID = "123456789012345678";
  const MOCK_USERNAME = "test_user";
  const MOCK_GLOBAL_NAME = "ゆせ";
  const MOCK_AVATAR = "avatar_hash";

  const service = new DiscordUserService();

  describe("getUserResource", () => {
    const mockUserResource: DiscordUserResource = {
      id: MOCK_USER_ID,
      username: MOCK_USERNAME,
      global_name: MOCK_GLOBAL_NAME,
      avatar: MOCK_AVATAR
    };

    /**
     * 正常ケース：有効なアクセストークンでユーザー情報取得のテストケース
     *
     * @description 有効なアクセストークンを使用してDiscord APIからユーザー情報を取得できることを確認
     *
     * Arrange
     * - fetchのモックを成功レスポンスに設定
     * - 期待するユーザーリソースデータを準備
     *
     * Act
     * - getUserResourceメソッドを実行
     *
     * Assert
     * - 成功結果の返却確認
     * - 正しいAPIエンドポイントへのリクエスト確認
     * - 正しい認証ヘッダーの送信確認
     * - 期待するユーザー情報の返却確認
     */
    it("有効なアクセストークンでユーザー情報を正常に取得できること", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockUserResource)
      });

      // Act
      const result = await service.getUserResource(MOCK_ACCESS_TOKEN);

      // Assert
      const userResource = expectOk(result);
      expect(userResource).toEqual(mockUserResource);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://discord.com/api/users/@me",
        {
          headers: {
            Authorization: `Bearer ${MOCK_ACCESS_TOKEN}`
          }
        }
      );
    });

    /**
     * エラーケース：無効なアクセストークンのテストケース
     *
     * @description 無効なアクセストークンの場合に適切なエラーが返されることを確認
     *
     * Arrange
     * - fetchのモックを401エラーレスポンスに設定
     *
     * Act
     * - getUserResourceメソッドを無効なトークンで実行
     *
     * Assert
     * - エラー結果の返却確認
     * - 適切なエラーメッセージと詳細情報の確認
     */
    it("無効なアクセストークンの場合、UserResourceRetrievalFailedErrorが返されること", async () => {
      // Arrange
      const errorStatusCode = 401;
      const errorText = "Invalid access token";
      mockFetch.mockResolvedValue({
        ok: false,
        status: errorStatusCode,
        text: vi.fn().mockResolvedValue(errorText)
      });

      // Act
      const result = await service.getUserResource("invalid_token");

      // Assert
      const error = expectErr(result);
      expect(error.name).toBe("UserResourceRetrievalFailedError");
      expect(error.message).toBe(
        `Discord user resource retrieval failed: ${errorStatusCode} - ${errorText}`
      );
      expect(error.statusCode).toBe(errorStatusCode);
      expect(error.responseText).toBe(errorText);
    });

    /**
     * エラーケース：サーバーエラーのテストケース
     *
     * @description Discord APIのサーバーエラーの場合の適切なエラー処理確認
     */
    it("サーバーエラー（500番台）の場合、適切なエラーが返されること", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue("Internal Server Error")
      });

      // Act
      const result = await service.getUserResource(MOCK_ACCESS_TOKEN);

      // Assert
      const error = expectErr(result);
      expect(error.name).toBe("UserResourceRetrievalFailedError");
      expect(error.statusCode).toBe(500);
      expect(error.responseText).toBe("Internal Server Error");
      expect(error.message).toContain("Discord user resource retrieval failed");
    });

    /**
     * 境界値テスト：空文字列のアクセストークンのテストケース
     *
     * @description 空文字列のアクセストークンでも適切にAPIコールが行われることを確認
     */
    it("空文字列のアクセストークンでも適切にAPIコールが行われること", async () => {
      // Arrange
      const emptyToken = "";
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: vi.fn().mockResolvedValue("Unauthorized")
      });

      // Act
      const result = await service.getUserResource(emptyToken);

      // Assert
      const error = expectErr(result);
      expect(error.statusCode).toBe(401);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://discord.com/api/users/@me",
        {
          headers: {
            Authorization: `Bearer ${""}`
          }
        }
      );
    });
  });
});
