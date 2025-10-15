import { eq, sum } from "drizzle-orm";
import { err, ok, type Result } from "neverthrow";
import { db } from "../../database/client";
import {
  appreciationReceivers as appreciationReceiversSchema,
  appreciations as appreciationsSchema
} from "../../database/schema";

export class AppreciationTotalPointQueryService {
  async get(
    discordUserId: string
  ): Promise<
    Result<
      AppreciationTotalPointResponse,
      AppreciationTotalPointQueryServiceError
    >
  > {
    try {
      // 送信した総ポイントを取得
      const sendPointResult = await db()
        .select({
          totalPoints: sum(appreciationsSchema.pointPerReceiver)
        })
        .from(appreciationsSchema)
        .innerJoin(
          appreciationReceiversSchema,
          eq(appreciationsSchema.id, appreciationReceiversSchema.appreciationId)
        )
        .where(eq(appreciationsSchema.senderId, discordUserId));

      // 受信した総ポイントを取得
      const receivePointResult = await db()
        .select({
          totalPoints: sum(appreciationsSchema.pointPerReceiver)
        })
        .from(appreciationReceiversSchema)
        .innerJoin(
          appreciationsSchema,
          eq(appreciationReceiversSchema.appreciationId, appreciationsSchema.id)
        )
        .where(eq(appreciationReceiversSchema.receiverId, discordUserId));

      const sendPoint = Number(sendPointResult[0]?.totalPoints) || 0;
      const receivePoint = Number(receivePointResult[0]?.totalPoints) || 0;

      return ok({
        sentPoint: sendPoint,
        receivedPoint: receivePoint
      });
    } catch (error) {
      return err(
        new AppreciationTotalPointQueryServiceError(
          "Failed to get appreciation total points",
          error instanceof Error ? error : new Error(String(error))
        )
      );
    }
  }
}

type AppreciationTotalPointResponse = {
  sentPoint: number;
  receivedPoint: number;
};

export class AppreciationTotalPointQueryServiceError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    if (cause) {
      this.cause = cause;
    }
  }
}
