import { injectable } from "inversify";
import * as jose from "jose";
import type { Result } from "neverthrow";
import { err, fromThrowable, ok } from "neverthrow";

/**
 * JWTヘッダーデコード後の型
 */
type HeaderAfterDecode = {
  kid: string;
};

/**
 * JWKから変換されたDiscord公開鍵
 *
 * CryptoKeyオブジェクトとDiscord固有のメタデータを分離して管理
 */
export type DiscordCryptoKey = {
  cryptoKey: CryptoKey | Uint8Array; // jose.importJWKの戻り値
  kid: string; // Key ID - JWKから取得した鍵の識別子
  alg: string; // Algorithm - JWKから取得したアルゴリズム
};

/**
 * Discord JWKS APIのレスポンス形式
 */
type DiscordJWKSResponse = {
  keys: DiscordJWK[];
};

/**
 * DiscordのJWK（JSON Web Key）
 *
 * RSA公開鍵の情報をJSON形式で表現したもの
 *
 * MEMO:
 * DiscordのJWKSエンドポイント（https://discord.com/api/oauth2/keys）から実際に返されるJSONもこの形式になっている
 * 変更すると他のライブラリやサービスとの互換性が失われてしまうため、変更しないこと
 */
type DiscordJWK = {
  kty: string; // Key Type - "RSA"
  use: string; // Public Key Use - "sig" (signature)
  kid: string; // Key ID - 鍵の識別子
  n: string; // RSA Modulus - RSA公開鍵の法（Base64URL形式）
  e: string; // RSA Exponent - RSA公開鍵の指数（通常は"AQAB" = 65537）
  alg: string; // Algorithm - "RS256"
};

/**
 * Discord JWK（JSON Web Key）管理サービスのインターフェース
 */
export interface DiscordJWKServiceInterface {
  decodeJWTHeader(
    token: string
  ): Result<HeaderAfterDecode, DecodeJWTHeaderError>;
  getPublicKeys(): Promise<Result<DiscordCryptoKey[], GetPublicKeysError>>;
  verifyJWTSignature(
    token: string,
    publicKey: DiscordCryptoKey,
    audience: string,
    expectedNonce: string
  ): Promise<Result<jose.JWTPayload, VerifyJWTSignatureError>>;
}

/**
 * Discord JWK（JSON Web Key）管理サービス
 *
 * Discord OpenID ConnectにおけるJWT関連の暗号化処理を担当する。
 * - 公開鍵の取得とキャッシング
 * - JWTヘッダーのデコード
 * - JWT署名の検証
 */
@injectable()
export class DiscordJWKService implements DiscordJWKServiceInterface {
  private publicKeysCache: DiscordCryptoKey[] | null = null;
  private cacheExpiry: number = 0;
  private readonly cacheLifetime = 3600000; // 1時間
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

  /**
   * JWTヘッダーをデコードし、kidの存在をチェックする
   *
   * @param token - デコード対象のJWT
   * @returns ヘッダーデコード結果（成功時はkidを含むヘッダー情報、失敗時はエラー）
   */
  decodeJWTHeader(
    token: string
  ): Result<HeaderAfterDecode, DecodeJWTHeaderError> {
    const safeDecodeHeader = fromThrowable(
      jose.decodeProtectedHeader,
      (error) =>
        new JWTHeaderDecodeFailedError(
          error instanceof Error ? error.message : "Invalid JWT header"
        )
    );

    const headerResult = safeDecodeHeader(token);
    if (headerResult.isErr()) {
      return err(headerResult.error);
    }
    const kid = headerResult.value.kid;

    if (!kid) return err(new MissingKidError());

    return ok({ kid });
  }

