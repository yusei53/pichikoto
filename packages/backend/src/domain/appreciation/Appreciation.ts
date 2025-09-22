import { err, ok, type Result } from "neverthrow";
import { z } from "zod";
import type { UserID } from "../../domain/user/User";
import { CreatedAt } from "../../utils/CreatedAt";
import { UUID } from "../../utils/UUID";
import type { AppreciationError } from "./AppreciationError";
import {
  SenderInReceiversError,
  TotalPointExceedsLimitError
} from "./AppreciationError";

/**
 * 総ポイントの最大値
 */
const MAX_TOTAL_POINTS = 120;

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
  ): Result<Appreciation, AppreciationError> {
    // 送信者が受信者に含まれていないかチェック
    const uniqueReceiverIDs = new Set(
      receiverIDs.value.map((id) => id.value.value)
    );
    if (uniqueReceiverIDs.has(senderID.value.value)) {
      return err(new SenderInReceiversError());
    }

    // 総ポイント（ポイント×受信者数）が最大値を超えないかチェック
    const totalPoints = pointPerReceiver.value * receiverIDs.value.length;
    if (totalPoints > MAX_TOTAL_POINTS) {
      return err(new TotalPointExceedsLimitError(totalPoints));
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
 * 感謝ポイントの最小値・最大値
 */
const MIN_POINT_PER_RECEIVER = 1;
const MAX_POINT_PER_RECEIVER = 120;

const PointPerReceiverSchema = z
  .number()
  .min(MIN_POINT_PER_RECEIVER, "ポイントは1以上である必要があります")
  .max(MAX_POINT_PER_RECEIVER, "ポイントは120以下である必要があります")
  .int("ポイントは整数である必要があります");

/**
 * 感謝ポイントを表す値オブジェクト
 */
export class PointPerReceiver {
  private constructor(readonly value: number) {}

  static from(value: number): PointPerReceiver {
    const validatedValue = PointPerReceiverSchema.parse(value);
    return new PointPerReceiver(validatedValue);
  }
}
