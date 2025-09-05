import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserID } from "../../../src/domain/user/User";
import {
  AvailablePoints,
  InitializedAt,
  WeeklyAvailablePoints,
  WeeklyAvailablePointsID
} from "../../../src/domain/weekly-available-points/WeeklyAvailablePoints";
import { CreatedAt } from "../../src/utils/CreatedAt";
import { UUID } from "../../src/utils/UUID";

const MOCK_WEEKLY_AVAILABLE_POINTS_ID = UUID.new().value;
const MOCK_NOW_DATE = new Date("2025-01-01T00:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(MOCK_NOW_DATE);

  vi.spyOn(WeeklyAvailablePointsID, "new").mockReturnValue(
    new (class {
      constructor(public readonly value: UUID) {}
    })(UUID.from(MOCK_WEEKLY_AVAILABLE_POINTS_ID))
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
