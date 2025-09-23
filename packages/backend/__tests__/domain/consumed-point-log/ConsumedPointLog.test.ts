import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { AppreciationID } from "../../../src/domain/appreciation/Appreciation";
import {
  ConsumedPointLog,
  ConsumedPointLogID,
  ConsumedPoints,
  WeekStartDate
} from "../../../src/domain/consumed-point-log/ConsumedPointLog";
import { UserID } from "../../../src/domain/user/User";
import { CreatedAt } from "../../../src/utils/CreatedAt";
import { UUID } from "../../../src/utils/UUID";

const MOCK_CONSUMED_POINT_LOG_ID = UUID.new().value;
const MOCK_NOW_DATE = new Date("2025-01-01T00:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(MOCK_NOW_DATE);

  vi.spyOn(ConsumedPointLogID, "new").mockReturnValue(
    new (class {
      constructor(public readonly value: UUID) {}
    })(UUID.from(MOCK_CONSUMED_POINT_LOG_ID))
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("ConsumedPointLogDomainTest", () => {
  const userID = UserID.new();
  const appreciationID = AppreciationID.new();
  const weekStartDate = WeekStartDate.new();
  const consumedPoints = ConsumedPoints.from(50);

  describe("ConsumedPointLogドメインモデルの作成", () => {
    it("ConsumedPointLogドメインモデルを作成できること", () => {
      const expected = ConsumedPointLog.reconstruct(
        ConsumedPointLogID.new(),
        userID,
        appreciationID,
        weekStartDate,
        consumedPoints,
        CreatedAt.new()
      );

      const actual = ConsumedPointLog.create(
        userID,
        appreciationID,
        weekStartDate,
        consumedPoints
      );

      expect(actual).toStrictEqual(expected);
    });

    it("ConsumedPointLogIDを文字列から再構築できること", () => {
      const uuidString = UUID.new().value;
      const reconstructedID = ConsumedPointLogID.from(uuidString);
      expect(reconstructedID.value.value).toBe(uuidString);
    });
  });

  describe("ConsumedPointsのバリデーション", () => {
    it("正常な値で作成できること", () => {
      const result = ConsumedPoints.from(50);
      expect(result.value).toBe(50);
    });

    it("最小値（1）で作成できること", () => {
      const result = ConsumedPoints.from(1);
      expect(result.value).toBe(1);
    });

    it("最大値（120）で作成できること", () => {
      const result = ConsumedPoints.from(120);
      expect(result.value).toBe(120);
    });

    it("0で作成すると例外が発生すること", () => {
      const fn = () => ConsumedPoints.from(0);

      expect(fn).toThrow(ZodError);
      expect(fn).toThrow("消費ポイントは1以上である必要があります");
    });

    it("負の値で作成すると例外が発生すること", () => {
      const fn = () => ConsumedPoints.from(-1);

      expect(fn).toThrow(ZodError);
      expect(fn).toThrow("消費ポイントは1以上である必要があります");
    });

    it("最大値を超える値で作成すると例外が発生すること", () => {
      const fn = () => ConsumedPoints.from(121);

      expect(fn).toThrow(ZodError);
      expect(fn).toThrow("消費ポイントは120以下である必要があります");
    });

    it("小数値で作成すると例外が発生すること", () => {
      const fn = () => ConsumedPoints.from(1.5);

      expect(fn).toThrow(ZodError);
      expect(fn).toThrow("消費ポイントは整数である必要があります");
    });
  });

  describe("WeekStartDateの動作確認", () => {
    it("指定された文字列でWeekStartDateを作成できること", () => {
      const dateString = "2025-01-15";
      const weekStartDate = WeekStartDate.fromString(dateString);
      expect(weekStartDate.value).toBe(dateString);
    });

    it("現在の週の開始日（月曜日）を取得できること", () => {
      // 2025-01-01は水曜日なので、同じ週の月曜日は2024-12-30
      const expectedMondayString = "2024-12-30";
      const weekStartDate = WeekStartDate.new();
      expect(weekStartDate.value).toBe(expectedMondayString);
    });

    it("月曜日の場合はその日がweekStartDateになること", () => {
      // 2025-01-06は月曜日
      vi.setSystemTime(new Date("2025-01-06T15:30:00.000Z"));
      const expectedMondayString = "2025-01-06";
      const weekStartDate = WeekStartDate.new();
      expect(weekStartDate.value).toBe(expectedMondayString);
    });

    it("日曜日の場合は前の週の月曜日がweekStartDateになること", () => {
      // 2025-01-05は日曜日、前の週の月曜日は2024-12-30
      vi.setSystemTime(new Date("2025-01-05T15:30:00.000Z"));
      const expectedMondayString = "2024-12-30";
      const weekStartDate = WeekStartDate.new();
      expect(weekStartDate.value).toBe(expectedMondayString);
    });
  });
});
