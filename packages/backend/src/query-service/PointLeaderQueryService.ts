import { sql } from "drizzle-orm";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";
import { db } from "../../database/client";
import {
  appreciationReceivers as appreciationReceiversSchema,
  appreciations as appreciationsSchema,
  consumedPointLog as consumedPointLogSchema,
  user as userSchema
} from "../../database/schema";

export interface PointLeaderUser {
  id: string;
  discordUserName: string;
  discordAvatar: string;
  totalPoints: number;
}

export interface WeeklyPointLeadersResponse {
  topSenders: PointLeaderUser[];
  topReceivers: PointLeaderUser[];
}

export class PointLeaderQueryService {
  /**
   * 今週のポイント送信・受信上位3人ずつを取得
   */
  async getWeeklyLeaders(): Promise<
    Result<WeeklyPointLeadersResponse, PointLeaderQueryServiceError>
  > {
    try {
      const weekStartDate = this.getCurrentWeekStartDate();

      // 今週のポイント送信上位3人を取得
      const topSenders = await this.getTopSenders(weekStartDate);

      // 今週のポイント受信上位3人を取得
      const topReceivers = await this.getTopReceivers(weekStartDate);

      return ok({
        topSenders,
        topReceivers
      });
    } catch (error) {
      return err(
        new PointLeaderQueryServiceError(
          "Failed to get weekly leaders",
          error instanceof Error ? error : new Error(String(error))
        )
      );
    }
  }

  /**
   * 今週のポイント送信上位3人を取得（0ポイントのユーザーは除外）
   */
  private async getTopSenders(
    weekStartDate: string
  ): Promise<PointLeaderUser[]> {
    const result = await db()
      .select({
        id: userSchema.id,
        discordUserName: userSchema.discordUserName,
        discordAvatar: userSchema.discordAvatar,
        totalPoints:
          sql<number>`SUM(${consumedPointLogSchema.consumedPoints})`.as(
            "totalPoints"
          )
      })
      .from(userSchema)
      .innerJoin(
        consumedPointLogSchema,
        sql`${userSchema.id} = ${consumedPointLogSchema.userId} AND ${consumedPointLogSchema.weekStartDate} = ${weekStartDate}`
      )
      .groupBy(
        userSchema.id,
        userSchema.discordUserName,
        userSchema.discordAvatar
      )
      .orderBy(sql`"totalPoints" DESC`)
      .limit(3);

    return result.map((row) => ({
      id: row.id,
      discordUserName: row.discordUserName,
      discordAvatar: row.discordAvatar,
      totalPoints: Number(row.totalPoints)
    }));
  }

  /**
   * 今週のポイント受信上位3人を取得（0ポイントのユーザーは除外）
   */
  private async getTopReceivers(
    weekStartDate: string
  ): Promise<PointLeaderUser[]> {
    const result = await db()
      .select({
        id: userSchema.id,
        discordUserName: userSchema.discordUserName,
        discordAvatar: userSchema.discordAvatar,
        totalPoints:
          sql<number>`SUM(${appreciationsSchema.pointPerReceiver})`.as(
            "totalPoints"
          )
      })
      .from(userSchema)
      .innerJoin(
        appreciationReceiversSchema,
        sql`${userSchema.id} = ${appreciationReceiversSchema.receiverId}`
      )
      .innerJoin(
        appreciationsSchema,
        sql`${appreciationReceiversSchema.appreciationId} = ${appreciationsSchema.id} AND ${appreciationsSchema.createdAt} >= ${this.getWeekStartDateTime(weekStartDate)} AND ${appreciationsSchema.createdAt} < ${this.getWeekEndDateTime(weekStartDate)}`
      )
      .groupBy(
        userSchema.id,
        userSchema.discordUserName,
        userSchema.discordAvatar
      )
      .orderBy(sql`"totalPoints" DESC`)
      .limit(3);

    return result.map((row) => ({
      id: row.id,
      discordUserName: row.discordUserName,
      discordAvatar: row.discordAvatar,
      totalPoints: Number(row.totalPoints)
    }));
  }

  /**
   * 現在の週の開始日（月曜日）を YYYY-MM-DD 形式で取得
   */
  private getCurrentWeekStartDate(): string {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - ((dayOfWeek + 6) % 7));
    monday.setUTCHours(0, 0, 0, 0);
    return monday.toISOString().split("T")[0];
  }

  /**
   * 週の開始日時を取得（YYYY-MM-DD HH:MM:SS形式）
   */
  private getWeekStartDateTime(weekStartDate: string): string {
    return `${weekStartDate} 00:00:00`;
  }

  /**
   * 週の終了日時を取得（次の月曜日の00:00:00）
   */
  private getWeekEndDateTime(weekStartDate: string): string {
    const startDate = new Date(`${weekStartDate}T00:00:00Z`);
    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 7);
    return endDate.toISOString().replace("T", " ").replace("Z", "");
  }
}

export class PointLeaderQueryServiceError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    if (cause) {
      this.cause = cause;
    }
  }
}
