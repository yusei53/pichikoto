// Appreciationエンティティに関するエラー

export type AppreciationError =
  | SenderInReceiversError
  | TotalPointExceedsLimitError;

/**
 * 送信者が受信者リストに含まれている場合のエラー
 */
export class SenderInReceiversError extends Error {
  constructor() {
    super("Sender cannot be included in receivers");
    this.name = this.constructor.name;
  }
}

/**
 * 送信者が受信者リストに含まれている場合のエラー
 */
export class TotalPointExceedsLimitError extends Error {
  constructor(totalPoints: number) {
    super(`Total points (${totalPoints}) cannot exceed the limit`);
    this.name = this.constructor.name;
  }
}
