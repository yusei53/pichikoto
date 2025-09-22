import type { Context } from "hono";
import { sign } from "hono/jwt";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

export type JwtGenerateResult = {
  accessToken: string;
  refreshToken: string;
};

export interface JwtGenerateServiceInterface {
  execute(
    c: Context,
    userId: string
  ): Promise<Result<JwtGenerateResult, JwtGenerateServiceError>>;
}

export class JwtGenerateService implements JwtGenerateServiceInterface {
  async execute(
    c: Context,
    userId: string
  ): Promise<Result<JwtGenerateResult, JwtGenerateServiceError>> {
    try {
      const secret = c.env.JWT_SECRET;

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
      return ok({ accessToken, refreshToken });
    } catch (error) {
      return err(new JwtGenerateServiceError(error as Error));
    }
  }
}

export class JwtGenerateServiceError extends Error {
  readonly name = this.constructor.name;
  constructor(cause: Error) {
    super(`JWT generation failed: ${cause.message}`);
    this.cause = cause;
  }
}
