import { UUID } from "../value-object/UUID";

export class User {
  private constructor(
    readonly userID: UserID,
    readonly discordID: DiscordID,
    readonly discordUserName: string,
    readonly discordDiscriminator: string,
    readonly discordAvatar: string,
    readonly faculty: Faculty,
    readonly department: Department
  ) {}

  static create(
    discordID: DiscordID,
    discordUserName: string,
    discordDiscriminator: string,
    discordAvatar: string,
    faculty: Faculty,
    department: Department
  ): User {
    return new User(
      UserID.new(),
      discordID,
      discordUserName,
      discordDiscriminator,
      discordAvatar,
      faculty,
      department
    );
  }

  static reconstruct(
    userID: UserID,
    discordID: DiscordID,
    discordUserName: string,
    discordDiscriminator: string,
    discordAvatar: string,
    faculty: Faculty,
    department: Department
  ): User {
    return new User(
      userID,
      discordID,
      discordUserName,
      discordDiscriminator,
      discordAvatar,
      faculty,
      department
    );
  }
}

export class UserID {
  private constructor(readonly value: UUID) {}

  static new(): UserID {
    return new UserID(UUID.new());
  }
}

export class DiscordID {
  constructor(private readonly value: string) {
    // NOTE: DiscordIDは数字のみの制約を持つ
    if (!/^\d+$/.test(value)) {
      throw new Error("Invalid Discord ID");
    }
  }
}

export class Faculty {
  constructor(private readonly value: string) {
    const MIN_LENGTH = 1;
    const MAX_LENGTH = 30;

    // NOTE: 1文字以上30文字以内
    if (value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
      throw new Error(
        `Invalid Faculty: length must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters`
      );
    }
  }
}

export class Department {
  constructor(private readonly value: string) {
    const MIN_LENGTH = 1;
    const MAX_LENGTH = 30;

    // NOTE: 1文字以上30文字以内
    if (value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
      throw new Error(
        `Invalid Department: length must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters`
      );
    }
  }
}
