import { describe, expect, it, vi } from "vitest";
import { AppreciationID } from "../../../src/domain/appreciation/Appreciation";
import {
  ValidateWeeklyLimitError,
  WeeklyPointLimitDomainService
} from "../../../src/domain/appreciation/WeeklyPointLimitDomainService";
import {
  ConsumedPointLog,
  ConsumedPointLogID,
  ConsumedPoints,
  WeekStartDate
} from "../../../src/domain/consumed-point-log/ConsumedPointLog";
import { UserID } from "../../../src/domain/user/User";
import type { ConsumedPointLogRepositoryInterface } from "../../../src/infrastructure/repositories/ConsumedPointLogRepository";
import { CreatedAt } from "../../../src/utils/CreatedAt";
import { expectErr, expectOk } from "../../testing/utils/AssertResult";

describe("WeeklyPointLimitDomainService Tests", () => {
  const createMockRepository = (): ConsumedPointLogRepositoryInterface => ({
    store: vi.fn(),
    findBy: vi.fn(),
    findByUserAndWeek: vi.fn()
  });

  describe("validateWeeklyLimit", () => {
    it("週次制限内の場合は成功すること", async () => {
      // arrange
      const mockRepository = createMockRepository();
      const service = new WeeklyPointLimitDomainService(mockRepository);

      const userID = UserID.new();
      const weekStartDate = WeekStartDate.fromString("2025-01-06");

      // 既存の消費記録（合計200ポイント）
      const existingLogs = [
        ConsumedPointLog.reconstruct(
          ConsumedPointLogID.new(),
          userID,
          AppreciationID.new(),
          weekStartDate,
          ConsumedPoints.from(100),
          CreatedAt.new()
        ),
        ConsumedPointLog.reconstruct(
          ConsumedPointLogID.new(),
          userID,
          AppreciationID.new(),
          weekStartDate,
          ConsumedPoints.from(100),
          CreatedAt.new()
        )
      ];

      vi.mocked(mockRepository.findByUserAndWeek).mockResolvedValue(
        existingLogs
      );

      // 新規消費予定（50ポイント） → 合計250ポイント（制限400以下）
      const newConsumption = { value: 50 } as any;

      // act
      const result = await service.validateWeeklyLimit(
        userID,
        weekStartDate,
        newConsumption
      );

      // assert
      expectOk(result);
    });

    it("週次制限を超える場合はエラーになること", async () => {
      // arrange
      const mockRepository = createMockRepository();
      const service = new WeeklyPointLimitDomainService(mockRepository);

      const userID = UserID.new();
      const weekStartDate = WeekStartDate.fromString("2025-01-06");

      // 既存の消費記録（合計240ポイント）
      const existingLogs = [
        ConsumedPointLog.reconstruct(
          ConsumedPointLogID.new(),
          userID,
          AppreciationID.new(),
          weekStartDate,
          ConsumedPoints.from(120),
          CreatedAt.new()
        ),
        ConsumedPointLog.reconstruct(
          ConsumedPointLogID.new(),
          userID,
          AppreciationID.new(),
          weekStartDate,
          ConsumedPoints.from(120),
          CreatedAt.new()
        )
      ];

      vi.mocked(mockRepository.findByUserAndWeek).mockResolvedValue(
        existingLogs
      );

      // 新規消費予定（120ポイント） → 合計360ポイント（制限400以下）
      // 実際に制限を超過させるには、180ポイントが必要
      const newConsumption = { value: 180 } as any;

      // act
      const result = await service.validateWeeklyLimit(
        userID,
        weekStartDate,
        newConsumption
      );

      // assert
      const actual = expectErr(result);
      expect(actual).toBeInstanceOf(ValidateWeeklyLimitError);
      expect(actual.message).toEqual(
        "TotalPointExceedsLimit :420, weeklyPointLimit :400"
      );
    });

    it("既存の消費記録がない場合は正常に処理されること", async () => {
      // arrange
      const mockRepository = createMockRepository();
      const service = new WeeklyPointLimitDomainService(mockRepository);

      const userID = UserID.new();
      const weekStartDate = WeekStartDate.fromString("2025-01-06");

      // 既存の消費記録なし
      vi.mocked(mockRepository.findByUserAndWeek).mockResolvedValue([]);

      // 新規消費予定（100ポイント）
      const newConsumption = { value: 100 } as any;

      // act
      const result = await service.validateWeeklyLimit(
        userID,
        weekStartDate,
        newConsumption
      );

      // assert
      expectOk(result);
    });
  });
});
