import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
import { getTypedSingleRecord } from "../../testing/utils/DatabaseAssertHelpers";
import {
  deleteFromDatabase,
  insertToDatabase
} from "../../testing/utils/GenericTableHelper";

describe("ConsumedPointLogRepository Tests", () => {
  const consumedPointLogRepository = new ConsumedPointLogRepository();

  // 各テスト前にデータベースをクリーンアップ
  beforeEach(async () => {
    await deleteFromDatabase(schema.consumedPointLog);
    await deleteFromDatabase(schema.appreciations);
    await deleteFromDatabase(schema.user);
  });

  describe("store", () => {
    afterEach(async () => {
      await deleteFromDatabase(schema.consumedPointLog);
      await deleteFromDatabase(schema.appreciations);
      await deleteFromDatabase(schema.user);
    });

    it("ポイント消費記録を保存できること", async () => {
      // arrange
      // 固定のUUIDを使用してテストの安定性を確保
      const fixedUserUUID = "5fb2a95a-e338-4634-8738-8e44b2445a76";
      const fixedAppreciationUUID = "2f7e9f3c-88c0-458e-ba55-426f22aa8f4d";
      const fixedConsumedPointLogUUID = "90222b70-16c3-4bb2-88cc-a4d1c047022a";

      const user = createUserTableFixture();
      user.id = fixedUserUUID;

      const appreciation = createAppreciationTableFixture();
      appreciation.id = fixedAppreciationUUID;
      appreciation.senderId = user.id;

      await insertToDatabase(schema.user, user);
      await insertToDatabase(schema.appreciations, appreciation);

      const consumedPointLog = ConsumedPointLog.reconstruct(
        ConsumedPointLogID.from(fixedConsumedPointLogUUID),
        UserID.from(user.id),
        AppreciationID.from(appreciation.id),
        WeekStartDate.fromString("2025-01-06"), // 月曜日
        ConsumedPoints.from(30),
        CreatedAt.from(new Date())
      );

      // act
      await consumedPointLogRepository.store(consumedPointLog);

      // assert
      const actualRecord = await getTypedSingleRecord(schema.consumedPointLog);
      assertEqualConsumedPointLogTable(consumedPointLog, actualRecord!);
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

  describe("findByUserAndWeek", () => {
    const setupConsumedPointLogs = async () => {
      // ユーザーを作成
      const user1 = createUserTableFixture();
      const user2 = createUserTableFixture();
      await insertToDatabase(schema.user, user1);
      await insertToDatabase(schema.user, user2);

      // 感謝を作成
      const appreciation1 = createAppreciationTableFixture();
      const appreciation2 = createAppreciationTableFixture();
      const appreciation3 = createAppreciationTableFixture();
      appreciation1.senderId = user1.id;
      appreciation2.senderId = user1.id;
      appreciation3.senderId = user2.id;

      await insertToDatabase(schema.appreciations, appreciation1);
      await insertToDatabase(schema.appreciations, appreciation2);
      await insertToDatabase(schema.appreciations, appreciation3);

      // ポイント消費記録を作成
      const consumedPointLog1 = createConsumedPointLogTableFixtureWith({
        userId: user1.id,
        appreciationId: appreciation1.id,
        weekStartDate: "2025-01-06", // 同じ週
        consumedPoints: 30
      });
      const consumedPointLog2 = createConsumedPointLogTableFixtureWith({
        userId: user1.id,
        appreciationId: appreciation2.id,
        weekStartDate: "2025-01-06", // 同じ週
        consumedPoints: 50
      });
      const consumedPointLog3 = createConsumedPointLogTableFixtureWith({
        userId: user1.id,
        appreciationId: appreciation1.id,
        weekStartDate: "2025-01-13", // 異なる週
        consumedPoints: 20
      });
      const consumedPointLog4 = createConsumedPointLogTableFixtureWith({
        userId: user2.id,
        appreciationId: appreciation3.id,
        weekStartDate: "2025-01-06", // 同じ週、異なるユーザー
        consumedPoints: 40
      });

      await insertToDatabase(schema.consumedPointLog, consumedPointLog1);
      await insertToDatabase(schema.consumedPointLog, consumedPointLog2);
      await insertToDatabase(schema.consumedPointLog, consumedPointLog3);
      await insertToDatabase(schema.consumedPointLog, consumedPointLog4);

      return {
        user1,
        user2
      };
    };

    afterEach(async () => {
      await deleteFromDatabase(schema.consumedPointLog);
      await deleteFromDatabase(schema.appreciations);
      await deleteFromDatabase(schema.user);
    });

    it("指定されたユーザーと週のポイント消費記録を取得できること", async () => {
      // arrange
      const { user1 } = await setupConsumedPointLogs();
      const weekStartDate = WeekStartDate.fromString("2025-01-06");

      // act
      const actual = await consumedPointLogRepository.findByUserAndWeek(
        UserID.from(user1.id),
        weekStartDate
      );

      // assert
      expect(actual).toHaveLength(2);
      expect(actual[0].consumedPoints.value).toBe(30);
      expect(actual[1].consumedPoints.value).toBe(50);
      expect(actual[0].userID.value.value).toBe(user1.id);
      expect(actual[1].userID.value.value).toBe(user1.id);
    });

    it("該当するレコードがない場合は空配列を返すこと", async () => {
      // arrange
      const { user1 } = await setupConsumedPointLogs();
      const weekStartDate = WeekStartDate.fromString("2025-01-20"); // データがない週

      // act
      const actual = await consumedPointLogRepository.findByUserAndWeek(
        UserID.from(user1.id),
        weekStartDate
      );

      // assert
      expect(actual).toHaveLength(0);
    });

    it("存在しないユーザーの場合は空配列を返すこと", async () => {
      // arrange
      await setupConsumedPointLogs();
      const nonExistentUserID = UserID.from(UUID.new().value);
      const weekStartDate = WeekStartDate.fromString("2025-01-06");

      // act
      const actual = await consumedPointLogRepository.findByUserAndWeek(
        nonExistentUserID,
        weekStartDate
      );

      // assert
      expect(actual).toHaveLength(0);
    });
  });
});
