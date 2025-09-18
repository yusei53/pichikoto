import type { Context } from "hono";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../di-container/types";
import type { JwtServiceInterface } from "../../services/jwt";

export interface JwtRefreshUseCaseInterface {
  execute(c: Context, refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
}

@injectable()
export class JwtRefreshUseCase implements JwtRefreshUseCaseInterface {
  constructor(
    @inject(TYPES.JwtService)
    private readonly jwtService: JwtServiceInterface
  ) {}

  async execute(c: Context, refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const tokens = await this.jwtService.refreshAccessToken(c, refreshToken);
      return tokens;
    } catch (error) {
      throw new JwtRefreshUseCaseError(error as Error);
    }
  }
}

class JwtRefreshUseCaseError extends Error {
  readonly name = this.constructor.name;
  constructor(cause: Error) {
    super(
      `JwtRefreshUseCaseError(cause: ${cause.name}: ${cause.message})`
    );
  }
}