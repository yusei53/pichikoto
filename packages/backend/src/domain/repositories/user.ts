import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/config/types";
import type { IDbClient } from "../../infrastructure/database/connection";
import { user as userSchema } from "../../infrastructure/database/schema";
import type { User } from "../models/User";

export interface IUserRepository {
  save(user: User): Promise<void>;
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
      faculty: user.faculty.getValue(),
      department: user.department.getValue(),
      createdAt: user.createdAt.value
    });
  }
}
