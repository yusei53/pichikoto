import type { AllAppreciationsResponse } from "@pichikoto/http-contracts";
import { desc, eq } from "drizzle-orm";
import { err, ok, type Result } from "neverthrow";
import { db } from "../../database/client";
import {
  appreciationReceivers as appreciationReceiversSchema,
  appreciations as appreciationsSchema,
  user as userSchema
} from "../../database/schema";

export class AppreciationsQueryService {
  async getAll(): Promise<
    Result<AllAppreciationsResponse, AppreciationsQueryServiceError>
  > {
    try {
      // 感謝投稿を作成日時の降順で取得
      const appreciationsWithSender = await db()
        .select({
          id: appreciationsSchema.id,
          senderId: appreciationsSchema.senderId,
          message: appreciationsSchema.message,
          pointPerReceiver: appreciationsSchema.pointPerReceiver,
          createdAt: appreciationsSchema.createdAt,
          senderDiscordUserName: userSchema.discordUserName,
          senderDiscordAvatar: userSchema.discordAvatar
        })
        .from(appreciationsSchema)
        .innerJoin(
          userSchema,
          eq(appreciationsSchema.senderId, userSchema.discordUserId)
        )
        .orderBy(desc(appreciationsSchema.createdAt));

      // 各感謝投稿の受信者情報を取得
      const appreciationsWithReceivers = await Promise.all(
        appreciationsWithSender.map(async (appreciation) => {
          const receivers = await db()
            .select({
              id: userSchema.discordUserId,
              discordUserName: userSchema.discordUserName,
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
              discordAvatar: appreciation.senderDiscordAvatar
            },
            receivers: receivers.map((receiver) => ({
              id: receiver.id,
              discordUserName: receiver.discordUserName,
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
        new AppreciationsQueryServiceError(
          "Failed to fetch appreciations",
          error instanceof Error ? error : new Error(String(error))
        )
      );
    }
  }
}

export class AppreciationsQueryServiceError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    if (cause) {
      this.cause = cause;
    }
  }
}