  /**
   * Discord公開鍵を取得する（キャッシュ機能付き）
   *
   * @returns 公開鍵取得結果（成功時は公開鍵配列、失敗時はエラー）
   */
  async getPublicKeys(): Promise<
    Result<DiscordCryptoKey[], GetPublicKeysError>
  > {
    // キャッシュが有効な場合はキャッシュから返す
    const cachedKeys = this.getCachedPublicKeysIfValid();
    if (cachedKeys) {
      return ok(cachedKeys);
    }

    // Discord JWKS APIから最新の公開鍵を取得
    const fetchResult = await this.fetchDiscordJWKS();
    if (fetchResult.isErr()) {
      return err(fetchResult.error);
    }

    // JWKSレスポンスから利用可能な公開鍵を変換
    const publicKeys = await this.convertJWKSToPublicKeys(fetchResult.value);

    // キャッシュを更新
    this.updatePublicKeysCache(publicKeys);

    return ok(publicKeys);
  }

  /**
   * キャッシュされた公開鍵が有効な場合に取得する
   *
   * @returns 有効なキャッシュがある場合は公開鍵配列、ない場合はnull
   */
  private getCachedPublicKeysIfValid(): DiscordCryptoKey[] | null {
    if (this.publicKeysCache && Date.now() < this.cacheExpiry) {
      return this.publicKeysCache;
    }
    return null;
  }

  /**
   * Discord JWKS APIからJWKSデータを取得する
   *
   * @returns JWKS取得結果（成功時はJWKSレスポンス、失敗時はエラー）
   */
  private async fetchDiscordJWKS(): Promise<
    Result<DiscordJWKSResponse, GetPublicKeysError>
  > {
    const DISCORD_JWKS_URL = "https://discord.com/api/oauth2/keys";

    try {
      const response = await fetch(DISCORD_JWKS_URL);
      if (!response.ok) {
        return err(
          new FetchDiscordJWKSError(
            response.status,
            `Failed to fetch JWKS: ${response.status}`
          )
        );
      }
      // hotfix: 429エラー時は固定JWKSへフォールバックし、エラーを握りつぶす
      // TODO: 要リファクタリングする
      if (response.status === 429) {
        try {
          const fallbackJWKS = {
            keys: this.DISCORD_OIDC_FALLBACK.keys
          };
          const fallbackKeys = await this.convertJWKSToPublicKeys(fallbackJWKS);
          if (fallbackKeys.length > 0) {
            this.publicKeysCache = fallbackKeys;
            this.cacheExpiry = Date.now() + this.cacheLifetime;
            return ok(fallbackJWKS);
          }
        } catch (fallbackError) {
          console.warn("Failed to import fallback JWKS:", fallbackError);
        }

        if (this.publicKeysCache) {
          return ok({ keys: [] });
        }

        return err(
          new FetchDiscordJWKSError(
            429,
            "Rate limited and no cached keys available"
          )
        );
      }

      const jwksResponse = (await response.json()) as DiscordJWKSResponse;
      return ok(jwksResponse);
    } catch {
      return err(
        new FetchDiscordJWKSError(
          500,
          "Network error occurred while fetching Discord JWKS"
        )
      );
    }
  }

  /**
   * JWKSレスポンスから利用可能な公開鍵に変換する
   */
  private async convertJWKSToPublicKeys(
    jwksResponse: DiscordJWKSResponse
  ): Promise<DiscordCryptoKey[]> {
    const convertPromises = jwksResponse.keys.map((jwk) =>
      this.convertJWKToPublicKey(jwk)
    );
    const convertedKeys = await Promise.all(convertPromises);

    return convertedKeys.filter((key): key is DiscordCryptoKey => key !== null);
  }

  /**
   * 単一のJWKを公開鍵に変換する
   */
  private async convertJWKToPublicKey(
    jwk: DiscordJWK
  ): Promise<DiscordCryptoKey | null> {
    try {
      // RSA署名用鍵のみをサポート
      if (!this.isSupportedJWK(jwk)) {
        return null;
      }

      const cryptoKey = await jose.importJWK(jwk);
      const discordPublicKey: DiscordCryptoKey = {
        cryptoKey,
        kid: jwk.kid,
        alg: jwk.alg
      };

      return discordPublicKey;
    } catch (importError) {
      console.warn(`Failed to import JWK with kid: ${jwk.kid}`, importError);
      return null;
    }
  }

