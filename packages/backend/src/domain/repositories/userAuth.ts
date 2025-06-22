import { eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/config/types";
import type { IDbClient } from "../../infrastructure/database/connection";
import { userAuth as userAuthSchema } from "../../infrastructure/database/schema";
import type { UserID } from "../models/User";
import { UserAuth } from "../models/UserAuth";

export interface IUserAuthRepository {
  save(userAuth: UserAuth): Promise<void>;
  getByUserID(userID: UserID): Promise<UserAuth | null>;
}

@injectable()
export class UserAuthRepository implements IUserAuthRepository {
  constructor(
    @inject(TYPES.DbClient)
    private readonly dbClient: IDbClient
  ) {}

  async save(userAuth: UserAuth): Promise<void> {
    const db = this.dbClient.getDb();
    await db.insert(userAuthSchema).values({
      userId: userAuth.userId.value.value,
      accessToken: userAuth.accessToken.value,
      refreshToken: userAuth.refreshToken.value,
      expiresIn: userAuth.expiresIn.value,
      scope: userAuth.scope,
      tokenType: userAuth.tokenType,
      createdAt: userAuth.createdAt.value
    });
  }

  async getByUserID(userID: UserID): Promise<UserAuth | null> {
    const db = this.dbClient.getDb();
    const userAuth = await db
      .select()
      .from(userAuthSchema)
      .where(eq(userAuthSchema.userId, userID.value.value))
      .limit(1);
    if (userAuth.length === 0) {
      return null;
    }
    return UserAuth.reconstruct(
      userAuth[0].userId,
      userAuth[0].accessToken,
      userAuth[0].refreshToken,
      userAuth[0].expiresIn,
      userAuth[0].scope,
      userAuth[0].tokenType,
      userAuth[0].createdAt
    );
  }
}
