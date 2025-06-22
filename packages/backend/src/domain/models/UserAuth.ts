import { CreatedAt } from "../../utils/CreatedAt";
import { UserID } from "./User";

export class UserAuth {
  private constructor(
    readonly userId: UserID,
    readonly accessToken: AccessToken,
    readonly refreshToken: RefreshToken,
    readonly expiresIn: ExpiredAt,
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
  ): UserAuth {
    return new UserAuth(
      userId,
      AccessToken.new(accessToken),
      RefreshToken.new(refreshToken),
      ExpiredAt.new(expiresIn),
      scope,
      tokenType,
      CreatedAt.new()
    );
  }

  static reconstruct(
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: Date,
    scope: string,
    tokenType: string,
    createdAt: Date
  ): UserAuth {
    return new UserAuth(
      UserID.from(userId),
      AccessToken.from(accessToken),
      RefreshToken.from(refreshToken),
      ExpiredAt.from(expiresIn),
      scope,
      tokenType,
      CreatedAt.from(createdAt)
    );
  }
}

export class AccessToken {
  private constructor(public readonly value: string) {}

  static new(value: string): AccessToken {
    return new AccessToken(value);
  }

  static from(value: string): AccessToken {
    return new AccessToken(value);
  }
}

export class RefreshToken {
  private constructor(public readonly value: string) {}

  static new(value: string): RefreshToken {
    return new RefreshToken(value);
  }

  static from(value: string): RefreshToken {
    return new RefreshToken(value);
  }
}

export class ExpiredAt {
  private constructor(public readonly value: Date) {}

  static new(expiresIn: number): ExpiredAt {
    return new ExpiredAt(new Date(Date.now() + expiresIn * 1000));
  }

  static from(expiredAt: Date): ExpiredAt {
    return new ExpiredAt(expiredAt);
  }

  isExpired(): boolean {
    return this.value < new Date();
  }

  getRemainingTime(): number {
    return this.value.getTime() - new Date().getTime();
  }
}
