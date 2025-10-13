import { describe, expect, it, vi } from "vitest";
import { NewTotalConsumptionPoints } from "../../../src/domain/appreciation/Appreciation";
import {
  ValidateWeeklyLimitError,
  WeeklyPointLimitDomainService
} from "../../../src/domain/appreciation/WeeklyPointLimitDomainService";
import { UserID } from "../../../src/domain/user/User";
import type { AppreciationRepositoryInterface } from "../../../src/infrastructure/repositories/AppreciationRepository";
import { expectErr, expectOk } from "../../testing/utils/AssertResult";

describe("WeeklyPointLimitDomainService Tests", () => {
  const createMockRepository = (): AppreciationRepositoryInterface => ({
    store: vi.fn(),
    findBy: vi.fn(),
    calculateWeeklyPointConsumption: vi.fn(),
    delete: vi.fn()
  });

  describe("validateWeeklyLimit", () => {
    it("週次制限内の場合は成功すること", async () => {
      // arrange
      const mockRepository = createMockRepository();
      const service = new WeeklyPointLimitDomainService(mockRepository);

      const userID = UserID.new();

      vi.mocked(
        mockRepository.calculateWeeklyPointConsumption
      ).mockResolvedValue(200);

      const newConsumption = NewTotalConsumptionPoints.from(50);
      // act
      const result = await service.validateWeeklyLimit(userID, newConsumption);

      // assert
      expectOk(result);
    });

    it("週次制限を超える場合はエラーになること", async () => {
      // arrange
      const mockRepository = createMockRepository();
      const service = new WeeklyPointLimitDomainService(mockRepository);

      const userID = UserID.new();

      vi.mocked(
        mockRepository.calculateWeeklyPointConsumption
      ).mockResolvedValue(300);

      // 新規消費予定（120ポイント） → 合計420ポイント（制限400を超過）
      const newConsumption = NewTotalConsumptionPoints.from(120);

      // act
      const result = await service.validateWeeklyLimit(userID, newConsumption);

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

      // 既存の消費記録なし
      vi.mocked(
        mockRepository.calculateWeeklyPointConsumption
      ).mockResolvedValue(0);

      // 新規消費予定（100ポイント）
      const newConsumption = NewTotalConsumptionPoints.from(100);

      // act
      const result = await service.validateWeeklyLimit(userID, newConsumption);

      // assert
      expectOk(result);
    });
  });
});
