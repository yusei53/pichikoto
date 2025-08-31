import type { Context } from "hono";
import { sign, verify } from "hono/jwt";
import { injectable } from "inversify";

type AppJwtPayload = {
  sub: string;
  exp: number;
};

export interface JwtServiceInterface {
  generateTokens(
    c: Context,
    userId: string
  ): Promise<{ accessToken: string; refreshToken: string }>;
  verify(c: Context, token: string): Promise<AppJwtPayload>;
  refreshAccessToken(
    c: Context,
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }>;
}

@injectable()
export class JwtService implements JwtServiceInterface {
  constructor() {}

  private getSecret(c: Context): string {
    const secret = c.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not set in environment variables");
    }
    return secret;
  }

  async generateTokens(
    c: Context,
    userId: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const secret = this.getSecret(c);
    const accessToken = await sign(
      {
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 // 30日後
      },
      secret
    );
    const refreshToken = await sign(
      {
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 // 1年後
      },
      secret
    );
    return { accessToken, refreshToken };
  }

  async verify(c: Context, token: string): Promise<AppJwtPayload> {
    const secret = this.getSecret(c);
    const payload = await verify(token, secret);
    return payload as AppJwtPayload;
  }

  async refreshAccessToken(
    c: Context,
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const secret = this.getSecret(c);

    // リフレッシュトークンの検証
    const payload = await verify(refreshToken, secret);
    const userId = payload.sub as string;

    // 新しいトークンペアを生成
    const newAccessToken = await sign(
      {
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 // 30日後
      },
      secret
    );

    const newRefreshToken = await sign(
      {
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 // 1年後
      },
      secret
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }
}
