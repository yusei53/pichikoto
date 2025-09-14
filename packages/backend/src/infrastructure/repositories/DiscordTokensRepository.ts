import { eq } from "drizzle-orm";
import { injectable } from "inversify";
import { db } from "../../../database/connection";
import { discordTokens as discordTokensSchema } from "../../../database/schema";
import {
  AccessToken,
  DiscordTokens,
  ExpiresAt,
  RefreshToken
} from "../../domain/discord-tokens/DiscordTokens";
import { UserID } from "../../domain/user/User";

export interface DiscordTokensRepositoryInterface {
  findBy(userID: UserID): Promise<DiscordTokens | null>;
  save(discordTokens: DiscordTokens): Promise<void>;
}

@injectable()
export class DiscordTokensRepository
  implements DiscordTokensRepositoryInterface
{
  async findBy(userID: UserID): Promise<DiscordTokens | null> {
    const discordTokensRecord = await this.findByUserID(userID);
    if (!discordTokensRecord) return null;
    return this.toDiscordTokens(discordTokensRecord);
  }

  private async findByUserID(
    userID: UserID
  ): Promise<DiscordTokensRecord | null> {
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
      discordTokensRecord.tokenType
    );
  }

  async save(discordTokens: DiscordTokens): Promise<void> {
    await db.insert(discordTokensSchema).values({
      userId: discordTokens.userId.value.value,
      accessToken: discordTokens.accessToken.value,
      refreshToken: discordTokens.refreshToken.value,
      expiresAt: discordTokens.expiresAt.value,
      scope: discordTokens.scope,
      tokenType: discordTokens.tokenType
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
