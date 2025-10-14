import { eq } from "drizzle-orm";
import { db } from "../../../database/client";
import { user as userSchema } from "../../../database/schema";
import { DiscordUserID, User } from "../../domain/user/User";

export interface UserRepositoryInterface {
  findBy(discordUserID: DiscordUserID): Promise<User | null>;
  getAll(): Promise<User[]>;
  save(user: User): Promise<void>;
}

export class UserRepository implements UserRepositoryInterface {
  async findBy(discordUserID: DiscordUserID): Promise<User | null> {
    const userRecord = await this.findByDiscordUserID(discordUserID);
    if (!userRecord) return null;
    return this.toUser(userRecord);
  }
  async getAll(): Promise<User[]> {
    const userRecords = await db().query.user.findMany();
    return userRecords.map(this.toUser);
  }
  private async findByDiscordUserID(
    discordUserID: DiscordUserID
  ): Promise<UserRecord | null> {
    const user = await db().query.user.findFirst({
      where: eq(userSchema.discordUserId, discordUserID.value)
    });

    if (!user) return null;

    return {
      discordUserId: user.discordUserId,
      discordUserName: user.discordUserName,
      discordAvatar: user.discordAvatar
    };
  }

  private toUser(userRecord: UserRecord): User {
    return User.reconstruct(
      DiscordUserID.from(userRecord.discordUserId),
      userRecord.discordUserName,
      userRecord.discordAvatar
    );
  }

  async save(user: User): Promise<void> {
    await db().insert(userSchema).values({
      discordUserId: user.discordUserID.value,
      discordUserName: user.discordUserName,
      discordAvatar: user.discordAvatar
    });
  }
}

type UserRecord = {
  discordUserId: string;
  discordUserName: string;
  discordAvatar: string;
};
