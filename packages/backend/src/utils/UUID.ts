import { v4 as randomUUID } from "uuid";
import { z } from "zod";

const UUIDSchema = z.string().uuid("Invalid UUID format");

export class UUID {
  private constructor(public readonly value: string) {}

  /**
   * 新しいランダムなUUIDを生成する
   * @returns UUID
   */
  static new(): UUID {
    return new UUID(randomUUID());
  }

  /**
   * 文字列からUUIDを生成する
   * @param value - 文字列
   * @returns UUID
   */
  static from(value: string): UUID {
    const validatedValue = UUIDSchema.parse(value);
    return new UUID(validatedValue);
  }
}
