import type { Context } from "hono";
import { inject, injectable } from "inversify";
import type { Result } from "neverthrow";
import { ok } from "neverthrow";
import { TYPES } from "../../../di-container/types";
import type { JwtVerifyServiceInterface } from "../../services/jwt/JWTVerifyService";

export interface DiscordAuthVerifyUseCaseInterface {
  execute(
    c: Context,
    token: string
  ): Promise<Result<void, DiscordAuthVerifyUseCaseError>>;
}

@injectable()
export class DiscordAuthVerifyUseCase
  implements DiscordAuthVerifyUseCaseInterface
{
  constructor(
    @inject(TYPES.JwtVerifyService)
    private readonly jwtVerifyService: JwtVerifyServiceInterface
  ) {}

  async execute(
    c: Context,
    token: string
  ): Promise<Result<void, DiscordAuthVerifyUseCaseError>> {
    const result = await this.jwtVerifyService.execute(c, token);

    if (result.isErr()) {
      throw new DiscordAuthVerifyUseCaseError(result.error);
    }

    return ok();
  }
}

export class DiscordAuthVerifyUseCaseError extends Error {
  readonly name = this.constructor.name;
  constructor(cause: Error) {
    super(cause.message);
  }
}
