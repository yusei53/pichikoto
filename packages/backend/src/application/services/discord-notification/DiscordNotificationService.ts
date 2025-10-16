import type { Context } from "hono";
import { err, ok, type Result } from "neverthrow";
import type { Appreciation } from "../../../domain/appreciation/Appreciation";

export interface DiscordNotificationServiceInterface {
  sendAppreciationNotification(
    c: Context,
    appreciation: Appreciation
  ): Promise<Result<void, DiscordNotificationError>>;
}

/**
 * Discord Webhook通知サービス
 *
 * Appreciation作成時にDiscordチャンネルへの通知を担当する。
 * - Webhookを使用したDiscordへの投稿
 * - 指定されたフォーマットでの通知メッセージ作成
 */
export class DiscordNotificationService
  implements DiscordNotificationServiceInterface
{
  /**
   * Appreciation作成通知をDiscordに送信する
   *
   * 以下の処理を行う：
   * 1. 通知メッセージの作成
   * 2. Discord Webhook APIへのリクエスト送信
   *
   * @param c - Honoコンテキスト（環境変数アクセス用）
   * @param appreciation - 作成されたAppreciation
   * @returns 通知送信結果（成功時はvoid、失敗時はエラー）
   */
  async sendAppreciationNotification(
    c: Context,
    appreciation: Appreciation
  ): Promise<Result<void, DiscordNotificationError>> {
    const webhookUrl = c.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return err(
        new WebhookConfigurationError("DISCORD_WEBHOOK_URL is not configured")
      );
    }

    const message = this.createNotificationMessage(
      appreciation,
      c.env.FRONTEND_BASE_URL
    );

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: message
        })
      });

      if (!response.ok) {
        return err(
          new WebhookSendFailedError(
            response.status,
            `Failed to send webhook: ${response.status} ${await response.text()}`
          )
        );
      }

      return ok();
    } catch (error) {
      return err(
        new WebhookSendFailedError(
          500,
          `Network error occurred while sending webhook: ${error instanceof Error ? error.message : "Unknown error"}`
        )
      );
    }
  }

  /**
   * 通知メッセージを作成する
   *
   * フォーマット:
   * <@送信者ID> が、<@受信者1ID>, <@受信者2ID> に88ポイントとメッセージを送りました！
   * 「メッセージ内容」
   *
   * こちらからも読むことができます。
   * https://frontend-url/appreciation/{appreciationId}
   */
  private createNotificationMessage(
    appreciation: Appreciation,
    frontendBaseUrl: string
  ): string {
    const senderMention = `<@${appreciation.senderID.value}>`;
    const receiverMentions = appreciation.receiverIDs.value
      .map((receiverID) => `<@${receiverID.value}>`)
      .join(" ");

    const appreciationUrl = `${frontendBaseUrl}/appreciation/${appreciation.appreciationID.value.value}`;

    return [
      `${senderMention} が、${receiverMentions} に${appreciation.pointPerReceiver.value}ポイントとメッセージを送りました！`,
      "",
      `**「${appreciation.message.value}」**`,
      "",
      `[こちら](${appreciationUrl})からも読むことができます。`
    ].join("\n");
  }
}

export class DiscordNotificationError extends Error {
  readonly name = this.constructor.name;

  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
  }
}

export class WebhookConfigurationError extends DiscordNotificationError {
  constructor(message: string) {
    super(message);
  }
}

export class WebhookSendFailedError extends DiscordNotificationError {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
  }
}
