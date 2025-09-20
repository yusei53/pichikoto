import type { Context } from "hono";
import { sign } from "hono/jwt";
import { injectable } from "inversify";

export interface JwtServiceInterface {
  generateTokens(
    c: Context,
    userId: string
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
}
