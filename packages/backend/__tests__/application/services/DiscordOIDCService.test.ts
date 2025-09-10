import type { Context } from "hono";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction
} from "vitest";
import {
  DiscordOIDCService,
  type DiscordIdTokenPayload,
  type DiscordJWK,
  type DiscordOIDCTokenResponse,
  type DiscordUserResource
} from "../../../src/application/services/discord-oidc";
import type { StateRepositoryInterface } from "../../../src/infrastructure/repositories/StateRepository";

// joseモジュールをモック
vi.mock("jose", () => ({
  decodeProtectedHeader: vi.fn(),
  jwtVerify: vi.fn(),
  importJWK: vi.fn()
}));

// Vitestのモック型定義
type MockedService<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? MockedFunction<T[K]>
    : T[K];
};

// テスト用定数
const MOCK_CLIENT_ID = "test_client_id";
const MOCK_CLIENT_SECRET = "test_client_secret";
const MOCK_BASE_URL = "https://api.test.com";
const MOCK_NONCE = "test_nonce";
const MOCK_CODE_VERIFIER = "test_code_verifier";
const MOCK_CODE = "test_authorization_code";
const MOCK_ACCESS_TOKEN = "test_access_token";
const MOCK_REFRESH_TOKEN = "test_refresh_token";
const MOCK_ID_TOKEN = "test_id_token";
const MOCK_USER_ID = "123456789012345678";
const MOCK_USERNAME = "testuser";
const MOCK_AVATAR = "avatar_hash";

// モック作成ファクトリー
const createMocks = () => ({
  stateRepository: {
    save: vi.fn(),
    findBy: vi.fn(),
    delete: vi.fn()
  } as MockedService<StateRepositoryInterface>,

  context: {
    env: {
      DISCORD_CLIENT_ID: MOCK_CLIENT_ID,
      DISCORD_CLIENT_SECRET: MOCK_CLIENT_SECRET,
      BASE_URL: MOCK_BASE_URL
    }
  } as Context
});

// fetch のモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Web Crypto API のモック
const mockCrypto = {
  getRandomValues: vi.fn((arr: Uint8Array) => {
    // 固定値で埋める（テスト用）
    for (let i = 0; i < arr.length; i++) {
      arr[i] = i % 256;
    }
    return arr;
  }),
  subtle: {
    digest: vi.fn(async () => {
      // SHA-256の固定ハッシュ値（テスト用）
      const hash = new ArrayBuffer(32);
      const view = new Uint8Array(hash);
      for (let i = 0; i < 32; i++) {
        view[i] = i;
      }
      return hash;
    })
  }
};

// cryptoのモック設定（読み取り専用プロパティに対応）
Object.defineProperty(globalThis, "crypto", {
  value: mockCrypto,
  writable: true,
  configurable: true
});

// @ts-ignore
if (typeof global !== "undefined") {
  Object.defineProperty(global, "crypto", {
    value: mockCrypto,
    writable: true,
    configurable: true
  });
}

// btoa のモック（Node.js環境用）
global.btoa = vi.fn((str: string) =>
  Buffer.from(str, "binary").toString("base64")
);

