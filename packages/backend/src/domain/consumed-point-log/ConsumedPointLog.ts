import { z } from "zod";
import { CreatedAt } from "../../utils/CreatedAt";
import { UUID } from "../../utils/UUID";
import type { AppreciationID } from "../appreciation/Appreciation";
import type { UserID } from "../user/User";

/**
 * ユーザーの週次ポイント消費記録を表すドメインエンティティ
 */
export class ConsumedPointLog {
  private constructor(
    readonly consumedPointLogID: ConsumedPointLogID,
    readonly userID: UserID,
    readonly appreciationID: AppreciationID,
    readonly weekStartDate: WeekStartDate,
    readonly consumedPoints: ConsumedPoints,
    readonly createdAt: CreatedAt
  ) {}

  static create(
    userID: UserID,
    appreciationID: AppreciationID,
    weekStartDate: WeekStartDate,
    consumedPoints: ConsumedPoints
  ): ConsumedPointLog {
    return new ConsumedPointLog(
      ConsumedPointLogID.new(),
      userID,
      appreciationID,
      weekStartDate,
      consumedPoints,
      CreatedAt.new()
    );
  }

  static reconstruct(
    consumedPointLogID: ConsumedPointLogID,
    userID: UserID,
    appreciationID: AppreciationID,
    weekStartDate: WeekStartDate,
    consumedPoints: ConsumedPoints,
    createdAt: CreatedAt
  ): ConsumedPointLog {
    return new ConsumedPointLog(
      consumedPointLogID,
      userID,
      appreciationID,
      weekStartDate,
      consumedPoints,
      createdAt
    );
  }
}

/**
 * ポイント消費記録の一意識別子を表す値オブジェクト
 */
export class ConsumedPointLogID {
  private constructor(readonly value: UUID) {}

  static new(): ConsumedPointLogID {
    return new ConsumedPointLogID(UUID.new());
  }

  static from(value: string): ConsumedPointLogID {
    return new ConsumedPointLogID(UUID.from(value));
  }
}

/**
 * 消費ポイントの最小値
 */
const MIN_CONSUMED_POINTS = 1;

/**
 * 消費ポイントの最大値
 */
const MAX_CONSUMED_POINTS = 120;

const ConsumedPointsSchema = z
  .number()
  .min(MIN_CONSUMED_POINTS, "消費ポイントは1以上である必要があります")
  .max(MAX_CONSUMED_POINTS, "消費ポイントは120以下である必要があります")
  .int("消費ポイントは整数である必要があります");

/**
 * 消費されたポイント数を表す値オブジェクト（1〜120ポイント）
 */
export class ConsumedPoints {
  private constructor(readonly value: number) {}

  static from(value: number): ConsumedPoints {
    const validatedValue = ConsumedPointsSchema.parse(value);
    return new ConsumedPoints(validatedValue);
  }
}

/**
 * 週の開始日（月曜日）を表す値オブジェクト
 */
export class WeekStartDate {
  private constructor(readonly value: Date) {}

  static from(value: Date): WeekStartDate {
    return new WeekStartDate(value);
  }

  static new(): WeekStartDate {
    // 現在の週の開始日（月曜日）を取得
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - ((dayOfWeek + 6) % 7));
    monday.setUTCHours(0, 0, 0, 0);
    return new WeekStartDate(monday);
  }
}
