import { CreatedAt } from "../utils/CreatedAt";
import { UUID } from "../utils/UUID";
import {
  DuplicateReceiversError,
  EmptyMessageError,
  NoReceiversError,
  PointPerReceiverTooHighError,
  PointPerReceiverTooLowError,
  SenderInReceiversError,
  TooLongMessageError,
  TooManyReceiversError,
  TotalPointExceedsLimitError
} from "./AppreciationError";
import type { UserID } from "./User";

export const MAX_RECEIVERS = 6;
export const MIN_POINT_PER_RECEIVER = 1;
export const MAX_POINT_PER_RECEIVER = 120;
export const MAX_TOTAL_POINTS = 120;
export const MIN_MESSAGE_LENGTH = 1;
export const MAX_MESSAGE_LENGTH = 200;

export class Appreciation {
  private constructor(
    readonly appreciationID: AppreciationID,
    readonly senderID: UserID,
    readonly receiverIDs: readonly UserID[],
    readonly message: AppreciationMessage,
    readonly pointPerReceiver: PointPerReceiver,
    readonly createdAt: CreatedAt
  ) {}

  static create(
    senderID: UserID,
    receiverIDs: UserID[],
    message: AppreciationMessage,
    pointPerReceiver: PointPerReceiver
  ): Appreciation {
    if (receiverIDs.length === 0) throw new NoReceiversError();
    if (receiverIDs.length > MAX_RECEIVERS) throw new TooManyReceiversError();

    // 重複する受信者をチェック
    const uniqueReceiverIDs = new Set(receiverIDs.map((id) => id.value.value));
    if (uniqueReceiverIDs.size !== receiverIDs.length) {
      throw new DuplicateReceiversError();
    }

    // 送信者が受信者に含まれていないかチェック
    if (uniqueReceiverIDs.has(senderID.value.value)) {
      throw new SenderInReceiversError();
    }

    // 総ポイント（ポイント×受信者数）が最大値を超えないかチェック
    const totalPoints = pointPerReceiver.value * receiverIDs.length;
    if (totalPoints > MAX_TOTAL_POINTS) {
      throw new TotalPointExceedsLimitError(totalPoints);
    }

    return new Appreciation(
      AppreciationID.new(),
      senderID,
      Object.freeze([...receiverIDs]), // イミュータブルな配列として扱う
      message,
      pointPerReceiver,
      CreatedAt.new()
    );
  }

  static reconstruct(
    appreciationID: AppreciationID,
    senderID: UserID,
    receiverIDs: UserID[],
    message: AppreciationMessage,
    pointPerReceiver: PointPerReceiver,
    createdAt: CreatedAt
  ): Appreciation {
    return new Appreciation(
      appreciationID,
      senderID,
      Object.freeze([...receiverIDs]),
      message,
      pointPerReceiver,
      createdAt
    );
  }
}

export class AppreciationID {
  private constructor(readonly value: UUID) {}

  static new(): AppreciationID {
    return new AppreciationID(UUID.new());
  }

  static from(value: string): AppreciationID {
    return new AppreciationID(UUID.from(value));
  }
}

export class AppreciationMessage {
  private constructor(readonly value: string) {}

  static from(value: string): AppreciationMessage {
    /**
     * 空文字の場合はエラーになる
     * 1文字未満の場合はエラーになる
     * 200文字超えの場合はエラーになる
     */
    if (value.trim().length === 0) throw new EmptyMessageError();
    if (value.length > MAX_MESSAGE_LENGTH) throw new TooLongMessageError();

    return new AppreciationMessage(value);
  }
}

/**
 * 感謝ポイントを表す値オブジェクト
 * 複数の集約で共有される共通概念
 */
export class PointPerReceiver {
  private constructor(readonly value: number) {}
  /**
   * 1未満の場合はエラーになる
   * 120超えの場合はエラーになる
   */
  static from(value: number): PointPerReceiver {
    if (value < MIN_POINT_PER_RECEIVER) throw new PointPerReceiverTooLowError();
    if (value > MAX_POINT_PER_RECEIVER)
      throw new PointPerReceiverTooHighError();

    return new PointPerReceiver(value);
  }
}
