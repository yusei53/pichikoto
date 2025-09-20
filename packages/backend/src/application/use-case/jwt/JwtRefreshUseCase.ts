import type { Context } from "hono";
import { sign, verify } from "hono/jwt";
import { injectable } from "inversify";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

type JwtTokenPair = {
  accessToken: string;
  refreshToken: string;
};

export interface JwtRefreshUseCaseInterface {
  execute(c: Context, refreshToken: string): Promise<Result<JwtTokenPair, JwtRefreshUseCaseError>>;
}

@injectable()
export class JwtRefreshUseCase implements JwtRefreshUseCaseInterface {
  constructor() {}

  private getSecret(c: Context): string {
    const secret = c.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not set in environment variables");
    }
    return secret;
  }

  async execute(c: Context, refreshToken: string): Promise<Result<JwtTokenPair, JwtRefreshUseCaseError>> {
    try {
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
      
      return ok({ 
        accessToken: newAccessToken, 
        refreshToken: newRefreshToken 
      });
    } catch (error) {
      return err(new JwtRefreshUseCaseError(error as Error));
    }
  }
}

export class JwtRefreshUseCaseError extends Error {
  readonly name = this.constructor.name;
  constructor(cause: Error) {
    super(
      `JWT refresh failed: ${cause.message}`
    );
    this.cause = cause;
  }
}