import { CreatedAt } from "../utils/CreatedAt";
import type { UserID } from "./User";

export class DiscordTokens {
  private constructor(
    readonly userId: UserID,
    readonly accessToken: AccessToken,
    readonly refreshToken: RefreshToken,
    readonly expiresAt: ExpiresAt,
    readonly scope: string,
    readonly tokenType: string,
    readonly createdAt: CreatedAt
  ) {}

  static create(
    userId: UserID,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    scope: string,
    tokenType: string
  ): DiscordTokens {
    return new DiscordTokens(
      userId,
      AccessToken.from(accessToken),
      RefreshToken.from(refreshToken),
      ExpiresAt.new(expiresIn),
      scope,
      tokenType,
      CreatedAt.new()
    );
  }

  static reconstruct(
    userId: UserID,
    accessToken: AccessToken,
    refreshToken: RefreshToken,
    expiresAt: ExpiresAt,
    scope: string,
    tokenType: string,
    createdAt: CreatedAt
  ): DiscordTokens {
    return new DiscordTokens(
      userId,
      accessToken,
      refreshToken,
      expiresAt,
      scope,
      tokenType,
      createdAt
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

  isExpired(): boolean {
    return this.value < new Date();
  }

  getRemainingTime(): number {
    return this.value.getTime() - new Date().getTime();
  }
}
