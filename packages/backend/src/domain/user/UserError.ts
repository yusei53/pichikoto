// Userドメインに関するエラー

/**
 * DiscordIDが無効な場合のエラー
 */
export class InvalidDiscordIDError extends Error {
  constructor() {
    super("Invalid Discord ID: must contain only digits");
    this.name = "InvalidDiscordIDError";
  }
}
