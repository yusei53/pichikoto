import { err, ok, type Result } from "neverthrow";
import { z } from "zod";
import type { UserID } from "../../domain/user/User";
import { CreatedAt } from "../../utils/CreatedAt";
import { UUID } from "../../utils/UUID";
import { CreateAppreciationError } from "./AppreciationError";

/**
 * 総ポイントの最大値（1回の投稿）
 */
const MAX_POINTS_PER_APPRECIATION = 120;

export class Appreciation {
  private constructor(
    readonly appreciationID: AppreciationID,
    readonly senderID: UserID,
    readonly receiverIDs: ReceiverIDs,
    readonly message: AppreciationMessage,
    readonly pointPerReceiver: PointPerReceiver,
    readonly createdAt: CreatedAt
  ) {}

  static create(
    senderID: UserID,
    receiverIDs: ReceiverIDs,
    message: AppreciationMessage,
    pointPerReceiver: PointPerReceiver
  ): Result<Appreciation, CreateAppreciationError> {
    // 送信者が受信者に含まれていないかチェック
    const uniqueReceiverIDs = new Set(
      receiverIDs.value.map((id) => id.value.value)
    );
    if (uniqueReceiverIDs.has(senderID.value.value)) {
      return err(CreateAppreciationError.senderInReceivers(senderID));
    }

    // 総ポイント（ポイント×受信者数）が最大値を超えないかチェック
    const totalPoints = pointPerReceiver.value * receiverIDs.value.length;
    if (totalPoints > MAX_POINTS_PER_APPRECIATION) {
      return err(CreateAppreciationError.totalPointExceedsLimit(totalPoints));
    }

    return ok(
      new Appreciation(
        AppreciationID.new(),
        senderID,
        receiverIDs,
        message,
        pointPerReceiver,
        CreatedAt.new()
      )
    );
  }

  static reconstruct(
    appreciationID: AppreciationID,
    senderID: UserID,
    receiverIDs: ReceiverIDs,
    message: AppreciationMessage,
    pointPerReceiver: PointPerReceiver,
    createdAt: CreatedAt
  ): Appreciation {
    return new Appreciation(
      appreciationID,
      senderID,
      receiverIDs,
      message,
      pointPerReceiver,
      createdAt
    );
  }

  /**
   * この感謝で消費される総ポイント数を取得
   */
  getTotalConsumedPoints(): NewTotalConsumptionPoints {
    const totalPoints =
      this.pointPerReceiver.value * this.receiverIDs.value.length;
    return NewTotalConsumptionPoints.from(totalPoints);
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

/**
 * 受信者の最大数
 */
const MAX_RECEIVERS = 6;

const ReceiversSchema = z
  .array(z.any())
  .min(1, "受信者は1人以上である必要があります")
  .max(MAX_RECEIVERS, `受信者は${MAX_RECEIVERS}人以下である必要があります`)
  .refine(
    (receiverIDs) => {
      const uniqueReceiverIDs = new Set(
        receiverIDs.map((id) => id.value.value)
      );
      return uniqueReceiverIDs.size === receiverIDs.length;
    },
    {
      message: "受信者リストに重複があります"
    }
  );

/**
 * 受信者リストを表す値オブジェクト
 */
export class ReceiverIDs {
  private constructor(readonly value: readonly UserID[]) {}

  static from(receiverIDs: UserID[]): ReceiverIDs {
    const validatedValue = ReceiversSchema.parse(receiverIDs);
    return new ReceiverIDs(Object.freeze([...validatedValue]));
  }
}

/**
 * メッセージの最小値・最大値
 */
const MIN_MESSAGE_LENGTH = 1;
const MAX_MESSAGE_LENGTH = 200;

const AppreciationMessageSchema = z
  .string()
  .min(MIN_MESSAGE_LENGTH, "メッセージは1文字以上である必要があります")
  .max(MAX_MESSAGE_LENGTH, "メッセージは200文字以下である必要があります")
  .refine((value) => value.trim().length > 0, {
    message: "メッセージは空文字であってはいけません"
  });

export class AppreciationMessage {
  private constructor(readonly value: string) {}

  static from(value: string): AppreciationMessage {
    const validatedValue = AppreciationMessageSchema.parse(value);
    return new AppreciationMessage(validatedValue);
  }
}

/**
 * 1人あたりの感謝ポイントの最小値・最大値
 */
const MIN_POINT_PER_RECEIVER = 1;
const MAX_POINT_PER_RECEIVER = 120;

const PointPerReceiverSchema = z
  .number()
  .min(MIN_POINT_PER_RECEIVER, "ポイントは1以上である必要があります")
  .max(MAX_POINT_PER_RECEIVER, "ポイントは120以下である必要があります")
  .int("ポイントは整数である必要があります");

export class PointPerReceiver {
  private constructor(readonly value: number) {}

  static from(value: number): PointPerReceiver {
    const validatedValue = PointPerReceiverSchema.parse(value);
    return new PointPerReceiver(validatedValue);
  }
}

/**
 * 新しく消費予定のポイント数（1〜120）
 */
export class NewTotalConsumptionPoints {
  private constructor(readonly value: number) {}

  static from(value: number): NewTotalConsumptionPoints {
    const schema = z
      .number()
      .min(1, "新規消費ポイントは1以上である必要があります")
      .max(120, "新規消費ポイントは120以下である必要があります")
      .int("新規消費ポイントは整数である必要があります");

    const validatedValue = schema.parse(value);
    return new NewTotalConsumptionPoints(validatedValue);
  }
}
