import { UUID } from "../utils/UUID";
import {
  DepartmentTooLongError,
  EmptyDepartmentError,
  EmptyFacultyError,
  FacultyTooLongError,
  InvalidDiscordIDError
} from "./UserError";

export class User {
  private constructor(
    readonly userID: UserID,
    readonly discordID: DiscordID,
    readonly discordUserName: string,
    readonly discordAvatar: string,
    readonly faculty: Faculty | null,
    readonly department: Department | null
  ) {}

  static create(
    discordID: DiscordID,
    discordUserName: string,
    discordAvatar: string,
    faculty: Faculty | null, // MEMO: Discord認証で作成時はnull
    department: Department | null
  ): User {
    return new User(
      UserID.new(),
      discordID,
      discordUserName,
      discordAvatar,
      faculty ?? null,
      department ?? null
    );
  }

  static reconstruct(
    userID: UserID,
    discordID: DiscordID,
    discordUserName: string,
    discordAvatar: string,
    faculty: Faculty | null,
    department: Department | null
  ): User {
    return new User(
      userID,
      discordID,
      discordUserName,
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

  static from(value: string): UserID {
    return new UserID(UUID.from(value));
  }
}

export class DiscordID {
  private constructor(readonly value: string) {}

  static from(value: string): DiscordID {
    if (!/^\d+$/.test(value)) {
      throw new InvalidDiscordIDError();
    }
    return new DiscordID(value);
  }
}

export class Faculty {
  private constructor(readonly value: string) {}

  static from(value: string): Faculty {
    if (value.length === 0) {
      throw new EmptyFacultyError();
    }
    if (value.length > 30) {
      throw new FacultyTooLongError();
    }
    return new Faculty(value);
  }
}

export class Department {
  private constructor(readonly value: string) {}

  static from(value: string): Department {
    if (value.length === 0) {
      throw new EmptyDepartmentError();
    }
    if (value.length > 30) {
      throw new DepartmentTooLongError();
    }
    return new Department(value);
  }
}
