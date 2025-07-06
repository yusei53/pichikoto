import type { Context } from "hono";
import { inject, injectable } from "inversify";
import type { AuthUsecaseInterface } from "../../application/usecases/auth";
import type { DiscordAuthServiceInterface } from "../../domain/services/discord-auth";
import { TYPES } from "../../infrastructure/config/types";

export interface AuthControllerInterface {
  getAuthUrl(c: Context): Promise<Response>;
  redirect(c: Context, code: string | undefined): Promise<Response>;
}

@injectable()
export class AuthController implements AuthControllerInterface {
  constructor(
    @inject(TYPES.DiscordAuthService)
    private readonly discordAuthService: DiscordAuthServiceInterface,
    @inject(TYPES.AuthUsecase)
    private readonly authUsecase: AuthUsecaseInterface
  ) {}

  async getAuthUrl(c: Context) {
    const authUrl = await this.discordAuthService.getAuthUrl(c);
    return c.json({ authUrl });
  }

  async redirect(c: Context, code: string | undefined) {
    if (!code) {
      return c.json({ error: "No code provided" }, 400);
    }
    const authPayload = await this.authUsecase.redirect(c, code);
    if (!authPayload) {
      return c.json({ error: "Failed to authenticate" }, 500);
    }

    return c.json(authPayload);
  }
}
