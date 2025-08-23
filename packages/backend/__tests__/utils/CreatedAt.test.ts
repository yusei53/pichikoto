import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreatedAt } from "../../src/utils/CreatedAt";

describe("CreatedAt", () => {
  const MOCK_DATE = new Date("2025-01-01T00:00:00.000Z").getTime();

  describe("CreatedAt.new()", () => {
    beforeEach(() => {
      // NOTE: 時刻を固定するためにモックを使用する
      vi.useFakeTimers();
      vi.setSystemTime(MOCK_DATE);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("現在時刻でCreatedAtオブジェクトを作成できること", () => {
      const createdAt = CreatedAt.new();

      expect(createdAt).toBeInstanceOf(CreatedAt);
      expect(createdAt.value).toBeInstanceOf(Date);
      expect(createdAt.value.getTime()).toBe(MOCK_DATE);
    });
  });

  describe("CreatedAt.from()", () => {
    describe("正常系", () => {
      it("有効なDateオブジェクトからCreatedAtオブジェクトを作成できること", () => {
        const validDate = new Date("2023-12-25T10:30:00.000Z");
        const createdAt = CreatedAt.from(validDate);

        expect(createdAt).toBeInstanceOf(CreatedAt);
        expect(createdAt.value).toBeInstanceOf(Date);
        expect(createdAt.value.getTime()).toBe(validDate.getTime());
      });

      it("現在時刻のDateオブジェクトから作成できること", () => {
        const now = new Date();
        const createdAt = CreatedAt.from(now);

        expect(createdAt.value.getTime()).toBe(now.getTime());
      });

      it("過去の日付から作成できること", () => {
        const pastDate = new Date("1990-01-01T00:00:00.000Z");
        const createdAt = CreatedAt.from(pastDate);

        expect(createdAt.value.getTime()).toBe(pastDate.getTime());
      });

      it("未来の日付から作成できること", () => {
        const futureDate = new Date("2030-12-31T23:59:59.999Z");
        const createdAt = CreatedAt.from(futureDate);

        expect(createdAt.value.getTime()).toBe(futureDate.getTime());
      });
    });

    describe("異常系", () => {
      it("Date型でない値の場合はエラーを投げること", () => {
        const invalidDate = new Date("invalid-date-string");

        expect(() => CreatedAt.from(invalidDate)).toThrow(
          "Invalid date format"
        );
      });

      it("NaN の値の場合はエラーを投げること", () => {
        const nanDate = new Date(NaN);

        expect(() => CreatedAt.from(nanDate)).toThrow("Invalid date format");
      });
    });
  });

  describe("日付の精度", () => {
    it("ミリ秒単位の精度を保持すること", () => {
      const preciseDate = new Date("2023-06-15T12:30:45.123Z");
      const createdAt = CreatedAt.from(preciseDate);

      expect(createdAt.value.getMilliseconds()).toBe(123);
      expect(createdAt.value.getTime()).toBe(preciseDate.getTime());
    });
  });

  describe("タイムゾーンの扱い", () => {
    it("UTC時刻を正しく保持すること", () => {
      const utcDate = new Date("2023-06-15T12:00:00.000Z");
      const createdAt = CreatedAt.from(utcDate);

      expect(createdAt.value.toISOString()).toBe("2023-06-15T12:00:00.000Z");
    });
  });
});
