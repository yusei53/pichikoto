import type { Context } from "hono";
import { verify } from "hono/jwt";
import { injectable } from "inversify";
import type { Result } from "neverthrow";
import { err, ok } from "neverthrow";

type AppJwtPayload = {
  sub: string;
  exp: number;
};

export interface JwtVerifyUseCaseInterface {
  execute(c: Context, token: string): Promise<Result<AppJwtPayload, JwtVerifyUseCaseError>>;
}

@injectable()
export class JwtVerifyUseCase implements JwtVerifyUseCaseInterface {
  constructor() {}

  private getSecret(c: Context): string {
    const secret = c.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not set in environment variables");
    }
    return secret;
  }

  async execute(c: Context, token: string): Promise<Result<AppJwtPayload, JwtVerifyUseCaseError>> {
    try {
      // JWT_SECRETの確認は先に行い、設定されていない場合はエラーを投げる
      const secret = this.getSecret(c);
      
      const payload = await verify(token, secret);
      return ok(payload as AppJwtPayload);
    } catch (error) {
      // JWT検証失敗時はエラーを返す
      return err(new JwtVerifyUseCaseError(error as Error));
    }
  }
}

export class JwtVerifyUseCaseError extends Error {
  readonly name = this.constructor.name;
  constructor(cause: Error) {
    super(
      `JWT verification failed: ${cause.message}`
    );
    this.cause = cause;
  }
}