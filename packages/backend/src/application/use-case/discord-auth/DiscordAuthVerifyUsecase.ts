import type { Context } from "hono";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../di-container/types";
import type { JwtVerifyServiceInterface } from "../../services/jwt/JWTVerifyService";

export interface DiscordAuthVerifyUseCaseInterface {
  execute(c: Context, token: string): Promise<void>;
}

@injectable()
export class DiscordAuthVerifyUseCase
  implements DiscordAuthVerifyUseCaseInterface
{
  constructor(
    @inject(TYPES.JwtVerifyService)
    private readonly jwtVerifyService: JwtVerifyServiceInterface
  ) {}

  async execute(c: Context, token: string): Promise<void> {
    await this.jwtVerifyService.execute(c, token);
  }
}
