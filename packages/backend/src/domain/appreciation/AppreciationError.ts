import type { UserID } from "../../domain/user/User";
import { DomainError } from "../../utils/Error";

/**
 * Appreciation作成時に発生しうるエラーを管理するクラス
 */

export class CreateAppreciationError extends DomainError {
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
