import type { Context } from "hono";
import { inject, injectable } from "inversify";
import type { JWTPayload } from "jose";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { TYPES } from "../../../infrastructure/config/types";
import { handleResult } from "../../../utils/ResultHelper";
import type { DiscordJWKServiceInterface } from "./DiscordJWKService";

/**
 * Discord トークン交換レスポンス
 */
export type DiscordToken = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
  id_token: string;
};

/**
 * Discord ID Tokenのペイロード
 *
 * MEMO:
 * JWT仕様（RFC 7519）とOpenID Connect仕様で定められた標準的なクレーム名になっているため、
 * 変更すると他のライブラリやサービスとの互換性が失われてしまうため、変更しないこと
 */
type DiscordIdTokenPayload = JWTPayload & {
  iss: string; // https://discord.com
  sub: string; // Discord User ID
  aud: string | string[]; // Discord Client ID (文字列または配列)
  exp: number; // Expiration time
  iat: number; // Issued at time
  auth_time?: number; // Authentication time (optional)
  nonce: string; // Nonce value
  at_hash?: string; // Access token hash
};

/**
 * Discord トークンサービスのインターフェース
 */
export interface DiscordTokenServiceInterface {
  exchangeCodeForTokens(
    c: Context,
    code: string,
    codeVerifier: string
  ): Promise<Result<DiscordToken, ExchangeCodeForTokensError>>;
  verifyIdToken(
    c: Context,
    idToken: string,
    expectedNonce: string
  ): Promise<Result<DiscordIdTokenPayload, VerifyIdTokenError>>;
}

/**
 * Discord トークンサービス
 *
 * Discord OAuth認証フローにおけるトークン関連の処理を担当する。
 * - OAuth2 トークン交換
 * - ID Token検証
 */
@injectable()
export class DiscordTokenService implements DiscordTokenServiceInterface {
  constructor(
    @inject(TYPES.DiscordJWKService)
    private readonly jwkService: DiscordJWKServiceInterface
  ) {}
  /**
   * Discord認証コードをアクセストークンに交換する
   *
   * 以下の処理を行う：
   * 1. Discord OAuth2 トークンエンドポイントにリクエスト送信
   * 2. PKCEのcode_verifierを使用した検証
   *
   * @param c - Honoコンテキスト（環境変数アクセス用）
   * @param code - Discord認証コード
   * @param codeVerifier - PKCE用のコード検証子
   * @returns トークン交換結果（成功時はトークン情報、失敗時はエラー）
   */
  async exchangeCodeForTokens(
    c: Context,
    code: string,
    codeVerifier: string
  ): Promise<Result<DiscordToken, ExchangeCodeForTokensError>> {
    const DISCORD_TOKEN_ENDPOINT = "https://discord.com/api/oauth2/token";

    const params = toTokenRequestURLSearchParams({
      clientID: c.env.DISCORD_CLIENT_ID,
      clientSecret: c.env.DISCORD_CLIENT_SECRET,
      code,
      redirectURI: `${c.env.BASE_URL}/api/auth/callback`,
      codeVerifier
    });

    const response = await fetch(DISCORD_TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });

    if (!response.ok)
      return err(
        new TokenExchangeFailedError(response.status, await response.text())
      );

    const data = (await response.json()) as DiscordToken;
    return ok(data);
  }

  /**
   * TODO: 絶対リファクタしろよ？？？？？
   * Discord ID Tokenを検証する
   *
   * 以下の処理を行う：
   * 1. JWTヘッダーからkidを取得
   * 2. Discord公開鍵を取得
   * 3. JWT署名を検証
   * 4. Issuer、Audience、Nonceを検証
   *
   * @param c - Honoコンテキスト（環境変数アクセス用）
   * @param idToken - 検証対象のID Token
   * @param expectedNonce - 期待するNonce値
   * @returns ID Token検証結果（成功時はペイロード、失敗時はエラー）
   */
  async verifyIdToken(
    c: Context,
    idToken: string,
    expectedNonce: string
  ): Promise<Result<DiscordIdTokenPayload, VerifyIdTokenError>> {
    // JWTヘッダーからkidを取得
    const header = handleResult(
      this.jwkService.decodeJWTHeader(idToken),
      (error) => new IdTokenVerificationFailedError(error)
    );

    // Discord公開鍵を取得
    const publicKeys = handleResult(
      await this.jwkService.getPublicKeys(),
      (error) => new IdTokenVerificationFailedError(error)
    );

    const publicKey = publicKeys.find((key) => key.kid === header.kid);
    if (!publicKey) {
      return err(
        new IdTokenVerificationFailedError(
          new Error(`Public key with kid ${header.kid} not found`)
        )
      );
    }

    // JWT署名を検証
    const jwtPayload = handleResult(
      await this.jwkService.verifyJWTSignature(
        idToken,
        publicKey,
        c.env.DISCORD_CLIENT_ID,
        expectedNonce
      ),
      (error) => new IdTokenVerificationFailedError(error)
    );

    return ok(jwtPayload as DiscordIdTokenPayload);
  }
}

/**
 * Discord OAuth2 トークンリクエストパラメータ
 */
type DiscordTokenRequestParams = {
  clientID: string;
  clientSecret: string;
  code: string;
  redirectURI: string;
  codeVerifier: string;
};

/**
 * Discord OAuth2 トークンリクエスト用のURLSearchParamsを構築する
 */
const toTokenRequestURLSearchParams = (
  params: DiscordTokenRequestParams
): URLSearchParams => {
  const searchParams = new URLSearchParams();

  searchParams.append("client_id", params.clientID);
  searchParams.append("client_secret", params.clientSecret);
  searchParams.append("grant_type", "authorization_code");
  searchParams.append("code", params.code);
  searchParams.append("redirect_uri", params.redirectURI);
  searchParams.append("code_verifier", params.codeVerifier);

  return searchParams;
};

type ExchangeCodeForTokensError = TokenExchangeFailedError;
type VerifyIdTokenError = IdTokenVerificationFailedError;

/**
 * Discord API呼び出しが失敗した場合のエラー
 */
class TokenExchangeFailedError extends Error {
  readonly name = this.constructor.name;
  constructor(
    public readonly statusCode: number,
    public readonly responseText: string
  ) {
    super(`Discord token exchange failed: ${statusCode} - ${responseText}`);
  }
}

/**
 * ID Token検証が失敗した場合のエラー
 */
class IdTokenVerificationFailedError extends Error {
  readonly name = this.constructor.name;
  constructor(error: Error) {
    super(`cause: ${error} `);
  }
}
