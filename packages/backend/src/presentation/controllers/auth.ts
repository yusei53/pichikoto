import type { Context } from "hono";
import { inject, injectable } from "inversify";
import type { AuthUsecaseInterface } from "../../application/usecases/auth";
import type { DiscordAuthServiceInterface } from "../../domain/services/discord-auth";
import type { JwtServiceInterface } from "../../domain/services/jwt";
import { TYPES } from "../../infrastructure/config/types";

export interface AuthControllerInterface {
  getAuthUrl(c: Context): Promise<Response>;
  callback(c: Context, code: string | undefined): Promise<Response>;
  refresh(c: Context): Promise<Response>;
}

@injectable()
export class AuthController implements AuthControllerInterface {
  constructor(
    @inject(TYPES.DiscordAuthService)
    private readonly discordAuthService: DiscordAuthServiceInterface,
    @inject(TYPES.AuthUsecase)
    private readonly authUsecase: AuthUsecaseInterface,
    @inject(TYPES.JwtService)
    private readonly jwtService: JwtServiceInterface
  ) {}

  async getAuthUrl(c: Context) {
    const authUrl = await this.discordAuthService.getAuthUrl(c);
    return c.json({ authUrl });
  }

  async callback(c: Context, code: string | undefined) {
    if (!code) {
      return c.json({ error: "No code provided" }, 400);
    }
    const authPayload = await this.authUsecase.callback(c, code);
    if (!authPayload) {
      return c.json({ error: "Failed to authenticate" }, 500);
    }

    return c.json(authPayload);
  }

  async refresh(c: Context) {
    try {
      const body = await c.req.json();
      const { refreshToken } = body;

      if (!refreshToken) {
        return c.json({ error: "Refresh token is required" }, 400);
      }

      const tokens = await this.jwtService.refreshAccessToken(c, refreshToken);
      return c.json(tokens);
    } catch (error) {
      console.error("Token refresh error:", error);
      return c.json({ error: "Invalid refresh token" }, 401);
    }
  }
}
