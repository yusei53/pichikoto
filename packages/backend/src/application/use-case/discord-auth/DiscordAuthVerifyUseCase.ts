import type { Context } from "hono";
import type { JwtVerifyServiceInterface } from "../../services/jwt/JWTVerifyService";

export interface DiscordAuthVerifyUseCaseInterface {
  execute(c: Context, token: string): Promise<void>;
}

export class DiscordAuthVerifyUseCase
  implements DiscordAuthVerifyUseCaseInterface
{
  constructor(private readonly jwtVerifyService: JwtVerifyServiceInterface) {}

  async execute(c: Context, token: string): Promise<void> {
    await this.jwtVerifyService.execute(c, token);
  }
}
