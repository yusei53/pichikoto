import { eq } from "drizzle-orm";
import { err, ok, type Result } from "neverthrow";
import { db } from "../../database/client";
import {
  appreciationReceivers as appreciationReceiversSchema,
  appreciations as appreciationsSchema,
  user as userSchema
} from "../../database/schema";

export class AppreciationUsersQueryService {
  async get(
    discordUserId: string
  ): Promise<
    Result<AppreciationUsersResponse, AppreciationUsersQueryServiceError>
  > {
    try {
      // 送信先ユーザー一覧を取得（重複排除）
      const sentToUsers = await db()
        .selectDistinct({
          id: userSchema.discordUserId,
          discordUserName: userSchema.discordUserName,
          discordGlobalName: userSchema.discordGlobalName,
          discordAvatar: userSchema.discordAvatar
        })
        .from(appreciationReceiversSchema)
        .innerJoin(
          appreciationsSchema,
          eq(appreciationReceiversSchema.appreciationId, appreciationsSchema.id)
        )
        .innerJoin(
          userSchema,
          eq(appreciationReceiversSchema.receiverId, userSchema.discordUserId)
        )
        .where(eq(appreciationsSchema.senderId, discordUserId));

      // 受信元ユーザー一覧を取得（重複排除）
      const receivedFromUsers = await db()
        .selectDistinct({
          id: userSchema.discordUserId,
          discordUserName: userSchema.discordUserName,
          discordGlobalName: userSchema.discordGlobalName,
          discordAvatar: userSchema.discordAvatar
        })
        .from(appreciationsSchema)
        .innerJoin(
          appreciationReceiversSchema,
          eq(appreciationsSchema.id, appreciationReceiversSchema.appreciationId)
        )
        .innerJoin(
          userSchema,
          eq(appreciationsSchema.senderId, userSchema.discordUserId)
        )
        .where(eq(appreciationReceiversSchema.receiverId, discordUserId));

      return ok({
        sentToUsers: sentToUsers.map((user) => ({
          id: user.id,
          discordUserName: user.discordUserName,
          discordGlobalName: user.discordGlobalName,
          discordAvatar: user.discordAvatar
        })),
        receivedFromUsers: receivedFromUsers.map((user) => ({
          id: user.id,
          discordUserName: user.discordUserName,
          discordGlobalName: user.discordGlobalName,
          discordAvatar: user.discordAvatar
        }))
      });
    } catch (error) {
      return err(
        new AppreciationUsersQueryServiceError(
          "Failed to get appreciation users",
          error instanceof Error ? error : new Error(String(error))
        )
      );
    }
  }
}

type AppreciationUser = {
  id: string;
  discordUserName: string;
  discordGlobalName: string | null;
  discordAvatar: string;
};

type AppreciationUsersResponse = {
  sentToUsers: AppreciationUser[];
  receivedFromUsers: AppreciationUser[];
};

export class AppreciationUsersQueryServiceError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    if (cause) {
      this.cause = cause;
    }
  }
}
