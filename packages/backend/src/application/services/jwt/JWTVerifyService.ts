import type { Context } from "hono";
import { verify } from "hono/jwt";
import { injectable } from "inversify";
import type { JWTPayload } from "jose";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

export type AppJwtPayload = {
  jwtPayload: Pick<JWTPayload, "sub" | "exp">;
};

export interface JwtVerifyServiceInterface {
  execute(
    c: Context,
    token: string
  ): Promise<Result<AppJwtPayload, JwtVerifyServiceError>>;
}

@injectable()
export class JwtVerifyService implements JwtVerifyServiceInterface {
  async execute(
    c: Context,
    token: string
  ): Promise<Result<AppJwtPayload, JwtVerifyServiceError>> {
    try {
      const jwtPayload = await verify(token, c.env.JWT_SECRET);
      return ok({ jwtPayload });
    } catch (error) {
      return err(new JwtVerifyServiceError(error as Error));
    }
  }
}

export class JwtVerifyServiceError extends Error {
  readonly name = this.constructor.name;
  constructor(cause: Error) {
    super(cause.message);
  }
}
