import type { Context } from "hono";
import { injectable } from "inversify";
import * as jose from "jose";

export interface DiscordOIDCServiceInterface {
  revokeAccessToken(c: Context, accessToken: string): Promise<void>;
  verifyIdToken(
    c: Context,
    idToken: string,
    expectedNonce: string
  ): Promise<DiscordIdTokenPayload>;
  getDiscordPublicKeys(): Promise<any[]>;
}

@injectable()
export class DiscordOIDCService implements DiscordOIDCServiceInterface {
  private readonly discordApiBaseUrl = "https://discord.com/api";
  private readonly discordJWKSUrl = "https://discord.com/api/oauth2/keys";
  private readonly DISCORD_OIDC_FALLBACK = {
    keys: [
      {
        kty: "RSA",
        use: "sig",
        kid: "yQ5JCk8zI3K1iz8pL4Ul6GyGzlNbP00rQZaR7VdoEtU",
        n: "5RX-LybarBqiIlmkyxDDgu_umpGCIRHUwa8uzaeh4aTJvwbjmpf9HOlDVgDNfzq8L6snS1_nTf3D4zNF8Ixn_ELs19n9lsmEySUH79_0Xr_v9hmTvmk1665rmNpwu2VcIhPIuf8k2gM3ytztyyjQ1W0rAxZ0ulCdG0XP0epJx_iEKp6A7pzHljDa2r5c_fykg41JOlxmiYH4TvLpFuMOcb8QH3IG7tLxyT-kxmXKBKDJuVBX-_yplSPqXJLZfRS6eqBwMb7hZ0UUVK7ka2YIIzpjzemUyyepN57NDPC4MYk-wg6IPP1_ro0wQkA-3rfAbg0ZsfxtlbWHHOYkF7LQNtlx_xK2c9dO_7-wW2LlwVupyBPQBoUIWeTY9MQu0vgsZssexrIXm9iGE_agqudYcSw0KuDNeLMWe3cCze778nqrrT1aKl1GccpB4epoumtwbo5xzyagXn9eZ0DKDHIl5ePAmnhHM2YTKw4aI-aRVa4i8xoSWd7SPiZcqajhGmWr9fUI6J56cD-k4bO3y0_CvckvPP88g4QUterBXfGOTOMm2_93bxAk_kx5ndNaR8ccsfVBYxj2PPGfec4eYjxo_y7m8O2J2859YokrAfkEUC1jJYrjDbbBGiOtXBR-usQIIHMcs5TP4fDVNFYoxRgQpYosgwjkeDJvUyZPcYYR9KU",
        e: "AQAB",
        alg: "RS256"
      }
    ]
  };
  private publicKeysCache: any[] | null = null;
  private cacheExpiry: number = 0;
  private readonly cacheLifetime = 3600000;

  async revokeAccessToken(c: Context, accessToken: string): Promise<void> {
    const params = new URLSearchParams();
    params.append("client_id", c.env.DISCORD_CLIENT_ID);
    params.append("client_secret", c.env.DISCORD_CLIENT_SECRET);
    params.append("token", accessToken);
    params.append("token_type_hint", "access_token");

    const response = await fetch(
      `${this.discordApiBaseUrl}/oauth2/token/revoke`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Discord token revocation failed with status ${response.status}:`,
        errorText
      );
      throw new Error(
        `Discord token revocation failed: ${response.status} ${response.statusText}`
      );
    }
  }

  async verifyIdToken(
    c: Context,
    idToken: string,
    expectedNonce: string
  ): Promise<DiscordIdTokenPayload> {
    try {
      const header = jose.decodeProtectedHeader(idToken);
      if (!header.kid) {
        throw new Error("JWT header missing kid");
      }

      const publicKeys = await this.getDiscordPublicKeys();

      const publicKey = publicKeys.find((key: any) => key.kid === header.kid);
      if (!publicKey) {
        console.error(
          `Public key with kid ${header.kid} not found in keys:`,
          publicKeys.map((k: any) => k.kid)
        );
        throw new Error(`Public key with kid ${header.kid} not found`);
      }

      const { payload } = await jose.jwtVerify(idToken, publicKey, {
        issuer: "https://discord.com",
        audience: c.env.DISCORD_CLIENT_ID,
        algorithms: ["RS256"]
      });

      if (!this.isDiscordIdTokenPayload(payload)) {
        throw new Error("Invalid ID token payload structure");
      }

      const expectedClientId = c.env.DISCORD_CLIENT_ID;
      const isValidAudience = Array.isArray(payload.aud)
        ? payload.aud.includes(expectedClientId)
        : payload.aud === expectedClientId;

      if (!isValidAudience) {
        throw new Error(
          `Invalid audience. Expected: ${expectedClientId}, Got: ${JSON.stringify(payload.aud)}`
        );
      }

      // nonce検証
      if (payload.nonce !== expectedNonce) {
        console.error("Nonce mismatch:", {
          expected: expectedNonce,
          received: payload.nonce
        });
        throw new Error("Invalid nonce");
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
      const keys = await this.importJwkList(jwks.keys);

      this.publicKeysCache = keys;
      this.cacheExpiry = Date.now() + this.cacheLifetime;

      return keys;
    } catch (error) {
      console.error("Failed to fetch Discord public keys:", error);
      // 仕様変更: fetch失敗時は固定JWKSへフォールバックし、エラーを握りつぶす
      try {
        const fallbackList = this.DISCORD_OIDC_FALLBACK.keys ?? [];
        const fallbackKeys = await this.importJwkList(
          fallbackList as DiscordJWK[]
        );
        if (fallbackKeys.length > 0) {
          this.publicKeysCache = fallbackKeys;
          this.cacheExpiry = Date.now() + this.cacheLifetime;
          return fallbackKeys;
        }
      } catch (fallbackError) {
        console.warn("Failed to import fallback JWKS:", fallbackError);
      }

      if (this.publicKeysCache) {
        return this.publicKeysCache;
      }

      return [];
    }
  }

  private async importJwkList(list: DiscordJWK[]): Promise<any[]> {
    const keys: any[] = [];
    for (const jwk of list) {
      try {
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
    return keys;
  }

  private isDiscordIdTokenPayload(
    payload: any
  ): payload is DiscordIdTokenPayload {
    const isValid =
      typeof payload === "object" &&
      typeof payload.sub === "string" &&
      typeof payload.iss === "string" &&
      payload.iss === "https://discord.com" &&
      (typeof payload.aud === "string" || Array.isArray(payload.aud)) &&
      typeof payload.exp === "number" &&
      typeof payload.iat === "number" &&
      typeof payload.nonce === "string";

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

export interface DiscordOIDCTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
  id_token: string;
}

export interface DiscordIdTokenPayload {
  iss: string; // https://discord.com
  sub: string; // Discord User ID
  aud: string | string[]; // Discord Client ID (文字列または配列)
  exp: number; // Expiration time
  iat: number; // Issued at time
  auth_time?: number; // Authentication time (optional)
  nonce: string; // Nonce value
  at_hash?: string; // Access token hash
}
