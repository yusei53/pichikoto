import type { Context } from "hono";
import { sign, verify } from "hono/jwt";
import { injectable } from "inversify";

type AppJwtPayload = {
  sub: string;
  exp: number;
};

export interface IJwtService {
  generateTokens(
    c: Context,
    userId: string
  ): Promise<{ accessToken: string; refreshToken: string }>;
  verify(c: Context, token: string): Promise<AppJwtPayload>;
}

@injectable()
export class JwtService implements IJwtService {
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
}
