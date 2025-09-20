import type { Context } from "hono";
import { inject } from "inversify";
import { TYPES } from "../../../di-container/types";
import type { StateRepositoryInterface } from "../../../infrastructure/repositories/StateRepository";

/** Discord OAuth 2.0認証エンドポイントのベースURL */
const DISCORD_OAUTH_BASE_URL = "https://discord.com/oauth2/authorize";

type DiscordAuthInitiateUseCaseResult = {
  authURL: string;
  sessionID: string;
};

export interface DiscordAuthInitiateUseCaseInterface {
  execute(c: Context): Promise<DiscordAuthInitiateUseCaseResult>;
}

/**
 * Discord OAuth 2.0 + PKCE + OpenID Connect認証を開始するユースケース
 *
 * このクラスは以下の処理を行います：
 * 1. セキュアなランダム値（sessionID, state, nonce, codeVerifier）の生成
 * 2. PKCE用のcodeChallenge生成
 * 3. 認証状態の永続化（15分間の有効期限付き）
 * 4. Discord認証URLの構築
 *
 * セキュリティ対策：
 * - CSRF攻撃対策（state parameter）
 * - リプレイ攻撃対策（nonce）
 * - 認可コード横取り攻撃対策（PKCE）
 */
export class DiscordAuthInitiateUseCase
  implements DiscordAuthInitiateUseCaseInterface
{
  constructor(
    @inject(TYPES.StateRepository)
    private readonly stateRepository: StateRepositoryInterface
  ) {}

  async execute(c: Context): Promise<DiscordAuthInitiateUseCaseResult> {
    const sessionID = this.generateSecureRandomString(32);
    const state = this.generateSecureRandomString(32);
    const nonce = this.generateSecureRandomString(32);
    const codeVerifier = this.generateSecureRandomString(64);
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    // stateパラメータにsessionIDをエンコードして含める
    const encodedState = Buffer.from(`${sessionID}:${state}`).toString(
      "base64url"
    );

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15分間有効
    await this.stateRepository.save(
      sessionID,
      state,
      nonce,
      codeVerifier,
      expiresAt
    );

    const params = new URLSearchParams();
    params.append("client_id", c.env.DISCORD_CLIENT_ID);
    params.append("response_type", "code");
    params.append(
      "redirect_uri",
      `${c.env.FRONTEND_BASE_URL}/auth/callback/discord`
    );
    params.append("scope", "identify openid");
    params.append("state", encodedState); // エンコードされたstateを使用
    params.append("nonce", nonce);
    params.append("code_challenge", codeChallenge);
    params.append("code_challenge_method", "S256");

    const authURL = `${DISCORD_OAUTH_BASE_URL}?${params.toString()}`;
    return { authURL, sessionID };
  }

  /** 暗号学的に安全なランダム文字列を生成する */
  private generateSecureRandomString(length: number): string {
    const bytes = new Uint8Array(length);

    // TODO: ts-ignoreを剥がす
    // @ts-ignore
    (globalThis.crypto || crypto).getRandomValues(bytes);
    const base64url = (arr: Uint8Array) =>
      btoa(String.fromCharCode(...arr))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    return base64url(bytes).slice(0, length);
  }

  /** PKCE用のコードチャレンジを生成する */
  private async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const enc = new TextEncoder();
    const data = enc.encode(codeVerifier);

    // TODO: ts-ignoreを剥がす
    // @ts-ignore
    const digest = await (globalThis.crypto || crypto).subtle.digest(
      "SHA-256",
      data
    );
    const bytes = new Uint8Array(digest as ArrayBuffer);
    const base64url = (arr: Uint8Array) =>
      btoa(String.fromCharCode(...arr))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    return base64url(bytes);
  }
}
