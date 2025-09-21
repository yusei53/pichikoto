import { z } from "zod";

const dateSchema = z.date();

export class CreatedAt {
  private constructor(public readonly value: Date) {}

  /**
   * 新しいCreatedAtオブジェクトを作成する
   * @returns CreatedAt
   */
  static new(): CreatedAt {
    return new CreatedAt(new Date());
  }

  /**
   * 日付からCreatedAtオブジェクトを作成する
   * @param value - 日付
   * @returns CreatedAt
   */
  static from(value: Date): CreatedAt {
    const validatedDate = dateSchema.parse(value);
    return new CreatedAt(validatedDate);
  }
}