describe("DiscordOIDCService Tests", () => {
  let mocks: ReturnType<typeof createMocks>;
  let service: DiscordOIDCService;

  beforeEach(() => {
    mocks = createMocks();
    service = new DiscordOIDCService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("exchangeCodeForTokens", () => {
    const mockTokenResponse: DiscordOIDCTokenResponse = {
      access_token: MOCK_ACCESS_TOKEN,
      expires_in: 3600,
      refresh_token: MOCK_REFRESH_TOKEN,
      scope: "identify openid",
      token_type: "Bearer",
      id_token: MOCK_ID_TOKEN
    };

    it("正常にトークンを取得できること", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTokenResponse)
      });

      // Act
      const result = await service.exchangeCodeForTokens(
        mocks.context,
        MOCK_CODE,
        MOCK_CODE_VERIFIER
      );

      // Assert
      expect(result).toEqual(mockTokenResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://discord.com/api/oauth2/token",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: expect.any(URLSearchParams)
        })
      );

      const fetchCall = mockFetch.mock.calls[0];
      const body = fetchCall[1].body as URLSearchParams;
      expect(body.get("client_id")).toBe(MOCK_CLIENT_ID);
      expect(body.get("client_secret")).toBe(MOCK_CLIENT_SECRET);
      expect(body.get("grant_type")).toBe("authorization_code");
      expect(body.get("code")).toBe(MOCK_CODE);
      expect(body.get("code_verifier")).toBe(MOCK_CODE_VERIFIER);
    });

    it("Discord APIがエラーレスポンスを返した場合、例外が発生すること", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: vi.fn().mockResolvedValue("Invalid request")
      });

      // Act & Assert
      await expect(
        service.exchangeCodeForTokens(
          mocks.context,
          MOCK_CODE,
          MOCK_CODE_VERIFIER
        )
      ).rejects.toThrow("Discord token exchange failed: 400 Bad Request");
    });

    it("fetchでネットワークエラーが発生した場合、例外が発生すること", async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error("Network error"));

      // Act & Assert
      await expect(
        service.exchangeCodeForTokens(
          mocks.context,
          MOCK_CODE,
          MOCK_CODE_VERIFIER
        )
      ).rejects.toThrow("Network error");
    });
  });

  describe("refreshTokens", () => {
    const mockTokenResponse: DiscordOIDCTokenResponse = {
      access_token: "new_access_token",
      expires_in: 3600,
      refresh_token: "new_refresh_token",
      scope: "identify openid",
      token_type: "Bearer",
      id_token: "new_id_token"
    };

    it("正常にトークンをリフレッシュできること", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTokenResponse)
      });

      // Act
      const result = await service.refreshTokens(
        mocks.context,
        MOCK_REFRESH_TOKEN
      );

      // Assert
      expect(result).toEqual(mockTokenResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://discord.com/api/oauth2/token",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: expect.any(URLSearchParams)
        })
      );

      const fetchCall = mockFetch.mock.calls[0];
      const body = fetchCall[1].body as URLSearchParams;
      expect(body.get("grant_type")).toBe("refresh_token");
      expect(body.get("refresh_token")).toBe(MOCK_REFRESH_TOKEN);
    });

    it("無効なリフレッシュトークンの場合、例外が発生すること", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: vi.fn().mockResolvedValue("Invalid refresh token")
      });

      // Act & Assert
      await expect(
        service.refreshTokens(mocks.context, "invalid_token")
      ).rejects.toThrow("Discord token refresh failed: 401 Unauthorized");
    });
  });

  describe("getUserResource", () => {
    const mockUserResource: DiscordUserResource = {
      id: MOCK_USER_ID,
      username: MOCK_USERNAME,
      avatar: MOCK_AVATAR
    };

    it("正常にユーザー情報を取得できること", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockUserResource)
      });

      // Act
      const result = await service.getUserResource(
        mocks.context,
        MOCK_ACCESS_TOKEN
      );

      // Assert
      expect(result).toEqual(mockUserResource);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://discord.com/api/users/@me",
        {
          headers: {
            Authorization: `Bearer ${MOCK_ACCESS_TOKEN}`
          }
        }
      );
    });

    it("無効なアクセストークンの場合、例外が発生すること", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: vi.fn().mockResolvedValue("Invalid access token")
      });

      // Act & Assert
      await expect(
        service.getUserResource(mocks.context, "invalid_token")
      ).rejects.toThrow(
        "Discord user resource retrieval failed: 401 Unauthorized"
      );
    });
  });

  describe("revokeAccessToken", () => {
    it("正常にトークンを無効化できること", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true
      });

      // Act
      await service.revokeAccessToken(mocks.context, MOCK_ACCESS_TOKEN);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        "https://discord.com/api/oauth2/token/revoke",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: expect.any(URLSearchParams)
        })
      );

      const fetchCall = mockFetch.mock.calls[0];
      const body = fetchCall[1].body as URLSearchParams;
      expect(body.get("token")).toBe(MOCK_ACCESS_TOKEN);
      expect(body.get("token_type_hint")).toBe("access_token");
    });

    it("トークン無効化でエラーが発生した場合、例外が発生すること", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        text: vi.fn().mockResolvedValue("Invalid token")
      });

      // Act & Assert
      await expect(
        service.revokeAccessToken(mocks.context, MOCK_ACCESS_TOKEN)
      ).rejects.toThrow("Discord token revocation failed: 400 Bad Request");
    });
  });

  describe("getDiscordPublicKeys", () => {
    const mockJWKS = {
      keys: [
        {
          kty: "RSA",
          use: "sig",
          kid: "test_kid_1",
          n: "test_modulus",
          e: "AQAB",
          alg: "RS256"
        },
        {
          kty: "RSA",
          use: "sig",
          kid: "test_kid_2",
          n: "test_modulus_2",
          e: "AQAB",
          alg: "RS256"
        }
      ] as DiscordJWK[]
    };

    beforeEach(async () => {
      const { importJWK } = await import("jose");
      vi.mocked(importJWK).mockImplementation(async (jwk: any) => {
        const mockKey = { kid: jwk.kid, alg: jwk.alg };
        return mockKey as any;
      });
    });

    it("正常に公開鍵を取得してキャッシュできること", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockJWKS)
      });

      // Act
      const result = await service.getDiscordPublicKeys();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ kid: "test_kid_1", alg: "RS256" });
      expect(result[1]).toMatchObject({ kid: "test_kid_2", alg: "RS256" });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://discord.com/api/oauth2/keys"
      );
    });

    it("キャッシュされた公開鍵を再利用できること", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockJWKS)
      });

      // Act
      await service.getDiscordPublicKeys(); // 初回取得
      const result = await service.getDiscordPublicKeys(); // キャッシュから取得

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(1); // fetchは1回のみ
      expect(result).toHaveLength(2);
    });

    it("JWKS取得でエラーが発生した場合、例外が発生すること", async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error"
      });

      // Act & Assert
      await expect(service.getDiscordPublicKeys()).rejects.toThrow(
        "Could not retrieve Discord public keys"
      );
    });
  });

  describe("verifyIdToken", () => {
    const mockIdTokenPayload: DiscordIdTokenPayload = {
      iss: "https://discord.com",
      sub: MOCK_USER_ID,
      aud: MOCK_CLIENT_ID,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      nonce: MOCK_NONCE
    };

    beforeEach(async () => {
      const { decodeProtectedHeader, jwtVerify } = await import("jose");

      vi.mocked(decodeProtectedHeader).mockReturnValue({
        kid: "test_kid",
        alg: "RS256"
      });

      vi.mocked(jwtVerify).mockResolvedValue({
        payload: mockIdTokenPayload as any,
        protectedHeader: { kid: "test_kid", alg: "RS256" },
        key: {} as any
      });

      // getDiscordPublicKeysのモック
      vi.spyOn(service, "getDiscordPublicKeys").mockResolvedValue([
        { kid: "test_kid", alg: "RS256" }
      ]);
    });

    it("有効なIDトークンの場合、検証に成功すること", async () => {
      // Act
      const result = await service.verifyIdToken(
        mocks.context,
        MOCK_ID_TOKEN,
        MOCK_NONCE
      );

      // Assert
      expect(result).toEqual(mockIdTokenPayload);
      const { decodeProtectedHeader, jwtVerify } = await import("jose");
      expect(vi.mocked(decodeProtectedHeader)).toHaveBeenCalledWith(
        MOCK_ID_TOKEN
      );
      expect(vi.mocked(jwtVerify)).toHaveBeenCalledWith(
        MOCK_ID_TOKEN,
        { kid: "test_kid", alg: "RS256" },
        {
          issuer: "https://discord.com",
          audience: MOCK_CLIENT_ID,
          algorithms: ["RS256"]
        }
      );
    });

    it("kidが存在しない場合、例外が発生すること", async () => {
      // Arrange
      const { decodeProtectedHeader } = await import("jose");
      vi.mocked(decodeProtectedHeader).mockReturnValue({});

      // Act & Assert
      await expect(
        service.verifyIdToken(mocks.context, MOCK_ID_TOKEN, MOCK_NONCE)
      ).rejects.toThrow("Invalid ID token");
    });

    it("公開鍵が見つからない場合、例外が発生すること", async () => {
      // Arrange
      vi.spyOn(service, "getDiscordPublicKeys").mockResolvedValue([
        { kid: "different_kid", alg: "RS256" }
      ]);

      // Act & Assert
      await expect(
        service.verifyIdToken(mocks.context, MOCK_ID_TOKEN, MOCK_NONCE)
      ).rejects.toThrow("Invalid ID token");
    });

    it("nonceが一致しない場合、例外が発生すること", async () => {
      // Arrange
      const invalidPayload = {
        ...mockIdTokenPayload,
        nonce: "different_nonce"
      };
      const { jwtVerify } = await import("jose");
      vi.mocked(jwtVerify).mockResolvedValue({
        payload: invalidPayload as any,
        protectedHeader: { kid: "test_kid", alg: "RS256" },
        key: {} as any
      });

      // Act & Assert
      await expect(
        service.verifyIdToken(mocks.context, MOCK_ID_TOKEN, MOCK_NONCE)
      ).rejects.toThrow("Invalid ID token");
    });

    it("audienceが配列の場合でも正常に検証できること", async () => {
      // Arrange
      const payloadWithArrayAud = {
        ...mockIdTokenPayload,
        aud: [MOCK_CLIENT_ID, "other_client_id"]
      };
      const { jwtVerify } = await import("jose");
      vi.mocked(jwtVerify).mockResolvedValue({
        payload: payloadWithArrayAud as any,
        protectedHeader: { kid: "test_kid", alg: "RS256" },
        key: {} as any
      });

      // Act
      const result = await service.verifyIdToken(
        mocks.context,
        MOCK_ID_TOKEN,
        MOCK_NONCE
      );

      // Assert
      expect(result).toEqual(payloadWithArrayAud);
    });

    it("audienceが一致しない場合、例外が発生すること", async () => {
      // Arrange
      const invalidPayload = {
        ...mockIdTokenPayload,
        aud: "different_client_id"
      };
      const { jwtVerify } = await import("jose");
      vi.mocked(jwtVerify).mockResolvedValue({
        payload: invalidPayload as any,
        protectedHeader: { kid: "test_kid", alg: "RS256" },
        key: {} as any
      });

      // Act & Assert
      await expect(
        service.verifyIdToken(mocks.context, MOCK_ID_TOKEN, MOCK_NONCE)
      ).rejects.toThrow("Invalid ID token");
    });
  });
});
