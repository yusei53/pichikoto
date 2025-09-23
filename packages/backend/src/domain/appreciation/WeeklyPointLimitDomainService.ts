import { err, ok, type Result } from "neverthrow";
import type { ConsumedPointLogRepositoryInterface } from "../../infrastructure/repositories/ConsumedPointLogRepository";
import { DomainError } from "../../utils/Error";
import type { WeekStartDate } from "../consumed-point-log/ConsumedPointLog";
import type { UserID } from "../user/User";
import type { NewTotalConsumptionPoints } from "./Appreciation";

/**
 * 週次ポイント制限の検証を担当するドメインサービス
 *
 * 複数の集約（Appreciation, ConsumedPointLog）にまたがる業務ルールを処理するため、
 * ドメインサービスとして実装
 */
export interface WeeklyPointLimitDomainServiceInterface {
  validateWeeklyLimit(
    userID: UserID,
    weekStartDate: WeekStartDate,
    newConsumption: NewTotalConsumptionPoints
  ): Promise<Result<void, ValidateWeeklyLimitError>>;
}

export class WeeklyPointLimitDomainService
  implements WeeklyPointLimitDomainServiceInterface
{
  /**
   * 週次ポイント制限の定数
   */
  private readonly WEEKLY_POINT_LIMIT = 400;

  constructor(
    private readonly consumedPointLogRepository: ConsumedPointLogRepositoryInterface
  ) {}

  async validateWeeklyLimit(
    userID: UserID,
    weekStartDate: WeekStartDate,
    newConsumption: NewTotalConsumptionPoints
  ): Promise<Result<void, ValidateWeeklyLimitError>> {
    const consumedLogs =
      await this.consumedPointLogRepository.findByUserAndWeek(
        userID,
        weekStartDate
      );

    const totalAlreadyConsumed = consumedLogs.reduce(
      (total, log) => total + log.consumedPoints.value,
      0
    );

    const totalConsumption = totalAlreadyConsumed + newConsumption.value;
    if (totalConsumption > this.WEEKLY_POINT_LIMIT) {
      return err(
        ValidateWeeklyLimitError.totalPointExceedsLimit(
          totalConsumption,
          this.WEEKLY_POINT_LIMIT
        )
      );
    }

    return ok();
  }
}

export class ValidateWeeklyLimitError extends DomainError {
  static totalPointExceedsLimit(
    totalConsumption: number,
    weeklyPointLimit: number
  ) {
    return new ValidateWeeklyLimitError(
      "TotalPointExceedsLimit :" +
        totalConsumption +
        ", weeklyPointLimit :" +
        weeklyPointLimit
    );
  }
}