  /**
   * JWKがサポート対象かどうかを判定する
   */
  private isSupportedJWK(jwk: DiscordJWK): boolean {
    return jwk.kty === "RSA" && jwk.use === "sig" && jwk.alg === "RS256";
  }

  /**
   * 公開鍵のキャッシュを更新する
   */
  private updatePublicKeysCache(publicKeys: DiscordCryptoKey[]): void {
    this.publicKeysCache = publicKeys;
    this.cacheExpiry = Date.now() + this.cacheLifetime;
  }

  /**
   * JWT署名を検証する
   *
   * @param token - 検証対象のJWT
   * @param publicKey - 署名検証用の公開鍵
   * @param audience - 期待するAudience
   * @returns 署名検証結果（成功時はペイロード、失敗時はエラー）
   */
  async verifyJWTSignature(
    token: string,
    publicKey: DiscordCryptoKey,
    audience: string,
    expectedNonce: string
  ): Promise<Result<jose.JWTPayload, VerifyJWTSignatureError>> {
    // DiscordCryptoKeyからCryptoKey部分を取得
    const cryptoKey = publicKey.cryptoKey;

    const safeJWTVerify = fromThrowable(
      async () =>
        await jose.jwtVerify(token, cryptoKey, {
          issuer: "https://discord.com",
          audience,
          algorithms: ["RS256"]
        }),
      (error) =>
        new JWTVerifyFailedError(
          error instanceof Error ? error.message : "Invalid JWT signature"
        )
    );

    const result = safeJWTVerify();
    if (result.isErr()) {
      return err(result.error);
    }

    const jwtResult = await result.value;

    if (jwtResult.payload.nonce !== expectedNonce) {
      return err(
        new InvalidNonceError(expectedNonce, jwtResult.payload.nonce as string)
      );
    }

    return ok(jwtResult.payload);
  }
}
/**
 * decodeJWTHeader(token: string)のエラー
 */
type DecodeJWTHeaderError = JWTHeaderDecodeFailedError | MissingKidError;

/**
 * JWTヘッダーデコードが失敗した場合のエラー
 */
export class JWTHeaderDecodeFailedError extends Error {
  readonly name = this.constructor.name;
  constructor(message: string) {
    super(`JWT header decode failed: ${message}`);
  }
}

/**
 * JWTヘッダーにkidが存在しない場合のエラー
 */
export class MissingKidError extends Error {
  readonly name = this.constructor.name;
  constructor() {
    super(`Missing kid in JWT header`);
  }
}

/**
 * getPublicKeys()のエラー
 */
type GetPublicKeysError = FetchDiscordJWKSError;

/**
 * Discord公開鍵取得が失敗した場合のエラー
 */
export class FetchDiscordJWKSError extends Error {
  readonly name = this.constructor.name;
  constructor(
    public readonly statusCode: number,
    public readonly responseText: string
  ) {
    super(`Fetch Discord JWKS failed: ${statusCode} - ${responseText}`);
  }
}

/**
 * verifyJWTSignature(token: string, publicKey: DiscordCryptoKey, audience: string)のエラー
 */
type VerifyJWTSignatureError = JWTVerifyFailedError | InvalidNonceError;

/**
 * JWT署名検証が失敗した場合のエラー
 */
class JWTVerifyFailedError extends Error {
  readonly name = this.constructor.name;
  constructor(message: string) {
    super(`${message}`);
  }
}

/**
 * Nonceが一致しない場合のエラー
 */
class InvalidNonceError extends Error {
  readonly name = this.constructor.name;
  constructor(expectedNonce: string, receivedNonce: string) {
    super(
      `Invalid nonce: expected: ${expectedNonce}, received: ${receivedNonce}`
    );
  }
}
