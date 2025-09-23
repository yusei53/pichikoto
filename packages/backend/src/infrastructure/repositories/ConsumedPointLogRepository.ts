import { and, eq } from "drizzle-orm";
import { db } from "../../../database/client";
import { consumedPointLog as consumedPointLogSchema } from "../../../database/schema";
import { AppreciationID } from "../../domain/appreciation/Appreciation";
import {
  ConsumedPointLog,
  ConsumedPointLogID,
  ConsumedPoints,
  WeekStartDate
} from "../../domain/consumed-point-log/ConsumedPointLog";
import { UserID } from "../../domain/user/User";
import { CreatedAt } from "../../utils/CreatedAt";

export interface ConsumedPointLogRepositoryInterface {
  store(consumedPointLog: ConsumedPointLog): Promise<void>;
  findBy(
    consumedPointLogId: ConsumedPointLogID
  ): Promise<ConsumedPointLog | null>;
  findByUserAndWeek(
    userID: UserID,
    weekStartDate: WeekStartDate
  ): Promise<ConsumedPointLog[]>;
}

export class ConsumedPointLogRepository
  implements ConsumedPointLogRepositoryInterface
{
  async store(consumedPointLog: ConsumedPointLog): Promise<void> {
    await db()
      .insert(consumedPointLogSchema)
      .values({
        id: consumedPointLog.consumedPointLogID.value.value,
        userId: consumedPointLog.userID.value.value,
        appreciationId: consumedPointLog.appreciationID.value.value,
        weekStartDate: consumedPointLog.weekStartDate.value,
        consumedPoints: consumedPointLog.consumedPoints.value,
        createdAt: new Date(consumedPointLog.createdAt.value)
      });
  }

  async findBy(
    consumedPointLogId: ConsumedPointLogID
  ): Promise<ConsumedPointLog | null> {
    const consumedPointLogRecord =
      await this.findConsumedPointLogByID(consumedPointLogId);
    if (!consumedPointLogRecord) return null;

    return this.toConsumedPointLog(consumedPointLogRecord);
  }

  private async findConsumedPointLogByID(
    consumedPointLogId: ConsumedPointLogID
  ): Promise<ConsumedPointLogRecord | null> {
    const consumedPointLog = await db().query.consumedPointLog.findFirst({
      where: eq(consumedPointLogSchema.id, consumedPointLogId.value.value)
    });

    if (!consumedPointLog) return null;

    return {
      id: consumedPointLog.id,
      userId: consumedPointLog.userId,
      appreciationId: consumedPointLog.appreciationId,
      weekStartDate: consumedPointLog.weekStartDate,
      consumedPoints: consumedPointLog.consumedPoints,
      createdAt: consumedPointLog.createdAt
    };
  }

  async findByUserAndWeek(
    userID: UserID,
    weekStartDate: WeekStartDate
  ): Promise<ConsumedPointLog[]> {
    const records = await db().query.consumedPointLog.findMany({
      where: and(
        eq(consumedPointLogSchema.userId, userID.value.value),
        eq(consumedPointLogSchema.weekStartDate, weekStartDate.value)
      )
    });

    return records.map((record) =>
      this.toConsumedPointLog({
        id: record.id,
        userId: record.userId,
        appreciationId: record.appreciationId,
        weekStartDate: record.weekStartDate,
        consumedPoints: record.consumedPoints,
        createdAt: record.createdAt
      })
    );
  }

  private toConsumedPointLog(
    consumedPointLogRecord: ConsumedPointLogRecord
  ): ConsumedPointLog {
    return ConsumedPointLog.reconstruct(
      ConsumedPointLogID.from(consumedPointLogRecord.id),
      UserID.from(consumedPointLogRecord.userId),
      AppreciationID.from(consumedPointLogRecord.appreciationId),
      WeekStartDate.fromString(consumedPointLogRecord.weekStartDate),
      ConsumedPoints.from(consumedPointLogRecord.consumedPoints),
      CreatedAt.from(consumedPointLogRecord.createdAt)
    );
  }
}

type ConsumedPointLogRecord = {
  id: string;
  userId: string;
  appreciationId: string;
  weekStartDate: string;
  consumedPoints: number;
  createdAt: Date;
};
