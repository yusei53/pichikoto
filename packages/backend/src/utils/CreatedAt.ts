export class CreatedAt {
  private constructor(public readonly value: Date) {}

  static new(): CreatedAt {
    return new CreatedAt(new Date());
  }

  static from(value: Date): CreatedAt {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date format");
    }
    return new CreatedAt(date);
  }
}
