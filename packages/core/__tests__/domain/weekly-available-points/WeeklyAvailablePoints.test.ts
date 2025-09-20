import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserID } from "../../../src/domain/user";
import {
  AvailablePoints,
  InitializedAt,
  WeeklyAvailablePoints,
  WeeklyAvailablePointsID
} from "../../../src/domain/weekly-available-points";
import { CreatedAt } from "../../../src/utils";

const MOCK_WEEKLY_AVAILABLE_POINTS_ID = "00000000-0000-0000-0000-000000000000";
const MOCK_NOW_DATE = new Date("2025-01-01T00:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(MOCK_NOW_DATE);

  vi.spyOn(WeeklyAvailablePointsID, "new").mockReturnValue(
    WeeklyAvailablePointsID.from(MOCK_WEEKLY_AVAILABLE_POINTS_ID)
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("WeeklyAvailablePointsDomainTest", () => {
  const userID = UserID.new();
  const initializedAt = InitializedAt.new();

  describe("WeeklyAvailablePointsドメインの作成", () => {
    it("WeeklyAvailablePointsを作成できること", () => {
      // arrange
      const expected = WeeklyAvailablePoints.reconstruct(
        WeeklyAvailablePointsID.new(),
        userID,
        initializedAt,
        AvailablePoints.new(),
        CreatedAt.new()
      );

      // act
      const actual = WeeklyAvailablePoints.create(userID, initializedAt);

      // assert
      expect(actual).toStrictEqual(expected);
    });
  });
});
