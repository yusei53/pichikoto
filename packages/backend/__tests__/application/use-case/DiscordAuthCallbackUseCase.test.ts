import type { Context } from "hono";
import { err, ok } from "neverthrow";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as schema from "../../../database/schema";
import type { DiscordOAuthFlowServiceInterface } from "../../../src/application/services/discord-auth/DiscordOAuthFlowService";
import type {
  DiscordToken,
  DiscordTokenServiceInterface
} from "../../../src/application/services/discord-auth/DiscordTokenService";
import type {
  DiscordUserResource,
  DiscordUserServiceInterface
} from "../../../src/application/services/discord-auth/DiscordUserService";
import type { JwtGenerateServiceInterface } from "../../../src/application/services/jwt/JwtGenerateService";
import { DiscordAuthCallbackUseCase } from "../../../src/application/use-case/discord-auth/DiscordAuthCallbackUseCase";
import { DiscordUserID } from "../../../src/domain/user/User";
import { DiscordTokensRepository } from "../../../src/infrastructure/repositories/DiscordTokensRepository";
import { UserRepository } from "../../../src/infrastructure/repositories/UserRepository";
import { createDiscordTokensTableFixture } from "../../testing/table_fixture/DiscordTokensTableFixture";
import { createOauthStateTableFixture } from "../../testing/table_fixture/OauthStateTableFixture";
import { createUserTableFixture } from "../../testing/table_fixture/UserTableFixture";
import {
  deleteFromDatabase,
  insertToDatabase
} from "../../testing/utils/GenericTableHelper";

// モック定数
const MOCK_CLIENT_ID = "test_client_id";
const MOCK_CLIENT_SECRET = "test_client_secret";
const MOCK_BASE_URL = "https://api.test.com";
const MOCK_JWT_SECRET = "test_jwt_secret";

const MOCK_CODE = "test_authorization_code";
const MOCK_STATE = "test_state";
const MOCK_SESSION_ID = "test_session_id";
const MOCK_NONCE = "test_nonce";
const MOCK_CODE_VERIFIER = "test_code_verifier";

const MOCK_DISCORD_USER_ID = "123456789012345678";
const MOCK_USERNAME = "test_user";
const MOCK_AVATAR = "avatar_hash";

const mockContext: Context = {
  env: {
    DISCORD_CLIENT_ID: MOCK_CLIENT_ID,
    DISCORD_CLIENT_SECRET: MOCK_CLIENT_SECRET,
    BASE_URL: MOCK_BASE_URL,
    JWT_SECRET: MOCK_JWT_SECRET
  }
} as Context;

const mockDiscordToken: DiscordToken = {
  access_token: "mock_access_token",
  refresh_token: "mock_refresh_token",
  expires_in: 3600,
  scope: "identify openid",
  token_type: "Bearer",
  id_token: "mock_id_token"
};

const mockIdTokenPayload = {
  iss: "https://discord.com",
  sub: MOCK_DISCORD_USER_ID,
  aud: MOCK_CLIENT_ID,
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000),
  nonce: MOCK_NONCE
};

const mockDiscordUserResource: DiscordUserResource = {
  id: MOCK_DISCORD_USER_ID,
  username: MOCK_USERNAME,
  avatar: MOCK_AVATAR
};

