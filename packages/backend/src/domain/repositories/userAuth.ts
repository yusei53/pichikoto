import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/config/types";
import type { IDbClient } from "../../infrastructure/database/connection";
import { userAuth as userAuthSchema } from "../../infrastructure/database/schema";
import type { UserAuth } from "../models/UserAuth";

export interface IUserAuthRepository {
  save(userAuth: UserAuth): Promise<void>;
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
}
