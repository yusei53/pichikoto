import { eq } from "drizzle-orm";
import { db } from "../../../database/client";
import { discordTokens as discordTokensSchema } from "../../../database/schema";
import {
  AccessToken,
  DiscordTokens,
  ExpiresAt,
  RefreshToken
} from "../../domain/discord-tokens/DiscordTokens";
import { DiscordUserID } from "../../domain/user/User";

export interface DiscordTokensRepositoryInterface {
  findBy(discordUserID: DiscordUserID): Promise<DiscordTokens | null>;
  save(discordTokens: DiscordTokens): Promise<void>;
}

export class DiscordTokensRepository
  implements DiscordTokensRepositoryInterface
{
  async findBy(discordUserID: DiscordUserID): Promise<DiscordTokens | null> {
    const discordTokensRecord = await this.findByDiscordUserID(discordUserID);
    if (!discordTokensRecord) return null;
    return this.toDiscordTokens(discordTokensRecord);
  }

  private async findByDiscordUserID(
    discordUserID: DiscordUserID
  ): Promise<DiscordTokensRecord | null> {
    const discordTokens = await db().query.discordTokens.findFirst({
      where: eq(discordTokensSchema.discordUserId, discordUserID.value)
    });

    if (!discordTokens) return null;

    return {
      discordUserId: discordTokens.discordUserId,
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
      DiscordUserID.from(discordTokensRecord.discordUserId),
      AccessToken.from(discordTokensRecord.accessToken),
      RefreshToken.from(discordTokensRecord.refreshToken),
      ExpiresAt.from(discordTokensRecord.expiresAt),
      discordTokensRecord.scope,
      discordTokensRecord.tokenType
    );
  }

  async save(discordTokens: DiscordTokens): Promise<void> {
    await db().insert(discordTokensSchema).values({
      discordUserId: discordTokens.discordUserId.value,
      accessToken: discordTokens.accessToken.value,
      refreshToken: discordTokens.refreshToken.value,
      expiresAt: discordTokens.expiresAt.value,
      scope: discordTokens.scope,
      tokenType: discordTokens.tokenType
    });
  }
}

type DiscordTokensRecord = {
  discordUserId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string;
  tokenType: string;
  createdAt: Date;
};
