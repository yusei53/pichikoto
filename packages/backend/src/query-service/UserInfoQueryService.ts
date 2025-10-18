import { eq, sum } from "drizzle-orm";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { db } from "../../database/client";
import {
  appreciationReceivers as appreciationReceiversSchema,
  appreciations as appreciationsSchema,
  user as userSchema
} from "../../database/schema";
import { DiscordUserID } from "../domain/user/User";

export class UserInfoQueryService {
  async getUserInfo(
    discordUserID: DiscordUserID
  ): Promise<Result<UserInfo, UserInfoQueryServiceError>> {
    try {
      const user = await db().query.user.findFirst({
        where: eq(userSchema.discordUserId, discordUserID.value)
      });
      if (!user) {
        return err(new UserInfoQueryServiceError("User not found"));
      }

      // 総消費ポイントを計算
      const totalConsumption =
        await this.calculateTotalPointConsumption(discordUserID);

      // 残ポイント = 400 - 消費ポイント
      const remainingPoints = Math.max(0, 400 - totalConsumption);

      return ok({
        discordUserID: DiscordUserID.from(user.discordUserId).value,
        discordUserName: user.discordUserName,
        discordGlobalName: user.discordGlobalName,
        discordAvatar: user.discordAvatar,
        remainingPoints
      });
    } catch (error) {
      return err(
        new UserInfoQueryServiceError(
          "Failed to fetch user info",
          error instanceof Error ? error : new Error(String(error))
        )
      );
    }
  }

  async getUserInfoByName(
    userName: string
  ): Promise<Result<UserInfo, UserInfoQueryServiceError>> {
    try {
      const user = await db().query.user.findFirst({
        where: eq(userSchema.discordUserName, userName)
      });
      if (!user) {
        return err(new UserInfoQueryServiceError("User not found"));
      }

      const discordUserID = DiscordUserID.from(user.discordUserId);

      // 総消費ポイントを計算
      const totalConsumption =
        await this.calculateTotalPointConsumption(discordUserID);

      // 残ポイント = 400 - 消費ポイント
      const remainingPoints = Math.max(0, 400 - totalConsumption);

      return ok({
        discordUserID: discordUserID.value,
        discordUserName: user.discordUserName,
        discordGlobalName: user.discordGlobalName,
        discordAvatar: user.discordAvatar,
        remainingPoints
      });
    } catch (error) {
      return err(
        new UserInfoQueryServiceError(
          "Failed to fetch user info by name",
          error instanceof Error ? error : new Error(String(error))
        )
      );
    }
  }

  private async calculateTotalPointConsumption(
    discordUserId: DiscordUserID
  ): Promise<number> {
    const [result] = await db()
      .select({
        totalConsumption: sum(
          // pointPerReceiver * 受信者数を計算
          // JOINにより各受信者分のpointPerReceiverが合計される
          appreciationsSchema.pointPerReceiver
        )
      })
      .from(appreciationsSchema)
      .innerJoin(
        appreciationReceiversSchema,
        eq(appreciationsSchema.id, appreciationReceiversSchema.appreciationId)
      )
      .where(eq(appreciationsSchema.senderId, discordUserId.value));

    // sumの結果はstring | nullなので、numberに変換
    return Number(result.totalConsumption || 0);
  }
}

type UserInfo = {
  discordUserID: string;
  discordUserName: string;
  discordGlobalName: string | null;
  discordAvatar: string;
  remainingPoints: number;
};

export class UserInfoQueryServiceError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    if (cause) {
      this.cause = cause;
    }
  }
}
