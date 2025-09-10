import type { Context } from "hono";
import { injectable } from "inversify";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

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
 * Discord トークンサービスのインターフェース
 */
export interface DiscordTokenServiceInterface {
  exchangeCodeForTokens(
    c: Context,
    code: string,
    codeVerifier: string
  ): Promise<Result<DiscordToken, ExchangeCodeForTokensError>>;
}

/**
 * Discord トークンサービス
 *
 * Discord OAuth認証フローにおけるトークン関連の処理を担当する。
 */
@injectable()
export class DiscordTokenService implements DiscordTokenServiceInterface {
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
