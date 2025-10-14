import type { DiscordUserID } from "../../domain/user/User";

export class DiscordTokens {
  private constructor(
    readonly discordUserId: DiscordUserID,
    readonly accessToken: AccessToken,
    readonly refreshToken: RefreshToken,
    readonly expiresAt: ExpiresAt,
    readonly scope: string,
    readonly tokenType: string
  ) {}

  static create(
    discordUserId: DiscordUserID,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    scope: string,
    tokenType: string
  ): DiscordTokens {
    return new DiscordTokens(
      discordUserId,
      AccessToken.from(accessToken),
      RefreshToken.from(refreshToken),
      ExpiresAt.new(expiresIn),
      scope,
      tokenType
    );
  }

  static reconstruct(
    discordUserId: DiscordUserID,
    accessToken: AccessToken,
    refreshToken: RefreshToken,
    expiresAt: ExpiresAt,
    scope: string,
    tokenType: string
  ): DiscordTokens {
    return new DiscordTokens(
      discordUserId,
      accessToken,
      refreshToken,
      expiresAt,
      scope,
      tokenType
    );
  }
}

export class AccessToken {
  private constructor(public readonly value: string) {}

  static from(value: string): AccessToken {
    return new AccessToken(value);
  }
}

export class RefreshToken {
  private constructor(public readonly value: string) {}

  static from(value: string): RefreshToken {
    return new RefreshToken(value);
  }
}

export class ExpiresAt {
  private constructor(public readonly value: Date) {}

  static new(expiresIn: number): ExpiresAt {
    return new ExpiresAt(new Date(Date.now() + expiresIn * 1000));
  }

  static from(expiresAt: Date): ExpiresAt {
    return new ExpiresAt(expiresAt);
  }
}
