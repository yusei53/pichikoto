import type { Context } from "hono";
import { inject, injectable } from "inversify";
import type { IAuthUsecase } from "../../application/usecases/auth";
import type { IDiscordAuthService } from "../../domain/services/discord-auth";
import { TYPES } from "../../infrastructure/config/types";

export interface IAuthController {
  getAuthUrl(c: Context): Promise<Response>;
  redirect(c: Context, code: string | undefined): Promise<Response>;
}

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject(TYPES.DiscordAuthService)
    private readonly discordAuthService: IDiscordAuthService,
    @inject(TYPES.AuthUsecase)
    private readonly authUsecase: IAuthUsecase
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
