import type { UserID } from "../../domain/user/User";

/**
 * Appreciation作成時に発生しうるエラーを管理するクラス
 */
export class CreateAppreciationError extends Error {
  constructor(public readonly message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  /**
   * 送信者が受信者リストに含まれている場合のエラーを作成
   */
  static senderInReceivers(userID: UserID): CreateAppreciationError {
    return new CreateAppreciationError(
      `送信者が受信者リストに含まれています。送信者: ${userID.value.value}`
    );
  }

  /**
   * 総ポイントが制限を超えている場合のエラーを作成
   */
  static totalPointExceedsLimit(totalPoints: number): CreateAppreciationError {
    return new CreateAppreciationError(
      `総ポイントが制限を超えています。総ポイント: ${totalPoints}`
    );
  }
}

/**
 * 週次ポイント制限を超えている場合のエラー
 */
export class WeeklyPointLimitExceededError extends Error {
  constructor(
    public readonly attemptedConsumption: number,
    public readonly weeklyLimit: number
  ) {
    super(
      `週次ポイント制限を超えています。消費予定: ${attemptedConsumption}pt, 制限: ${weeklyLimit}pt`
    );
    this.name = this.constructor.name;
  }
}
