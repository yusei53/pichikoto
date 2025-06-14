import { v4 as randomUUID, validate as UUIDValidate } from "uuid";

export class UUID {
  private constructor(public readonly value: string) {}

  static new(): UUID {
    return new UUID(randomUUID());
  }

  static from(value: string): UUID {
    if (!UUIDValidate(value)) throw new Error("Invalid UUID");
    return new UUID(value);
  }
}
