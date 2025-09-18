import type { Context } from "hono";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../di-container/types";
import type { JwtServiceInterface } from "../../services/jwt";

export interface JwtVerifyUseCaseInterface {
  execute(c: Context, token: string): Promise<{ sub: string; exp: number } | null>;
}

@injectable()
export class JwtVerifyUseCase implements JwtVerifyUseCaseInterface {
  constructor(
    @inject(TYPES.JwtService)
    private readonly jwtService: JwtServiceInterface
  ) {}

  async execute(c: Context, token: string): Promise<{ sub: string; exp: number } | null> {
    try {
      const payload = await this.jwtService.verify(c, token);
      return payload;
    } catch (error) {
      throw new JwtVerifyUseCaseError(error as Error);
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