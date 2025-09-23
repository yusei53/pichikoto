import { expect } from "vitest";
import type * as schema from "../../../database/schema";
import type { ConsumedPointLog } from "../../../src/domain/consumed-point-log/ConsumedPointLog";

/**
 * データベースのconsumed_point_logテーブルと引数で渡されたConsumedPointLogドメインオブジェクトが等しいことをアサート
 * @param expectedConsumedPointLog 期待されるConsumedPointLogドメインオブジェクト
 * @param actualRecord selectOneFromDatabaseから返される単一レコード
 */
export const assertEqualConsumedPointLogTable = (
  expectedConsumedPointLog: ConsumedPointLog,
  actualRecord: typeof schema.consumedPointLog.$inferSelect
): void => {
  const expectedRecord = {
    id: expectedConsumedPointLog.consumedPointLogID.value.value,
    userId: expectedConsumedPointLog.userID.value.value,
    appreciationId: expectedConsumedPointLog.appreciationID.value.value,
    weekStartDate: expectedConsumedPointLog.weekStartDate.value,
    consumedPoints: expectedConsumedPointLog.consumedPoints.value,
    createdAt: actualRecord.createdAt
  };

  expect(actualRecord).toEqual(expectedRecord);
};
