import { eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/config/types";
import type { IDbClient } from "../../infrastructure/database/connection";
import { user as userSchema } from "../../infrastructure/database/schema";
import type { DiscordID } from "../models/User";
import { User } from "../models/User";

export interface IUserRepository {
  save(user: User): Promise<void>;
  getByDiscordID(discordID: DiscordID): Promise<User | null>;
}

@injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @inject(TYPES.DbClient)
    private readonly dbClient: IDbClient
  ) {}

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

  async getByDiscordID(discordID: DiscordID): Promise<User | null> {
    const db = this.dbClient.getDb();
    const user = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.discordId, discordID.getValue()))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return User.reconstruct(
      user[0].id,
      user[0].discordId,
      user[0].discordUserName,
      user[0].discordDiscriminator,
      user[0].discordAvatar,
      user[0].faculty,
      user[0].department,
      user[0].createdAt
    );
  }
}
