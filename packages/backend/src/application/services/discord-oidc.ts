import type { Context } from "hono";
import { injectable } from "inversify";
import * as jose from "jose";

export interface DiscordOIDCServiceInterface {
  verifyIdToken(c: Context, idToken: string): Promise<DiscordIdTokenPayload>;
  getDiscordPublicKeys(): Promise<any[]>;
}

@injectable()
export class DiscordOIDCService implements DiscordOIDCServiceInterface {
  private readonly discordJWKSUrl = "https://discord.com/api/oauth2/keys";
  private publicKeysCache: any[] | null = null;
  private cacheExpiry: number = 0;
  private readonly cacheLifetime = 3600000; // 1時間

  async verifyIdToken(
    c: Context,
    idToken: string
  ): Promise<DiscordIdTokenPayload> {
    try {
      // JWTヘッダーをデコードしてkidを取得
      const header = jose.decodeProtectedHeader(idToken);
      if (!header.kid) {
        throw new Error("JWT header missing kid");
      }

      // Discord公開鍵を取得
      const publicKeys = await this.getDiscordPublicKeys();

      // kidに一致する公開鍵を探す
      const publicKey = publicKeys.find((key: any) => key.kid === header.kid);
      if (!publicKey) {
        console.error(
          `Public key with kid ${header.kid} not found in keys:`,
          publicKeys.map((k: any) => k.kid)
        );
        throw new Error(`Public key with kid ${header.kid} not found`);
      }

      // JWT検証（アルゴリズムも明示的に指定）
      const { payload } = await jose.jwtVerify(idToken, publicKey, {
        issuer: "https://discord.com",
        audience: c.env.DISCORD_CLIENT_ID,
        algorithms: ["RS256"] // Discord OIDCで使用されるアルゴリズムを明示的に指定
      });

      // payloadの型チェック
      if (!this.isDiscordIdTokenPayload(payload)) {
        throw new Error("Invalid ID token payload structure");
      }

      // audienceの追加検証（配列の場合も考慮）
      const expectedClientId = c.env.DISCORD_CLIENT_ID;
      const isValidAudience = Array.isArray(payload.aud)
        ? payload.aud.includes(expectedClientId)
        : payload.aud === expectedClientId;

      if (!isValidAudience) {
        throw new Error(
          `Invalid audience. Expected: ${expectedClientId}, Got: ${JSON.stringify(payload.aud)}`
        );
      }

      return payload;
    } catch (error) {
      console.error("ID token verification failed:", error);
      throw new Error("Invalid ID token");
    }
  }

  async getDiscordPublicKeys(): Promise<any[]> {
    if (this.publicKeysCache && Date.now() < this.cacheExpiry) {
      return this.publicKeysCache;
    }

    try {
      const response = await fetch(this.discordJWKSUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch JWKS: ${response.status}`);
      }

      const jwks = (await response.json()) as { keys: DiscordJWK[] };
      const keys: any[] = [];

      for (const jwk of jwks.keys) {
        try {
          // RSA署名鍵のみを処理（Discord OIDCではRS256を使用）
          if (jwk.kty === "RSA" && jwk.use === "sig" && jwk.alg === "RS256") {
            const key = await jose.importJWK(jwk);
            (key as any).kid = jwk.kid;
            (key as any).alg = jwk.alg;
            keys.push(key);
          }
        } catch (error) {
          console.warn("Failed to import JWK:", error);
        }
      }

      // キャッシュを更新
      this.publicKeysCache = keys;
      this.cacheExpiry = Date.now() + this.cacheLifetime;

      return keys;
    } catch (error) {
      console.error("Failed to fetch Discord public keys:", error);
      throw new Error("Could not retrieve Discord public keys");
    }
  }

  private isDiscordIdTokenPayload(
    payload: any
  ): payload is DiscordIdTokenPayload {
    const isValid =
      typeof payload === "object" &&
      typeof payload.sub === "string" &&
      typeof payload.iss === "string" &&
      payload.iss === "https://discord.com" &&
      (typeof payload.aud === "string" || Array.isArray(payload.aud)) && // audienceは文字列または配列
      typeof payload.exp === "number" &&
      typeof payload.iat === "number" &&
      typeof payload.auth_time === "number";

    if (!isValid) {
      console.error("Invalid ID token payload:", payload);
    }

    return isValid;
  }
}

export interface DiscordJWK {
  kty: string; // "RSA"
  use: string; // "sig"
  kid: string; // Key ID
  n: string; // RSA public key modulus
  e: string; // RSA public key exponent
  alg: string; // "RS256"
}

export interface DiscordIdTokenPayload {
  iss: string; // https://discord.com
  sub: string; // Discord User ID
  aud: string | string[]; // Discord Client ID (文字列または配列)
  exp: number; // Expiration time
  iat: number; // Issued at time
  auth_time: number; // Authentication time
  at_hash?: string; // Access token hash
}
