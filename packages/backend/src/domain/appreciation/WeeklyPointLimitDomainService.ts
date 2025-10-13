import { err, ok, type Result } from "neverthrow";
import type { AppreciationRepositoryInterface } from "../../infrastructure/repositories/AppreciationRepository";
import { DomainError } from "../../utils/Error";
import type { UserID } from "../user/User";
import type { NewTotalConsumptionPoints } from "./Appreciation";

/**
 * 週次ポイント制限の検証を担当するドメインサービス
 *
 * Appreciationの週次ポイント消費量を集計し、制限を超えないかを検証する
 * ドメインサービスとして実装
 */
export interface WeeklyPointLimitDomainServiceInterface {
  validateWeeklyLimit(
    userID: UserID,
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
    private readonly appreciationRepository: AppreciationRepositoryInterface
  ) {}

  async validateWeeklyLimit(
    userID: UserID,
    newConsumption: NewTotalConsumptionPoints
  ): Promise<Result<void, ValidateWeeklyLimitError>> {
    const weekStartDate = this.getCurrentWeekStartDate();
    const weekEndDate = this.getWeekEndDate(weekStartDate);

    // appreciationsテーブルから今週のポイント消費量を計算
    const totalAlreadyConsumed = await this.calculateWeeklyConsumption(
      userID,
      weekStartDate,
      weekEndDate
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

  /**
   * 現在の週の開始日（月曜日）を YYYY-MM-DD 形式で取得
   */
  private getCurrentWeekStartDate(): string {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - ((dayOfWeek + 6) % 7));
    monday.setUTCHours(0, 0, 0, 0);
    return monday.toISOString().split("T")[0];
  }

  /**
   * 週の終了日を取得（次の月曜日の日付）
   */
  private getWeekEndDate(weekStartDate: string): string {
    const startDate = new Date(`${weekStartDate}T00:00:00Z`);
    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 7);
    return endDate.toISOString().split("T")[0];
  }

  /**
   * 指定した週のユーザーのポイント消費量を計算
   * JOINクエリで効率的に集計計算
   */
  private async calculateWeeklyConsumption(
    userID: UserID,
    weekStartDate: string,
    weekEndDate: string
  ): Promise<number> {
    return await this.appreciationRepository.calculateWeeklyPointConsumption(
      userID,
      weekStartDate,
      weekEndDate
    );
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
