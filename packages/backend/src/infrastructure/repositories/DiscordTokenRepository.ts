import { eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import {
  AccessToken,
  DiscordToken,
  ExpiredAt,
  RefreshToken
} from "../../domain/DiscordToken";
import { UserID } from "../../domain/User";
import { TYPES } from "../../infrastructure/config/types";
import type { DbClientInterface } from "../../infrastructure/database/connection";
import { discordTokens as discordTokensSchema } from "../../infrastructure/database/schema";
import { CreatedAt } from "../../utils/CreatedAt";

export interface DiscordTokenRepositoryInterface {
  findBy(userID: UserID): Promise<DiscordToken | null>;
  save(discordToken: DiscordToken): Promise<void>;
}

@injectable()
export class DiscordTokenRepository implements DiscordTokenRepositoryInterface {
  constructor(
    @inject(TYPES.DbClient)
    private readonly dbClient: DbClientInterface
  ) {}

  async findBy(userID: UserID): Promise<DiscordToken | null> {
    const discordTokenRecord = await this.findByUserID(userID);
    if (!discordTokenRecord) return null;
    return this.toDiscordToken(discordTokenRecord);
  }

  private async findByUserID(
    userID: UserID
  ): Promise<DiscordTokenRecord | null> {
    const db = this.dbClient.getDb();
    const discordToken = await db.query.discordTokens.findFirst({
      where: eq(discordTokensSchema.userId, userID.value.value)
    });

    if (!discordToken) return null;

    return {
      userId: discordToken.userId,
      accessToken: discordToken.accessToken,
      refreshToken: discordToken.refreshToken,
      expiredAt: discordToken.expiredAt,
      scope: discordToken.scope,
      tokenType: discordToken.tokenType,
      createdAt: discordToken.createdAt
    };
  }

  private toDiscordToken(discordTokenRecord: DiscordTokenRecord): DiscordToken {
    return DiscordToken.reconstruct(
      UserID.from(discordTokenRecord.userId),
      AccessToken.from(discordTokenRecord.accessToken),
      RefreshToken.from(discordTokenRecord.refreshToken),
      ExpiredAt.from(discordTokenRecord.expiredAt),
      discordTokenRecord.scope,
      discordTokenRecord.tokenType,
      CreatedAt.from(discordTokenRecord.createdAt)
    );
  }

  async save(discordToken: DiscordToken): Promise<void> {
    const db = this.dbClient.getDb();
    await db.insert(discordTokensSchema).values({
      userId: discordToken.userId.value.value,
      accessToken: discordToken.accessToken.value,
      refreshToken: discordToken.refreshToken.value,
      expiredAt: discordToken.expiredAt.value,
      scope: discordToken.scope,
      tokenType: discordToken.tokenType,
      createdAt: discordToken.createdAt.value
    });
  }
}

type DiscordTokenRecord = {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiredAt: Date;
  scope: string;
  tokenType: string;
  createdAt: Date;
};
