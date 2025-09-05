import { eq } from "drizzle-orm";
import { injectable } from "inversify";
import { db } from "../../../database/connection";
import { user as userSchema } from "../../../database/schema";
import {
  Department,
  DiscordID,
  Faculty,
  User,
  UserID
} from "../../domain/user/User";
import { CreatedAt } from "../../utils/CreatedAt";

export interface UserRepositoryInterface {
  findBy(discordID: DiscordID): Promise<User | null>;
  save(user: User): Promise<void>;
}

@injectable()
export class UserRepository implements UserRepositoryInterface {
  async findBy(discordID: DiscordID): Promise<User | null> {
    const userRecord = await this.findByDiscordID(discordID);
    if (!userRecord) return null;
    return this.toUser(userRecord);
  }
  private async findByDiscordID(
    discordID: DiscordID
  ): Promise<UserRecord | null> {
    const user = await db.query.user.findFirst({
      where: eq(userSchema.discordId, discordID.value)
    });

    if (!user) return null;

    return {
      id: user.id,
      discordId: user.discordId,
      discordUserName: user.discordUserName,
      discordAvatar: user.discordAvatar,
      faculty: user.faculty,
      department: user.department,
      createdAt: user.createdAt
    };
  }

  private toUser(userRecord: UserRecord): User {
    return User.reconstruct(
      UserID.from(userRecord.id),
      DiscordID.from(userRecord.discordId),
      userRecord.discordUserName,
      userRecord.discordAvatar,
      userRecord.faculty ? Faculty.from(userRecord.faculty) : null,
      userRecord.department ? Department.from(userRecord.department) : null,
      CreatedAt.from(userRecord.createdAt)
    );
  }

  async save(user: User): Promise<void> {
    await db.insert(userSchema).values({
      id: user.userID.value.value,
      discordId: user.discordID.value,
      discordUserName: user.discordUserName,
      discordAvatar: user.discordAvatar,
      faculty: user.faculty?.value ?? null,
      department: user.department?.value ?? null,
      createdAt: user.createdAt.value
    });
  }
}

type UserRecord = {
  id: string;
  discordId: string;
  discordUserName: string;
  discordAvatar: string;
  faculty: string | null;
  department: string | null;
  createdAt: Date;
};
