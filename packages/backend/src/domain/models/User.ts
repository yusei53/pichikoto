import z from "zod";
import { CreatedAt } from "../../utils/CreatedAt";
import { UUID } from "../../utils/UUID";

const discordIDSchema = z
  .string()
  .regex(/^\d+$/, "Invalid Discord ID: must contain only digits");

const facultySchema = z
  .string()
  .min(1, "Faculty cannot be empty")
  .max(30, "Faculty must be 30 characters or less");

const departmentSchema = z
  .string()
  .min(1, "Department cannot be empty")
  .max(30, "Department must be 30 characters or less");

export class User {
  private constructor(
    readonly userID: UserID,
    readonly discordID: DiscordID,
    readonly discordUserName: string,
    readonly discordDiscriminator: string,
    readonly discordAvatar: string,
    readonly faculty: Faculty | null,
    readonly department: Department | null,
    readonly createdAt: CreatedAt
  ) {}

  static create(
    discordID: DiscordID,
    discordUserName: string,
    discordDiscriminator: string,
    discordAvatar: string,
    faculty: Faculty | null, // MEMO: Discord認証で作成時はnull
    department: Department | null
  ): User {
    return new User(
      UserID.new(),
      discordID,
      discordUserName,
      discordDiscriminator,
      discordAvatar,
      faculty ?? null,
      department ?? null,
      CreatedAt.new()
    );
  }

  static reconstruct(
    userID: UserID,
    discordID: DiscordID,
    discordUserName: string,
    discordDiscriminator: string,
    discordAvatar: string,
    faculty: Faculty | null,
    department: Department | null,
    createdAt: CreatedAt
  ): User {
    return new User(
      userID,
      discordID,
      discordUserName,
      discordDiscriminator,
      discordAvatar,
      faculty,
      department,
      createdAt
    );
  }
}

export class UserID {
  private constructor(readonly value: UUID) {}

  static new(): UserID {
    return new UserID(UUID.new());
  }

  static from(value: string): UserID {
    return new UserID(UUID.from(value));
  }
}

export class DiscordID {
  private constructor(private readonly value: string) {}

  static from(value: string): DiscordID {
    discordIDSchema.parse(value);
    return new DiscordID(value);
  }

  getValue(): string {
    return this.value;
  }
}

export class Faculty {
  private constructor(private readonly value: string) {}

  static from(value: string): Faculty {
    facultySchema.parse(value);
    return new Faculty(value);
  }

  getValue(): string {
    return this.value;
  }
}

export class Department {
  private constructor(private readonly value: string) {}

  static from(value: string): Department {
    departmentSchema.parse(value);
    return new Department(value);
  }

  getValue(): string {
    return this.value;
  }
}
