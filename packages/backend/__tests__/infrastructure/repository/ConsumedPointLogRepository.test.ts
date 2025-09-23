import { afterEach, describe, expect, it } from "vitest";
import * as schema from "../../../database/schema";
import { AppreciationID } from "../../../src/domain/appreciation/Appreciation";
import {
  ConsumedPointLog,
  ConsumedPointLogID,
  ConsumedPoints,
  WeekStartDate
} from "../../../src/domain/consumed-point-log/ConsumedPointLog";
import { UserID } from "../../../src/domain/user/User";
import { ConsumedPointLogRepository } from "../../../src/infrastructure/repositories/ConsumedPointLogRepository";
import { CreatedAt } from "../../../src/utils/CreatedAt";
import { UUID } from "../../../src/utils/UUID";
import { assertEqualConsumedPointLogTable } from "../../testing/table_assert/AssertEqualConsumedPointLogTable";
import { createAppreciationTableFixture } from "../../testing/table_fixture/AppreciationTableFixture";
import { createConsumedPointLogTableFixtureWith } from "../../testing/table_fixture/ConsumedPointLogTableFixture";
import { createUserTableFixture } from "../../testing/table_fixture/UserTableFixture";
import {
  deleteFromDatabase,
  insertToDatabase,
  selectOneFromDatabase
} from "../../testing/utils/GenericTableHelper";

describe("ConsumedPointLogRepository Tests", () => {
  const consumedPointLogRepository = new ConsumedPointLogRepository();

  describe("store", () => {
    afterEach(async () => {
      await deleteFromDatabase(schema.consumedPointLog);
      await deleteFromDatabase(schema.appreciations);
      await deleteFromDatabase(schema.user);
    });

    it("ポイント消費記録を保存できること", async () => {
      // arrange
      const user = createUserTableFixture();
      const appreciation = createAppreciationTableFixture();
      appreciation.senderId = user.id;

      await insertToDatabase(schema.user, user);
      await insertToDatabase(schema.appreciations, appreciation);

      const consumedPointLog = ConsumedPointLog.reconstruct(
        ConsumedPointLogID.from(UUID.new().value),
        UserID.from(user.id),
        AppreciationID.from(appreciation.id),
        WeekStartDate.fromString("2025-01-06"), // 月曜日
        ConsumedPoints.from(30),
        CreatedAt.from(new Date())
      );

      // act
      await consumedPointLogRepository.store(consumedPointLog);

      // assert
      const actualRecord = (await selectOneFromDatabase(
        schema.consumedPointLog
      )) as typeof schema.consumedPointLog.$inferSelect;
      assertEqualConsumedPointLogTable(consumedPointLog, actualRecord);
    });
  });

  describe("findBy", () => {
    const setupConsumedPointLog = async () => {
      // ユーザーを作成
      const user = createUserTableFixture();
      await insertToDatabase(schema.user, user);

      // 感謝を作成
      const appreciation = createAppreciationTableFixture();
      appreciation.senderId = user.id;
      await insertToDatabase(schema.appreciations, appreciation);

      // ポイント消費記録を作成
      const consumedPointLogRecord = createConsumedPointLogTableFixtureWith({
        userId: user.id,
        appreciationId: appreciation.id,
        weekStartDate: "2025-01-06",
        consumedPoints: 25
      });
      await insertToDatabase(schema.consumedPointLog, consumedPointLogRecord);

      return {
        consumedPointLogRecord,
        user,
        appreciation
      };
    };

    afterEach(async () => {
      await deleteFromDatabase(schema.consumedPointLog);
      await deleteFromDatabase(schema.appreciations);
      await deleteFromDatabase(schema.user);
    });

    it("ポイント消費記録を取得できること", async () => {
      // arrange
      const { consumedPointLogRecord, user, appreciation } =
        await setupConsumedPointLog();

      const expectedConsumedPointLog = ConsumedPointLog.reconstruct(
        ConsumedPointLogID.from(consumedPointLogRecord.id),
        UserID.from(user.id),
        AppreciationID.from(appreciation.id),
        WeekStartDate.fromString(consumedPointLogRecord.weekStartDate),
        ConsumedPoints.from(consumedPointLogRecord.consumedPoints),
        CreatedAt.from(consumedPointLogRecord.createdAt)
      );

      // act
      const actual = await consumedPointLogRepository.findBy(
        ConsumedPointLogID.from(consumedPointLogRecord.id)
      );

      // assert
      expect(actual).toEqual(expectedConsumedPointLog);
    });

    it("存在しないポイント消費記録の場合はnullを返すこと", async () => {
      // arrange
      const nonExistentConsumedPointLogID = ConsumedPointLogID.from(
        UUID.new().value
      );

      // act
      const actual = await consumedPointLogRepository.findBy(
        nonExistentConsumedPointLogID
      );

      // assert
      expect(actual).toBeNull();
    });
  });
});
