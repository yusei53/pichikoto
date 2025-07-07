import { eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/config/types";
import type { IDbClient } from "../../infrastructure/database/connection";
import { userAuth as userAuthSchema } from "../../infrastructure/database/schema";
import { CreatedAt } from "../../utils/CreatedAt";
import { UserID } from "../models/User";
import {
  AccessToken,
  ExpiredAt,
  RefreshToken,
  UserAuth
} from "../models/UserAuth";

export interface IUserAuthRepository {
  findBy(userID: UserID): Promise<UserAuth | null>;
  save(userAuth: UserAuth): Promise<void>;
}

@injectable()
export class UserAuthRepository implements IUserAuthRepository {
  constructor(
    @inject(TYPES.DbClient)
    private readonly dbClient: IDbClient
  ) {}

  async findBy(userID: UserID): Promise<UserAuth | null> {
    const userAuthRecord = await this.findByUserID(userID);
    if (!userAuthRecord) return null;
    return this.toUserAuth(userAuthRecord);
  }

  private async findByUserID(userID: UserID): Promise<UserAuthRecord | null> {
    const db = this.dbClient.getDb();
    const userAuth = await db.query.userAuth.findFirst({
      where: eq(userAuthSchema.userId, userID.value.value)
    });

    if (!userAuth) return null;

    return {
      userId: userAuth.userId,
      accessToken: userAuth.accessToken,
      refreshToken: userAuth.refreshToken,
      expiresIn: userAuth.expiresIn,
      scope: userAuth.scope,
      tokenType: userAuth.tokenType,
      createdAt: userAuth.createdAt
    };
  }

  private toUserAuth(userAuthRecord: UserAuthRecord): UserAuth {
    return UserAuth.reconstruct(
      UserID.from(userAuthRecord.userId),
      AccessToken.from(userAuthRecord.accessToken),
      RefreshToken.from(userAuthRecord.refreshToken),
      ExpiredAt.from(userAuthRecord.expiresIn),
      userAuthRecord.scope,
      userAuthRecord.tokenType,
      CreatedAt.from(userAuthRecord.createdAt)
    );
  }

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
}

type UserAuthRecord = {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: Date;
  scope: string;
  tokenType: string;
  createdAt: Date;
};
