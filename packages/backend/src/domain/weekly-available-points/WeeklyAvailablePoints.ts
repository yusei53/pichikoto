import { CreatedAt } from "../utils/CreatedAt";
import { UUID } from "../utils/UUID";
import type { UserID } from "./User";

const WEEKLY_AVAILABLE_POINTS = 400;

export class WeeklyAvailablePoints {
  private constructor(
    readonly weeklyAvailablePointsID: WeeklyAvailablePointsID,
    readonly userID: UserID,
    readonly initializedAt: InitializedAt,
    readonly availablePoints: AvailablePoints,
    readonly createdAt: CreatedAt
  ) {}

  static create(
    userID: UserID,
    initializedAt: InitializedAt
  ): WeeklyAvailablePoints {
    return new WeeklyAvailablePoints(
      WeeklyAvailablePointsID.new(),
      userID,
      initializedAt,
      AvailablePoints.new(),
      CreatedAt.new()
    );
  }

  static reconstruct(
    weeklyAvailablePointsID: WeeklyAvailablePointsID,
    userID: UserID,
    initializedAt: InitializedAt,
    availablePoints: AvailablePoints,
    createdAt: CreatedAt
  ): WeeklyAvailablePoints {
    return new WeeklyAvailablePoints(
      weeklyAvailablePointsID,
      userID,
      initializedAt,
      availablePoints,
      createdAt
    );
  }
}

export class WeeklyAvailablePointsID {
  private constructor(readonly value: UUID) {}

  static new(): WeeklyAvailablePointsID {
    return new WeeklyAvailablePointsID(UUID.new());
  }

  static from(value: string): WeeklyAvailablePointsID {
    return new WeeklyAvailablePointsID(UUID.from(value));
  }
}

export class InitializedAt {
  private constructor(readonly value: Date) {}

  static new(): InitializedAt {
    return new InitializedAt(new Date());
  }
}

export class AvailablePoints {
  private constructor(readonly value: number) {}

  static new(): AvailablePoints {
    return new AvailablePoints(WEEKLY_AVAILABLE_POINTS);
  }
}
