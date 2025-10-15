import type { AllAppreciationsResponse } from "@pichikoto/http-contracts";
import { desc, eq } from "drizzle-orm";
import { err, ok, type Result } from "neverthrow";
import { db } from "../../database/client";
import {
  appreciationReceivers as appreciationReceiversSchema,
  appreciations as appreciationsSchema,
  user as userSchema
} from "../../database/schema";

export class ReceivedAppreciationsQueryService {
  async getByDiscordUserId(
    discordUserId: string
  ): Promise<
    Result<AllAppreciationsResponse, ReceivedAppreciationsQueryServiceError>
  > {
    try {
      // 指定されたユーザーが受信した感謝投稿を作成日時の降順で取得
      const appreciationsWithSender = await db()
        .select({
          id: appreciationsSchema.id,
          senderId: appreciationsSchema.senderId,
          message: appreciationsSchema.message,
          pointPerReceiver: appreciationsSchema.pointPerReceiver,
          createdAt: appreciationsSchema.createdAt,
          senderDiscordUserName: userSchema.discordUserName,
          senderDiscordGlobalName: userSchema.discordGlobalName,
          senderDiscordAvatar: userSchema.discordAvatar
        })
        .from(appreciationsSchema)
        .innerJoin(
          userSchema,
          eq(appreciationsSchema.senderId, userSchema.discordUserId)
        )
        .innerJoin(
          appreciationReceiversSchema,
          eq(appreciationsSchema.id, appreciationReceiversSchema.appreciationId)
        )
        .where(eq(appreciationReceiversSchema.receiverId, discordUserId))
        .orderBy(desc(appreciationsSchema.createdAt));

      // 各感謝投稿の受信者情報を取得
      const appreciationsWithReceivers = await Promise.all(
        appreciationsWithSender.map(async (appreciation) => {
          const receivers = await db()
            .select({
              id: userSchema.discordUserId,
              discordUserName: userSchema.discordUserName,
              discordGlobalName: userSchema.discordGlobalName,
              discordAvatar: userSchema.discordAvatar
            })
            .from(appreciationReceiversSchema)
            .innerJoin(
              userSchema,
              eq(
                appreciationReceiversSchema.receiverId,
                userSchema.discordUserId
              )
            )
            .where(
              eq(appreciationReceiversSchema.appreciationId, appreciation.id)
            );

          return {
            id: appreciation.id,
            sender: {
              id: appreciation.senderId,
              discordUserName: appreciation.senderDiscordUserName,
              discordGlobalName: appreciation.senderDiscordGlobalName,
              discordAvatar: appreciation.senderDiscordAvatar
            },
            receivers: receivers.map((receiver) => ({
              id: receiver.id,
              discordUserName: receiver.discordUserName,
              discordGlobalName: receiver.discordGlobalName,
              discordAvatar: receiver.discordAvatar
            })),
            message: appreciation.message,
            pointPerReceiver: appreciation.pointPerReceiver,
            createdAt: appreciation.createdAt.toISOString()
          };
        })
      );

      return ok({
        appreciations: appreciationsWithReceivers
      });
    } catch (error) {
      return err(
        new ReceivedAppreciationsQueryServiceError(
          "Failed to fetch received appreciations",
          error instanceof Error ? error : new Error(String(error))
        )
      );
    }
  }
}

export class ReceivedAppreciationsQueryServiceError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    if (cause) {
      this.cause = cause;
    }
  }
}
