import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

/**
 * Discordのユーザー情報
 */
export interface DiscordUserResource {
  id: string;
  username: string;
  avatar: string;
}

/**
 * Discord ユーザーサービスのインターフェース
 */
export interface DiscordUserServiceInterface {
  getUserResource(
    accessToken: string
  ): Promise<Result<DiscordUserResource, GetUserResourceError>>;
}

/**
 * Discord ユーザーサービス
 *
 * Discord APIからのユーザー情報取得を担当する。
 * - アクセストークンを使用したユーザー情報の取得
 * - APIエラーハンドリング
 */
export class DiscordUserService implements DiscordUserServiceInterface {
  /**
   * Discord APIからユーザー情報を取得する
   *
   * 以下の処理を行う：
   * 1. Discord API `/users/@me` エンドポイントにリクエスト送信
   * 2. アクセストークンを使用した認証
   *
   * @param accessToken - Discordアクセストークン
   * @returns ユーザー情報取得結果（成功時はユーザー情報、失敗時はエラー）
   */
  async getUserResource(
    accessToken: string
  ): Promise<Result<DiscordUserResource, GetUserResourceError>> {
    const DISCORD_USER_RESOURCE_ENDPOINT = "https://discord.com/api/users/@me";

    const response = await fetch(`${DISCORD_USER_RESOURCE_ENDPOINT}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok)
      return err(
        new UserResourceRetrievalFailedError(
          response.status,
          await response.text()
        )
      );

    const data = (await response.json()) as DiscordUserResource;
    return ok(data);
  }
}

type GetUserResourceError = UserResourceRetrievalFailedError;

/**
 * Discord API呼び出しが失敗した場合のエラー
 */
class UserResourceRetrievalFailedError extends Error {
  readonly name = this.constructor.name;
  constructor(
    public readonly statusCode: number,
    public readonly responseText: string
  ) {
    super(
      `Discord user resource retrieval failed: ${statusCode} - ${responseText}`
    );
  }
}
