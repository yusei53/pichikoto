import { z } from "zod";
import { UUID } from "../../utils/UUID";

export class User {
  private constructor(
    readonly userID: UserID,
    readonly discordID: DiscordID,
    readonly discordUserName: string,
    readonly discordAvatar: string
  ) {}

  static create(
    discordID: DiscordID,
    discordUserName: string,
    discordAvatar: string
  ): User {
    return new User(UserID.new(), discordID, discordUserName, discordAvatar);
  }

  static reconstruct(
    userID: UserID,
    discordID: DiscordID,
    discordUserName: string,
    discordAvatar: string
  ): User {
    return new User(userID, discordID, discordUserName, discordAvatar);
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

const DiscordIDSchema = z
  .string()
  .regex(/^\d+$/, "Discord ID must contain only digits");

export class DiscordID {
  private constructor(readonly value: string) {}

  static from(value: string): DiscordID {
    const validatedValue = DiscordIDSchema.parse(value);
    return new DiscordID(validatedValue);
  }
}
