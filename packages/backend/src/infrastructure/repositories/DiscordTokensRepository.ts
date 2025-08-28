import { eq } from "drizzle-orm";
import { inject, injectable } from "inversify";
import {
  AccessToken,
  DiscordTokens,
  ExpiresAt,
  RefreshToken
} from "../../domain/DiscordTokens";
import { UserID } from "../../domain/User";
import { TYPES } from "../../infrastructure/config/types";
import type { DbClientInterface } from "../../infrastructure/database/connection";
import { discordTokens as discordTokensSchema } from "../../infrastructure/database/schema";
import { CreatedAt } from "../../utils/CreatedAt";

export interface DiscordTokensRepositoryInterface {
  findBy(userID: UserID): Promise<DiscordTokens | null>;
  save(discordTokens: DiscordTokens): Promise<void>;
}

@injectable()
export class DiscordTokensRepository
  implements DiscordTokensRepositoryInterface
{
  constructor(
    @inject(TYPES.DbClient)
    private readonly dbClient: DbClientInterface
  ) {}

  async findBy(userID: UserID): Promise<DiscordTokens | null> {
    const discordTokensRecord = await this.findByUserID(userID);
    if (!discordTokensRecord) return null;
    return this.toDiscordTokens(discordTokensRecord);
  }

  private async findByUserID(
    userID: UserID
  ): Promise<DiscordTokensRecord | null> {
    const db = this.dbClient.getDb();
    const discordTokens = await db.query.discordTokens.findFirst({
      where: eq(discordTokensSchema.userId, userID.value.value)
    });

    if (!discordTokens) return null;

    return {
      userId: discordTokens.userId,
      accessToken: discordTokens.accessToken,
      refreshToken: discordTokens.refreshToken,
      expiresAt: discordTokens.expiresAt,
      scope: discordTokens.scope,
      tokenType: discordTokens.tokenType,
      createdAt: discordTokens.createdAt
    };
  }

  private toDiscordTokens(
    discordTokensRecord: DiscordTokensRecord
  ): DiscordTokens {
    return DiscordTokens.reconstruct(
      UserID.from(discordTokensRecord.userId),
      AccessToken.from(discordTokensRecord.accessToken),
      RefreshToken.from(discordTokensRecord.refreshToken),
      ExpiresAt.from(discordTokensRecord.expiresAt),
      discordTokensRecord.scope,
      discordTokensRecord.tokenType,
      CreatedAt.from(discordTokensRecord.createdAt)
    );
  }

  async save(discordTokens: DiscordTokens): Promise<void> {
    const db = this.dbClient.getDb();
    await db.insert(discordTokensSchema).values({
      userId: discordTokens.userId.value.value,
      accessToken: discordTokens.accessToken.value,
      refreshToken: discordTokens.refreshToken.value,
      expiresAt: discordTokens.expiresAt.value,
      scope: discordTokens.scope,
      tokenType: discordTokens.tokenType,
      createdAt: discordTokens.createdAt.value
    });
  }
}

type DiscordTokensRecord = {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string;
  tokenType: string;
  createdAt: Date;
};
