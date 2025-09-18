import type { Context } from "hono";
import { verify } from "hono/jwt";
import { injectable } from "inversify";

type AppJwtPayload = {
  sub: string;
  exp: number;
};

export interface JwtVerifyUseCaseInterface {
  execute(c: Context, token: string): Promise<AppJwtPayload | null>;
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

  async execute(c: Context, token: string): Promise<AppJwtPayload | null> {
    // JWT_SECRETの確認は先に行い、設定されていない場合はエラーを投げる
    const secret = this.getSecret(c);
    
    try {
      const payload = await verify(token, secret);
      return payload as AppJwtPayload;
    } catch (error) {
      // JWT検証失敗時はnullを返す（エラーを投げない）
      return null;
    }
  }
}

class JwtVerifyUseCaseError extends Error {
  readonly name = this.constructor.name;
  constructor(cause: Error) {
    super(
      `JwtVerifyUseCaseError(cause: ${cause.name}: ${cause.message})`
    );
  }
}