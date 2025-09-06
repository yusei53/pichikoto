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
import type {
  DiscordIdTokenPayload,
  DiscordOIDCServiceInterface,
  DiscordOIDCTokenResponse,
  DiscordUserResource
} from "../../../src/application/services/discord-oidc";
import type { JwtServiceInterface } from "../../../src/application/services/jwt";
import { AuthUsecase } from "../../../src/application/use-case/discord-auth/DiscordAuthUseCase";
import {
  AccessToken,
  DiscordTokens,
  ExpiresAt,
  RefreshToken
} from "../../../src/domain/discord-tokens/DiscordTokens";
import { DiscordID, User, UserID } from "../../../src/domain/user/User";
import type { DiscordTokensRepositoryInterface } from "../../../src/infrastructure/repositories/DiscordTokensRepository";
import type { UserRepositoryInterface } from "../../../src/infrastructure/repositories/UserRepository";
import { UUID } from "../../../src/utils/UUID";

type MockedService<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? MockedFunction<T[K]>
    : T[K];
};

describe("AuthUsecase Tests", () => {
  let authUsecase: AuthUsecase;
  let mockDiscordOIDCService: MockedService<DiscordOIDCServiceInterface>;
  let mockUserRepository: MockedService<UserRepositoryInterface>;
  let mockDiscordTokensRepository: MockedService<DiscordTokensRepositoryInterface>;
  let mockJwtService: MockedService<JwtServiceInterface>;
  let mockContext: Context;

  const MOCK_USER_ID = UUID.new().value;
  const MOCK_DISCORD_ID = "123456789012345678";
  const MOCK_CODE = "auth_code_12345";
  const MOCK_STATE = "state_12345";
  const MOCK_SESSION_ID = "session_12345";
  const MOCK_NONCE = "nonce_12345";
  const MOCK_CODE_VERIFIER = "code_verifier_12345";
  const MOCK_ACCESS_TOKEN = "access_token_12345";
  const MOCK_REFRESH_TOKEN = "refresh_token_12345";
  const MOCK_ID_TOKEN = "id_token_12345";
  const MOCK_JWT_ACCESS_TOKEN = "jwt_access_token_12345";
  const MOCK_JWT_REFRESH_TOKEN = "jwt_refresh_token_12345";

  beforeEach(() => {
    // モック作成
    mockDiscordOIDCService = {
      generateAuthUrl: vi.fn(),
      exchangeCodeForTokens: vi.fn(),
      refreshTokens: vi.fn(),
      getUserResource: vi.fn(),
      revokeAccessToken: vi.fn(),
      verifyIdToken: vi.fn(),
      getDiscordPublicKeys: vi.fn(),
      verifyStateBySessionId: vi.fn()
    };

    mockUserRepository = {
      findBy: vi.fn(),
      save: vi.fn()
    };

    mockDiscordTokensRepository = {
      findBy: vi.fn(),
      save: vi.fn()
    };

    mockJwtService = {
      generateTokens: vi.fn(),
      verify: vi.fn(),
      refreshAccessToken: vi.fn()
    };

    mockContext = {} as Context;

    // AuthUsecaseのインスタンス作成
    authUsecase = new AuthUsecase(
      mockDiscordOIDCService,
      mockUserRepository,
      mockDiscordTokensRepository,
      mockJwtService
    );

    // UserID.newのモック設定
    vi.spyOn(UserID, "new").mockReturnValue(
      new (class {
        constructor(public readonly value: UUID) {}
      })(UUID.from(MOCK_USER_ID))
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("callback", () => {
    const mockTokenResponse: DiscordOIDCTokenResponse = {
      access_token: MOCK_ACCESS_TOKEN,
      refresh_token: MOCK_REFRESH_TOKEN,
      id_token: MOCK_ID_TOKEN,
      expires_in: 3600,
      scope: "identify",
      token_type: "Bearer"
    };

    const mockIdTokenPayload: DiscordIdTokenPayload = {
      sub: MOCK_DISCORD_ID,
      iss: "https://discord.com",
      aud: "client_id",
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      nonce: MOCK_NONCE
    };

    const mockDiscordUserResource: DiscordUserResource = {
      id: MOCK_DISCORD_ID,
      username: "testuser",
      avatar: "avatar_hash"
    };

    describe("正常系", () => {
      beforeEach(() => {
        // 共通のモック設定
        mockDiscordOIDCService.verifyStateBySessionId.mockResolvedValue({
          valid: true,
          nonce: MOCK_NONCE,
          codeVerifier: MOCK_CODE_VERIFIER
        });

        mockDiscordOIDCService.exchangeCodeForTokens.mockResolvedValue(
          mockTokenResponse
        );
        mockDiscordOIDCService.verifyIdToken.mockResolvedValue(
          mockIdTokenPayload
        );
        mockDiscordOIDCService.getUserResource.mockResolvedValue(
          mockDiscordUserResource
        );

        mockJwtService.generateTokens.mockResolvedValue({
          accessToken: MOCK_JWT_ACCESS_TOKEN,
          refreshToken: MOCK_JWT_REFRESH_TOKEN
        });
      });

      it("新規ユーザーの場合、ユーザーとDiscordTokensを作成し、認証情報を返すこと", async () => {
        // arrange
        mockUserRepository.findBy.mockResolvedValue(null);

        // act
        const result = await authUsecase.callback(
          mockContext,
          MOCK_CODE,
          MOCK_STATE,
          MOCK_SESSION_ID
        );

        // assert
        expect(
          mockDiscordOIDCService.verifyStateBySessionId
        ).toHaveBeenCalledWith(mockContext, MOCK_SESSION_ID, MOCK_STATE);
        expect(
          mockDiscordOIDCService.exchangeCodeForTokens
        ).toHaveBeenCalledWith(mockContext, MOCK_CODE, MOCK_CODE_VERIFIER);
        expect(mockDiscordOIDCService.verifyIdToken).toHaveBeenCalledWith(
          mockContext,
          MOCK_ID_TOKEN,
          MOCK_NONCE
        );
        expect(mockDiscordOIDCService.getUserResource).toHaveBeenCalledWith(
          mockContext,
          MOCK_ACCESS_TOKEN
        );
        expect(mockUserRepository.findBy).toHaveBeenCalledWith(
          DiscordID.from(MOCK_DISCORD_ID)
        );
        expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
        expect(mockDiscordTokensRepository.save).toHaveBeenCalledTimes(1);
        expect(mockJwtService.generateTokens).toHaveBeenCalledWith(
          mockContext,
          MOCK_USER_ID
        );

        expect(result).toEqual({
          user: {
            id: MOCK_USER_ID,
            discordUserName: mockDiscordUserResource.username,
            discordAvatar: mockDiscordUserResource.avatar,
            faculty: "",
            department: ""
          },
          accessToken: MOCK_JWT_ACCESS_TOKEN,
          refreshToken: MOCK_JWT_REFRESH_TOKEN
        });
      });

      it("既存ユーザーの場合、新しいJWTトークンを生成して認証情報を返すこと", async () => {
        // arrange
        const existingUser = User.reconstruct(
          UserID.from(MOCK_USER_ID),
          DiscordID.from(MOCK_DISCORD_ID),
          mockDiscordUserResource.username,
          mockDiscordUserResource.avatar,
          null,
          null
        );

        const existingDiscordTokens = DiscordTokens.reconstruct(
          UserID.from(MOCK_USER_ID),
          AccessToken.from("existing_access_token"),
          RefreshToken.from("existing_refresh_token"),
          ExpiresAt.new(3600),
          "identify",
          "Bearer"
        );

        mockUserRepository.findBy.mockResolvedValue(existingUser);
        mockDiscordTokensRepository.findBy.mockResolvedValue(
          existingDiscordTokens
        );

        // act
        const result = await authUsecase.callback(
          mockContext,
          MOCK_CODE,
          MOCK_STATE,
          MOCK_SESSION_ID
        );

        // assert
        expect(mockUserRepository.findBy).toHaveBeenCalledWith(
          DiscordID.from(MOCK_DISCORD_ID)
        );
        expect(mockDiscordTokensRepository.findBy).toHaveBeenCalledWith(
          existingUser.userID
        );
        expect(mockUserRepository.save).not.toHaveBeenCalled();
        expect(mockDiscordTokensRepository.save).not.toHaveBeenCalled();
        expect(mockJwtService.generateTokens).toHaveBeenCalledWith(
          mockContext,
          MOCK_USER_ID
        );

        expect(result).toEqual({
          user: {
            id: MOCK_USER_ID,
            discordUserName: existingUser.discordUserName,
            discordAvatar: existingUser.discordAvatar,
            faculty: "",
            department: ""
          },
          accessToken: MOCK_JWT_ACCESS_TOKEN,
          refreshToken: MOCK_JWT_REFRESH_TOKEN
        });
      });
    });

    describe("異常系", () => {
      it("stateパラメータが無効な場合、エラーを投げること", async () => {
        // arrange
        mockDiscordOIDCService.verifyStateBySessionId.mockResolvedValue({
          valid: false
        });

        // act & assert
        await expect(
          authUsecase.callback(
            mockContext,
            MOCK_CODE,
            MOCK_STATE,
            MOCK_SESSION_ID
          )
        ).rejects.toThrow("Invalid or expired state parameter");

        expect(
          mockDiscordOIDCService.verifyStateBySessionId
        ).toHaveBeenCalledWith(mockContext, MOCK_SESSION_ID, MOCK_STATE);
        expect(
          mockDiscordOIDCService.exchangeCodeForTokens
        ).not.toHaveBeenCalled();
      });

      it("nonceが存在しない場合、エラーを投げること", async () => {
        // arrange
        mockDiscordOIDCService.verifyStateBySessionId.mockResolvedValue({
          valid: true,
          codeVerifier: MOCK_CODE_VERIFIER
        });

        // act & assert
        await expect(
          authUsecase.callback(
            mockContext,
            MOCK_CODE,
            MOCK_STATE,
            MOCK_SESSION_ID
          )
        ).rejects.toThrow("Invalid or expired state parameter");
      });

      it("codeVerifierが存在しない場合、エラーを投げること", async () => {
        // arrange
        mockDiscordOIDCService.verifyStateBySessionId.mockResolvedValue({
          valid: true,
          nonce: MOCK_NONCE
        });

        // act & assert
        await expect(
          authUsecase.callback(
            mockContext,
            MOCK_CODE,
            MOCK_STATE,
            MOCK_SESSION_ID
          )
        ).rejects.toThrow("Invalid or expired state parameter");
      });

      it("IDトークンが取得できない場合、エラーを投げること", async () => {
        // arrange
        mockDiscordOIDCService.verifyStateBySessionId.mockResolvedValue({
          valid: true,
          nonce: MOCK_NONCE,
          codeVerifier: MOCK_CODE_VERIFIER
        });

        const tokenResponseWithoutIdToken = {
          access_token: MOCK_ACCESS_TOKEN,
          refresh_token: MOCK_REFRESH_TOKEN,
          expires_in: 3600,
          scope: "identify",
          token_type: "Bearer"
        };
        mockDiscordOIDCService.exchangeCodeForTokens.mockResolvedValue(
          tokenResponseWithoutIdToken as any
        );

        // act & assert
        await expect(
          authUsecase.callback(
            mockContext,
            MOCK_CODE,
            MOCK_STATE,
            MOCK_SESSION_ID
          )
        ).rejects.toThrow("ID token not received from Discord OIDC");
      });

      it("IDトークンとAPI応答でユーザーIDが一致しない場合、エラーを投げること", async () => {
        // arrange
        mockDiscordOIDCService.verifyStateBySessionId.mockResolvedValue({
          valid: true,
          nonce: MOCK_NONCE,
          codeVerifier: MOCK_CODE_VERIFIER
        });

        mockDiscordOIDCService.exchangeCodeForTokens.mockResolvedValue(
          mockTokenResponse
        );
        mockDiscordOIDCService.verifyIdToken.mockResolvedValue(
          mockIdTokenPayload
        );

        const mismatchedUserResource = {
          ...mockDiscordUserResource,
          id: "different_user_id"
        };
        mockDiscordOIDCService.getUserResource.mockResolvedValue(
          mismatchedUserResource
        );

        // act & assert
        await expect(
          authUsecase.callback(
            mockContext,
            MOCK_CODE,
            MOCK_STATE,
            MOCK_SESSION_ID
          )
        ).rejects.toThrow("User ID mismatch between ID token and API response");
      });

      it("既存ユーザーのDiscordTokensが見つからない場合、エラーを投げること", async () => {
        // arrange
        mockDiscordOIDCService.verifyStateBySessionId.mockResolvedValue({
          valid: true,
          nonce: MOCK_NONCE,
          codeVerifier: MOCK_CODE_VERIFIER
        });

        mockDiscordOIDCService.exchangeCodeForTokens.mockResolvedValue(
          mockTokenResponse
        );
        mockDiscordOIDCService.verifyIdToken.mockResolvedValue(
          mockIdTokenPayload
        );
        mockDiscordOIDCService.getUserResource.mockResolvedValue(
          mockDiscordUserResource
        );

        const existingUser = User.reconstruct(
          UserID.from(MOCK_USER_ID),
          DiscordID.from(MOCK_DISCORD_ID),
          mockDiscordUserResource.username,
          mockDiscordUserResource.avatar,
          null,
          null
        );

        mockUserRepository.findBy.mockResolvedValue(existingUser);
        mockDiscordTokensRepository.findBy.mockResolvedValue(null);

        // act & assert
        await expect(
          authUsecase.callback(
            mockContext,
            MOCK_CODE,
            MOCK_STATE,
            MOCK_SESSION_ID
          )
        ).rejects.toThrow("DiscordTokens not found");
      });
    });
  });
});
