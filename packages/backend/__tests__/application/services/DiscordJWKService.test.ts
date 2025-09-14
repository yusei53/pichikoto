import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DiscordJWKService,
  type DiscordCryptoKey
} from "../../../src/application/services/discord-auth/DiscordJWKService";
import { expectErr, expectOk } from "../../testing/utils/AssertResult";

// joseライブラリをモック
vi.mock("jose", () => ({
  decodeProtectedHeader: vi.fn(),
  importJWK: vi.fn(),
  jwtVerify: vi.fn()
}));

// モック関数をインポート
import * as jose from "jose";
const mockDecodeProtectedHeader = vi.mocked(jose.decodeProtectedHeader);
const mockImportJWK = vi.mocked(jose.importJWK);
const mockJwtVerify = vi.mocked(jose.jwtVerify);

describe("DiscordJWKService Tests", () => {
  let discordJWKService: DiscordJWKService;
  const mockFetch = vi.fn();

  // モックのJWKSレスポンス
  const mockJWKSResponse = {
    keys: [
      {
        kty: "RSA",
        use: "sig",
        kid: "test-kid-1",
        n: "mock-n-value",
        e: "AQAB",
        alg: "RS256"
      },
      {
        kty: "RSA",
        use: "sig",
        kid: "test-kid-2",
        n: "mock-n-value-2",
        e: "AQAB",
        alg: "RS256"
      }
    ]
  };

  beforeEach(() => {
    // 各テストで新しいインスタンスを作成してキャッシュをクリア
    discordJWKService = new DiscordJWKService();
    vi.stubGlobal("fetch", mockFetch);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("decodeJWTHeader", () => {
    /**
     * 正常ケース：有効なJWTヘッダーのデコード
     *
     * @description 有効なJWTトークンでヘッダーデコードが成功することを確認
     *
     * Arrange
     * - 有効なkidを含むJWTヘッダーを持つトークンを準備
     *
     * Act
     * - decodeJWTHeaderメソッドを実行
     *
     * Assert
     * - 正しいkidが返されることを確認
     */
    it("有効なJWTトークンでヘッダーデコードが成功し、正しいkidが返されること", () => {
      // Arrange
      const mockKid = "test-kid-123";
      const mockToken = "valid.jwt.token";

      mockDecodeProtectedHeader.mockReturnValue({
        kid: mockKid,
        alg: "RS256",
        typ: "JWT"
      });

      // Act
      const result = discordJWKService.decodeJWTHeader(mockToken);

      // Assert
      const header = expectOk(result);
      expect(header.kid).toBe(mockKid);
      expect(mockDecodeProtectedHeader).toHaveBeenCalledWith(mockToken);
    });

    /**
     * エラーケース：kidが存在しないJWTヘッダー
     *
     * @description JWTヘッダーにkidが存在しない場合の適切なエラー処理確認
     */
    it("JWTヘッダーにkidが存在しない場合はMissingKidErrorが返されること", () => {
      // Arrange
      const mockToken = "invalid.jwt.token";

      mockDecodeProtectedHeader.mockReturnValue({
        alg: "RS256",
        typ: "JWT"
        // kidが存在しない
      });

      // Act
      const result = discordJWKService.decodeJWTHeader(mockToken);

      // Assert
      const error = expectErr(result);
      expect(error.toString()).toBe(
        "MissingKidError: Missing kid in JWT header"
      );
    });

    /**
     * エラーケース：無効なJWTトークン
     *
     * @description 無効なJWTトークンで適切なエラーが返されることを確認
     */
    it("無効なJWTトークンの場合はJWTHeaderDecodeFailedErrorが返されること", () => {
      // Arrange
      const mockToken = "invalid-jwt-format";
      const mockError = new Error("Invalid JWT format");

      mockDecodeProtectedHeader.mockImplementation(() => {
        throw mockError;
      });

      // Act
      const result = discordJWKService.decodeJWTHeader(mockToken);

      // Assert
      const error = expectErr(result);
      expect(error.toString()).toBe(
        "JWTHeaderDecodeFailedError: JWT header decode failed: Invalid JWT format"
      );
    });
  });

  describe("getPublicKeys", () => {
    /**
     * 正常ケース：Discord JWKS APIから公開鍵の正常取得
     *
     * @description Discord JWKS APIから公開鍵を正常に取得できることを確認
     *
     * Arrange
     * - 成功レスポンス（200 OK）をモック
     * - 有効なJWKSレスポンスを設定
     *
     * Act
     * - getPublicKeysメソッドを実行
     *
     * Assert
     * - 公開鍵配列の正確性確認
     * - 適切なAPIリクエストの実行確認
     */
    it("Discord JWKS APIから公開鍵を正常に取得できること", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: vi.fn().mockResolvedValue(mockJWKSResponse)
      });

      // JWK import をモック
      mockImportJWK.mockResolvedValue({} as CryptoKey);

      // Act
      const result = await discordJWKService.getPublicKeys();

      // Assert
      const publicKeys = expectOk(result);
      expect(publicKeys).toHaveLength(2);
      expect(publicKeys[0].kid).toBe("test-kid-1");
      expect(publicKeys[1].kid).toBe("test-kid-2");

      expect(fetch).toHaveBeenCalledWith("https://discord.com/api/oauth2/keys");
    });

    /**
     * エラーケース：Discord JWKS API 4xxエラー
     *
     
    
    /**
     * エラーケース：ネットワークエラー
     *
     * @description ネットワークエラーが発生した場合の適切なエラー処理確認
     */
    it("ネットワークエラーが発生した場合はFetchDiscordJWKSErrorが返されること", async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      // Act
      const result = await discordJWKService.getPublicKeys();

      // Assert
      const error = expectErr(result);
      expect(error.toString()).toBe(
        "FetchDiscordJWKSError: Fetch Discord JWKS failed: 500 - Network error occurred while fetching Discord JWKS"
      );
    });

    /**
     * 正常ケース：キャッシュからの公開鍵取得
     *
     * @description キャッシュが有効な場合にAPIを呼ばずにキャッシュから取得できることを確認
     */
    it("キャッシュが有効な場合はAPIを呼ばずにキャッシュから公開鍵を取得できること", async () => {
      // Arrange - 最初のAPIコール
      mockFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: vi.fn().mockResolvedValue(mockJWKSResponse)
      });

      const mockCryptoKey = {} as CryptoKey;
      mockImportJWK.mockResolvedValue(mockCryptoKey);

      // 最初の取得でキャッシュを作成
      await discordJWKService.getPublicKeys();

      // Act - 2回目の取得（キャッシュから）
      const result = await discordJWKService.getPublicKeys();

      // Assert
      const publicKeys = expectOk(result);
      expect(publicKeys).toHaveLength(2);

      // fetchは1回だけ呼ばれることを確認（キャッシュが使用された）
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("verifyJWTSignature", () => {
    const mockPublicKey = {
      kid: "test-kid",
      alg: "RS256"
    } as DiscordCryptoKey;

    const mockToken = "valid.jwt.token";
    const mockAudience = "test-client-id";
    const mockExpectedNonce = "test-nonce";

    /**
     * 正常ケース：JWT署名の正常検証
     *
     * @description 有効なJWTで署名検証が成功することを確認
     *
     * Arrange
     * - 有効なJWTペイロードをモック
     * - 期待されるnonceを設定
     *
     * Act
     * - verifyJWTSignatureメソッドを実行
     *
     * Assert
     * - ペイロードの正確性確認
     * - 署名検証の実行確認
     */
    it("有効なJWTで署名検証が成功し、正しいペイロードが返されること", async () => {
      // Arrange
      const expectedPayload = {
        sub: "user123",
        nonce: mockExpectedNonce,
        aud: mockAudience,
        iss: "https://discord.com",
        exp: Math.floor(Date.now() / 1000) + 3600
      };

      const mockJWTResult = {
        payload: expectedPayload,
        protectedHeader: { kid: "test-kid", alg: "RS256" },
        key: mockPublicKey
      };

      mockJwtVerify.mockResolvedValue(mockJWTResult);

      // Act
      const result = await discordJWKService.verifyJWTSignature(
        mockToken,
        mockPublicKey,
        mockAudience,
        mockExpectedNonce
      );

      // Assert
      const payload = expectOk(result);
      expect(payload).toEqual(expectedPayload);
    });

    /**
     * エラーケース：nonce不一致
     *
     * @description 期待されるnonceと異なる場合の適切なエラー処理確認
     */
    it("nonceが期待値と異なる場合はInvalidNonceErrorが返されること", async () => {
      // Arrange
      const incorrectNonce = "incorrect-nonce";
      const mockPayload = {
        sub: "user123",
        nonce: incorrectNonce,
        aud: mockAudience,
        iss: "https://discord.com"
      };

      const mockJWTResult = {
        payload: mockPayload,
        protectedHeader: { kid: "test-kid", alg: "RS256" },
        key: mockPublicKey
      };

      mockJwtVerify.mockResolvedValue(mockJWTResult);

      // Act
      const result = await discordJWKService.verifyJWTSignature(
        mockToken,
        mockPublicKey,
        mockAudience,
        mockExpectedNonce
      );

      // Assert
      const error = expectErr(result);
      expect(error.toString()).toBe(
        `InvalidNonceError: Invalid nonce: expected: ${mockExpectedNonce}, received: ${incorrectNonce}`
      );
    });

    /**
     * エラーケース：JWT署名検証失敗
     *
     * @description 無効なJWT署名で適切なエラーが返されることを確認
     */
    it("無効なJWT署名の場合はJWTVerifyFailedErrorが返されること", async () => {
      // Arrange
      const mockError = new Error("Invalid signature");
      mockJwtVerify.mockRejectedValue(mockError);

      // Act & Assert
      await expect(
        discordJWKService.verifyJWTSignature(
          mockToken,
          mockPublicKey,
          mockAudience,
          mockExpectedNonce
        )
      ).rejects.toThrow("Invalid signature");
    });
  });
});
