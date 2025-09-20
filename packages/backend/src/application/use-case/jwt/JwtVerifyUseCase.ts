import type { Context } from "hono";
import { verify } from "hono/jwt";
import { injectable } from "inversify";
import type { JWTPayload } from "jose";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

type AppJwtPayload = {
  jwtPayload: Pick<JWTPayload, "sub" | "exp">;
};

export interface JwtVerifyUseCaseInterface {
  execute(
    c: Context,
    token: string
  ): Promise<Result<AppJwtPayload, JwtVerifyUseCaseError>>;
}

@injectable()
export class JwtVerifyUseCase implements JwtVerifyUseCaseInterface {
  async execute(
    c: Context,
    token: string
  ): Promise<Result<AppJwtPayload, JwtVerifyUseCaseError>> {
    try {
      const jwtPayload = await verify(token, c.env.JWT_SECRET);
      return ok({ jwtPayload });
    } catch (error) {
      return err(new JwtVerifyUseCaseError(error as Error));
    }
  }
}

export class JwtVerifyUseCaseError extends Error {
  readonly name = this.constructor.name;
  constructor(cause: Error) {
    super(`JWT verification failed: ${cause.message}`);
    this.cause = cause;
  }
}
