import {
  MAX_APPRECIATION_POINT,
  MAX_MESSAGE_LENGTH,
  MAX_RECEIVERS,
  MIN_APPRECIATION_POINT
} from "./Appreciation";

// Appreciationエンティティに関するエラー
/**
 * 受信者が指定されていない場合のエラー
 */
export class NoReceiversError extends Error {
  constructor() {
    super("At least one receiver is required");
    this.name = "NoReceiversError";
  }
}

/**
 * 受信者数が最大値（6人）を超えた場合のエラー
 */
export class TooManyReceiversError extends Error {
  constructor() {
    super(`Maximum ${MAX_RECEIVERS} receivers allowed`);
    this.name = "TooManyReceiversError";
  }
}

/**
 * 受信者リストに重複がある場合のエラー
 */
export class DuplicateReceiversError extends Error {
  constructor() {
    super("Duplicate receivers are not allowed");
    this.name = "DuplicateReceiversError";
  }
}

/**
 * 送信者が受信者リストに含まれている場合のエラー
 */
export class SenderInReceiversError extends Error {
  constructor() {
    super("Sender cannot be included in receivers");
    this.name = "SenderInReceiversError";
  }
}

// AppreciationMessageに関するエラー

/**
 * 感謝メッセージが空文字の場合のエラー
 */
export class EmptyMessageError extends Error {
  constructor() {
    super("Message cannot be empty");
    this.name = "EmptyMessageError";
  }
}

/**
 * 感謝メッセージが最大値（200）を超えた場合のエラー
 */
export class TooLongMessageError extends Error {
  constructor() {
    super(`Message must be at most ${MAX_MESSAGE_LENGTH}`);
    this.name = "TooLongMessageError";
  }
}

// AppreciationPointに関するエラー
/**
 * 感謝ポイントが最小値（1）未満の場合のエラー
 */
export class AppreciationPointTooLowError extends Error {
  constructor() {
    super(`AppreciationPoint must be at least ${MIN_APPRECIATION_POINT}`);
    this.name = "AppreciationPointTooLowError";
  }
}

/**
 * 感謝ポイントが最大値（120）を超えた場合のエラー
 */
export class AppreciationPointTooHighError extends Error {
  constructor() {
    super(`AppreciationPoint must be at most ${MAX_APPRECIATION_POINT}`);
    this.name = "AppreciationPointTooHighError";
  }
}
