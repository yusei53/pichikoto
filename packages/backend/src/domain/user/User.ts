import { z } from "zod";

export class User {
  private constructor(
    readonly discordUserID: DiscordUserID,
    readonly discordUserName: string,
    readonly discordAvatar: string
  ) {}

  static create(
    discordUserID: DiscordUserID,
    discordUserName: string,
    discordAvatar: string
  ): User {
    return new User(discordUserID, discordUserName, discordAvatar);
  }

  static reconstruct(
    discordUserID: DiscordUserID,
    discordUserName: string,
    discordAvatar: string
  ): User {
    return new User(discordUserID, discordUserName, discordAvatar);
  }
}

const DiscordUserIDSchema = z
  .string()
  .regex(/^\d+$/, "Discord ID must contain only digits");

export class DiscordUserID {
  private constructor(readonly value: string) {}

  static from(value: string): DiscordUserID {
    const validatedValue = DiscordUserIDSchema.parse(value);
    return new DiscordUserID(validatedValue);
  }

  /**
   * ランダムなDiscord IDを生成する
   * このメソッドはテストのみで使用する。アプリケーションコードでの呼び出しは禁止
   * TODO: テスト専用メソッドとして整理する
   * @returns DiscordUserID
   */
  static new(): DiscordUserID {
    // Discord IDは通常18桁の数字で構成される
    // ランダムな18桁の数字を生成（最初の桁は0以外）
    const firstDigit = Math.floor(Math.random() * 9) + 1; // 1-9
    const remainingDigits = Array.from({ length: 17 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    const randomDiscordId = firstDigit.toString() + remainingDigits;
    return new DiscordUserID(randomDiscordId);
  }
}
