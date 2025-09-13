import { injectable } from "inversify";
import * as jose from "jose";
import type { Result } from "neverthrow";
import { err, fromThrowable, ok } from "neverthrow";

/**
 * DiscordのJWK（JSON Web Key）
 *
 * RSA公開鍵の情報をJSON形式で表現したもの
 *
 * MEMO:
 * DiscordのJWKSエンドポイント（https://discord.com/api/oauth2/keys）から実際に返されるJSONもこの形式になっている
 * 変更すると他のライブラリやサービスとの互換性が失われてしまうため、変更しないこと
 */
export interface DiscordJWK {
  kty: string; // Key Type - "RSA"
  use: string; // Public Key Use - "sig" (signature)
  kid: string; // Key ID - 鍵の識別子
  n: string; // RSA Modulus - RSA公開鍵の法（Base64URL形式）
  e: string; // RSA Exponent - RSA公開鍵の指数（通常は"AQAB" = 65537）
  alg: string; // Algorithm - "RS256"
}

/**
 * JWKから変換されたDiscord公開鍵
 *
 * importJWKの戻り値にDiscord固有のプロパティ（kid, alg）を追加したもの
 */
export interface DiscordPublicKey {
  kid: string; // Key ID - JWKから取得した鍵の識別子
  alg: string; // Algorithm - JWKから取得したアルゴリズム
}

/**
 * importJWKの戻り値とDiscord固有のプロパティを組み合わせた型
 */
export type DiscordCryptoKey = (CryptoKey | Uint8Array) & DiscordPublicKey;

/**
 * Discord JWKS APIのレスポンス形式
 */
export interface DiscordJWKSResponse {
  keys: DiscordJWK[];
}

/**
 * Discord JWK（JSON Web Key）管理サービスのインターフェース
 */
export interface DiscordJWKServiceInterface {
  decodeJWTHeader(
    token: string
  ): Result<{ kid?: string }, JWTHeaderDecodeFailedError>;
  getPublicKeys(): Promise<
    Result<DiscordCryptoKey[], PublicKeysRetrievalFailedError>
  >;
  verifyJWTSignature(
    token: string,
    publicKey: DiscordCryptoKey,
    audience: string
  ): Promise<Result<jose.JWTPayload, JWTSignatureVerificationFailedError>>;
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

  /**
   * JWTヘッダーをデコードする
   *
   * @param token - デコード対象のJWT
   * @returns ヘッダーデコード結果（成功時はヘッダー情報、失敗時はエラー）
   * NOTE: jose.decodeProtectedHeaderが返すJWTHeaderParametersのkidはoptionalなため、nullableなkidを返す
   */
  decodeJWTHeader(
    token: string
  ): Result<{ kid?: string }, JWTHeaderDecodeFailedError> {
    const safeDecodeHeader = fromThrowable(
      jose.decodeProtectedHeader,
      (error) =>
        new JWTHeaderDecodeFailedError(
          error instanceof Error ? error.message : "Invalid JWT header"
        )
    );

    return safeDecodeHeader(token);
  }

  /**
   * Discord公開鍵を取得する（キャッシュ機能付き）
   *
   * @returns 公開鍵取得結果（成功時は公開鍵配列、失敗時はエラー）
   */
  async getPublicKeys(): Promise<
    Result<DiscordCryptoKey[], PublicKeysRetrievalFailedError>
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
    Result<DiscordJWKSResponse, PublicKeysRetrievalFailedError>
  > {
    const DISCORD_JWKS_URL = "https://discord.com/api/oauth2/keys";

    try {
      const response = await fetch(DISCORD_JWKS_URL);
      if (!response.ok) {
        return err(
          new PublicKeysRetrievalFailedError(
            response.status,
            `Failed to fetch JWKS: ${response.status}`
          )
        );
      }

      const jwksResponse = (await response.json()) as DiscordJWKSResponse;
      return ok(jwksResponse);
    } catch (networkError) {
      const errorMessage =
        networkError instanceof Error
          ? networkError.message
          : "Network error occurred while fetching Discord JWKS";

      return err(
        new PublicKeysRetrievalFailedError(
          0, // ネットワークエラーの場合はstatusCodeは0
          errorMessage
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
      const discordPublicKey = {
        ...cryptoKey,
        kid: jwk.kid,
        alg: jwk.alg
      } as DiscordCryptoKey;

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
    audience: string
  ): Promise<Result<jose.JWTPayload, JWTSignatureVerificationFailedError>> {
    try {
      const { payload } = await jose.jwtVerify(token, publicKey, {
        issuer: "https://discord.com",
        audience,
        algorithms: ["RS256"]
      });

      return ok(payload);
    } catch (error) {
      console.error("JWT signature verification failed:", error);
      return err(
        new JWTSignatureVerificationFailedError(
          error instanceof Error ? error.message : "Invalid JWT signature"
        )
      );
    }
  }
}

/**
 * Discord公開鍵取得が失敗した場合のエラー
 */
export class PublicKeysRetrievalFailedError extends Error {
  readonly name = this.constructor.name;
  constructor(
    public readonly statusCode: number,
    public readonly responseText: string
  ) {
    super(
      `Discord public keys retrieval failed: ${statusCode} - ${responseText}`
    );
  }
}

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
 * JWT署名検証が失敗した場合のエラー
 */
export class JWTSignatureVerificationFailedError extends Error {
  readonly name = this.constructor.name;
  constructor(message: string) {
    super(`JWT signature verification failed: ${message}`);
  }
}