describe("DiscordAuthCallbackUseCase Tests", () => {
  // 実際のリポジトリインスタンスを使用
  const userRepository = new UserRepository();
  const discordTokensRepository = new DiscordTokensRepository();

  // サービスのモック
  const mockOAuthFlowService = {
    verifyStateBySessionID: vi.fn()
  };

  const mockDiscordTokenService = {
    exchangeCodeForTokens: vi.fn(),
    verifyIdToken: vi.fn()
  };

  const mockDiscordUserService = {
    getUserResource: vi.fn()
  };

  const mockJwtGenerateService = {
    execute: vi.fn()
  };

  const discordAuthCallbackUseCase = new DiscordAuthCallbackUseCase(
    mockOAuthFlowService as DiscordOAuthFlowServiceInterface,
    mockDiscordTokenService as DiscordTokenServiceInterface,
    mockDiscordUserService as DiscordUserServiceInterface,
    userRepository,
    discordTokensRepository,
    mockJwtGenerateService as unknown as JwtGenerateServiceInterface
  );

  // 共通のテストデータ
  let userFixture: ReturnType<typeof createUserTableFixture>;
  let discordTokensFixture: ReturnType<typeof createDiscordTokensTableFixture>;
  let stateFixture: ReturnType<typeof createOauthStateTableFixture>;

  beforeEach(async () => {
    mockOAuthFlowService.verifyStateBySessionID.mockResolvedValue(
      ok({ nonce: MOCK_NONCE, codeVerifier: MOCK_CODE_VERIFIER })
    );
    mockDiscordTokenService.exchangeCodeForTokens.mockResolvedValue(
      ok(mockDiscordToken)
    );
    mockDiscordTokenService.verifyIdToken.mockResolvedValue(
      ok(mockIdTokenPayload)
    );
    mockDiscordUserService.getUserResource.mockResolvedValue(
      ok(mockDiscordUserResource)
    );
    mockJwtGenerateService.execute.mockResolvedValue(
      ok({
        accessToken: "jwt_access_token",
        refreshToken: "jwt_refresh_token"
      })
    );

    // 共通のテストデータ準備
    stateFixture = createOauthStateTableFixture();
    stateFixture.sessionId = MOCK_SESSION_ID;
    stateFixture.state = MOCK_STATE;
    stateFixture.nonce = MOCK_NONCE;
    stateFixture.codeVerifier = MOCK_CODE_VERIFIER;
    await insertToDatabase(schema.oauthState, stateFixture);
  });

  afterEach(async () => {
    await deleteFromDatabase(schema.discordTokens);
    await deleteFromDatabase(schema.user);
    await deleteFromDatabase(schema.oauthState);
  });

  describe("execute", () => {
    /**
     * 正常ケース：既存ユーザーの認証成功のテストケース
     *
     * @description 既存ユーザーがDiscord認証を行い、正常にJWTトークンが発行されることを確認
     *
     * Arrange
     * - 既存ユーザーとDiscordトークンをDBに保存
     * - OAuth stateをDBに保存
     * - 各サービスのモックを成功レスポンスに設定
     *
     * Act
     * - DiscordAuthCallbackUseCaseのexecuteメソッド実行
     *
     * Assert
     * - 正常なAuthPayloadDTOの返却確認
     * - 各サービスメソッドの適切な呼び出し確認
     * - 返却されるユーザー情報の正確性確認
     */
    it("既存ユーザーの場合、正常にJWTトークンが発行されること", async () => {
      // Arrange
      userFixture = createUserTableFixture();
      userFixture.discordUserId = MOCK_DISCORD_USER_ID;
      await insertToDatabase(schema.user, userFixture);

      discordTokensFixture = createDiscordTokensTableFixture(
        userFixture.discordUserId
      );
      await insertToDatabase(schema.discordTokens, discordTokensFixture);

      const expected = {
        accessToken: "jwt_access_token",
        refreshToken: "jwt_refresh_token"
      };

      // Act
      const result = await discordAuthCallbackUseCase.execute(
        mockContext,
        MOCK_CODE,
        MOCK_STATE,
        MOCK_SESSION_ID
      );

      // Assert
      expect(result).toMatchObject(expected);

      const persistedUser = await userRepository.findBy(
        DiscordUserID.from(MOCK_DISCORD_USER_ID)
      );
      expect(persistedUser).not.toBeNull();
      expect(persistedUser?.discordUserName).toBe(userFixture.discordUserName);
    });

    /**
     * 正常ケース：新規ユーザーの認証成功のテストケース
     *
     * @description 新規ユーザーがDiscord認証を行い、ユーザー作成とJWTトークン発行が正常に行われることを確認
     *
     * Arrange
     * - OAuth stateをDBに保存
     * - 各サービスのモックを成功レスポンスに設定
     *
     * Act
     * - DiscordAuthCallbackUseCaseのexecuteメソッド実行
     *
     * Assert
     * - 正常なAuthPayloadDTOの返却確認
     * - 新規ユーザーとDiscordトークンのDB保存確認
     * - 返却されるユーザー情報の正確性確認
     */
    it("新規ユーザーの場合、ユーザー作成とJWTトークン発行が正常に行われること", async () => {
      // Arrange
      const expected = {
        accessToken: "jwt_access_token",
        refreshToken: "jwt_refresh_token"
      };

      // Act
      const result = await discordAuthCallbackUseCase.execute(
        mockContext,
        MOCK_CODE,
        MOCK_STATE,
        MOCK_SESSION_ID
      );

      // Assert
      expect(result).toMatchObject(expected);

      const savedUser = await userRepository.findBy(
        DiscordUserID.from(MOCK_DISCORD_USER_ID)
      );
      expect(savedUser).not.toBeNull();
      expect(savedUser?.discordUserName).toBe(MOCK_USERNAME);
      expect(savedUser?.discordAvatar).toBe(MOCK_AVATAR);

      const savedTokens = savedUser
        ? await discordTokensRepository.findBy(savedUser.discordUserID)
        : null;
      expect(savedTokens).not.toBeNull();
    });

    /**
     * 異常ケース：State未発見エラーの詳細検証テストケース
     *
     * @description セッションIDに対応するStateレコードが見つからない場合のエラー詳細を検証
     */
    it("Stateレコードが見つからない場合、StateNotFoundErrorの詳細が正しく設定されること", async () => {
      // Arrange
      const stateNotFoundError = new Error(
        `State record not found for sessionID: ${MOCK_SESSION_ID}`
      );
      stateNotFoundError.name = "StateNotFoundError";
      mockOAuthFlowService.verifyStateBySessionID.mockResolvedValue(
        err(stateNotFoundError)
      );

      // Act & Assert
      await expect(
        discordAuthCallbackUseCase.execute(
          mockContext,
          MOCK_CODE,
          MOCK_STATE,
          MOCK_SESSION_ID
        )
      ).rejects.toThrowError(
        `DiscordAuthCallbackUseCaseError(cause: StateNotFoundError: State record not found for sessionID: ${MOCK_SESSION_ID})`
      );
    });

    /**
     * 異常ケース：トークン交換失敗の詳細検証テストケース（400エラー）
     *
     * @description 無効な認証コードでトークン交換が失敗した場合のエラー詳細を検証
     */
    it("無効な認証コードでトークン交換が失敗した場合、TokenExchangeFailedErrorの詳細が正しく設定されること", async () => {
      // Arrange
      const statusCode = 400;
      const responseText =
        '{"error":"invalid_grant","error_description":"Invalid authorization code"}';
      const tokenExchangeError = new Error(
        `Discord token exchange failed: ${statusCode} - ${responseText}`
      );
      tokenExchangeError.name = "TokenExchangeFailedError";
      mockDiscordTokenService.exchangeCodeForTokens.mockResolvedValue(
        err(tokenExchangeError)
      );

      // Act & Assert
      await expect(
        discordAuthCallbackUseCase.execute(
          mockContext,
          MOCK_CODE,
          MOCK_STATE,
          MOCK_SESSION_ID
        )
      ).rejects.toThrowError(
        `DiscordAuthCallbackUseCaseError(cause: TokenExchangeFailedError: Discord token exchange failed: ${statusCode} - ${responseText})`
      );
    });

    /**
     * 異常ケース：ID Token検証失敗の詳細検証テストケース（JWT署名検証失敗）
     *
     * @description JWT署名検証が失敗した場合のエラー詳細を検証
     */
    it("JWT署名検証が失敗した場合、IdTokenVerificationFailedErrorの詳細が正しく設定されること", async () => {
      // Arrange
      const verificationMessage =
        "JWT signature verification failed: Invalid signature";
      const idTokenError = new Error(
        `ID token verification failed: ${verificationMessage} `
      );
      idTokenError.name = "IdTokenVerificationFailedError";
      mockDiscordTokenService.verifyIdToken.mockResolvedValue(
        err(idTokenError)
      );

      // Act & Assert
      await expect(
        discordAuthCallbackUseCase.execute(
          mockContext,
          MOCK_CODE,
          MOCK_STATE,
          MOCK_SESSION_ID
        )
      ).rejects.toThrowError(
        `DiscordAuthCallbackUseCaseError(cause: IdTokenVerificationFailedError: ID token verification failed: ${verificationMessage} )`
      );
    });

    /**
     * 異常ケース：ユーザー情報取得失敗の詳細検証テストケース（401エラー）
     *
     * @description 無効なアクセストークンでユーザー情報取得が失敗した場合のエラー詳細を検証
     */
    it("無効なアクセストークンでユーザー情報取得が失敗した場合、UserResourceRetrievalFailedErrorの詳細が正しく設定されること", async () => {
      // Arrange
      const statusCode = 401;
      const responseText = '{"message": "401: Unauthorized", "code": 0}';
      const userResourceError = new Error(
        `Discord user resource retrieval failed: ${statusCode} - ${responseText}`
      );
      userResourceError.name = "UserResourceRetrievalFailedError";
      mockDiscordUserService.getUserResource.mockResolvedValue(
        err(userResourceError)
      );

      // Act & Assert
      await expect(
        discordAuthCallbackUseCase.execute(
          mockContext,
          MOCK_CODE,
          MOCK_STATE,
          MOCK_SESSION_ID
        )
      ).rejects.toThrowError(
        `DiscordAuthCallbackUseCaseError(cause: UserResourceRetrievalFailedError: Discord user resource retrieval failed: ${statusCode} - ${responseText})`
      );
    });

    /**
     * 異常ケース：ユーザーID不一致のテストケース
     *
     * @description ID TokenのsubとDiscord APIから取得したユーザーIDが一致しない場合のエラー確認
     */
    it("ID TokenのsubとDiscord APIのユーザーIDが一致しない場合、エラーが発生すること", async () => {
      // Arrange
      const differentUserResource: DiscordUserResource = {
        id: "different_user_id",
        username: MOCK_USERNAME,
        avatar: MOCK_AVATAR
      };
      mockDiscordUserService.getUserResource.mockResolvedValue(
        ok(differentUserResource)
      );

      // Act & Assert
      await expect(
        discordAuthCallbackUseCase.execute(
          mockContext,
          MOCK_CODE,
          MOCK_STATE,
          MOCK_SESSION_ID
        )
      ).rejects.toThrow("User ID mismatch between ID token and API response");
    });

    /**
     * 異常ケース：既存ユーザーのDiscordTokensが見つからない場合のテストケース
     *
     * @description 既存ユーザーが存在するがDiscordTokensが見つからない場合のエラー確認
     */
    it("既存ユーザーのDiscordTokensが見つからない場合、エラーが発生すること", async () => {
      // Arrange
      userFixture = createUserTableFixture();
      userFixture.discordUserId = MOCK_DISCORD_USER_ID;
      await insertToDatabase(schema.user, userFixture);
      // DiscordTokensは保存しない

      // Act & Assert
      await expect(
        discordAuthCallbackUseCase.execute(
          mockContext,
          MOCK_CODE,
          MOCK_STATE,
          MOCK_SESSION_ID
        )
      ).rejects.toThrow("DiscordTokens not found");
    });
  });
});
