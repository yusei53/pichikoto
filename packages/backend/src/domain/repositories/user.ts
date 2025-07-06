import { eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/config/types";
import type { IDbClient } from "../../infrastructure/database/connection";
import { user as userSchema } from "../../infrastructure/database/schema";
import { CreatedAt } from "../../utils/CreatedAt";
import { Department, DiscordID, Faculty, User, UserID } from "../models/User";

export interface IUserRepository {
  findBy(discordID: DiscordID): Promise<User | null>;
  save(user: User): Promise<void>;
}

@injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @inject(TYPES.DbClient)
    private readonly dbClient: IDbClient
  ) {}

  async findBy(discordID: DiscordID): Promise<User | null> {
    const userRecord = await this.findByDiscordID(discordID);
    if (!userRecord) return null;
    return this.toUser(userRecord);
  }
  private async findByDiscordID(
    discordID: DiscordID
  ): Promise<UserRecord | null> {
    const db = this.dbClient.getDb();
    const user = await db.query.user.findFirst({
      where: eq(userSchema.discordId, discordID.getValue())
    });

    if (!user) return null;

    return {
      id: user.id,
      discordId: user.discordId,
      discordUserName: user.discordUserName,
      discordDiscriminator: user.discordDiscriminator,
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
      userRecord.discordDiscriminator,
      userRecord.discordAvatar,
      userRecord.faculty ? Faculty.from(userRecord.faculty) : null,
      userRecord.department ? Department.from(userRecord.department) : null,
      CreatedAt.from(userRecord.createdAt)
    );
  }

  async save(user: User): Promise<void> {
    const db = this.dbClient.getDb();
    await db.insert(userSchema).values({
      id: user.userID.value.value,
      discordId: user.discordID.getValue(),
      discordUserName: user.discordUserName,
      discordDiscriminator: user.discordDiscriminator,
      discordAvatar: user.discordAvatar,
      faculty: user.faculty?.getValue() ?? null,
      department: user.department?.getValue() ?? null,
      createdAt: user.createdAt.value
    });
  }
}

type UserRecord = {
  id: string;
  discordId: string;
  discordUserName: string;
  discordDiscriminator: string;
  discordAvatar: string;
  faculty: string | null;
  department: string | null;
  createdAt: Date;
};
