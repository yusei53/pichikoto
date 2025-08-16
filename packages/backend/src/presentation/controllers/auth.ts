import type { Context } from "hono";
import { inject, injectable } from "inversify";
import type { DiscordAuthServiceInterface } from "../../application/services/discord-auth";
import type { JwtServiceInterface } from "../../application/services/jwt";
import type { AuthUsecaseInterface } from "../../application/usecases/auth";
import { TYPES } from "../../infrastructure/config/types";

export interface AuthControllerInterface {
  getAuthUrl(c: Context): Promise<Response>;
  callback(c: Context, code: string | undefined): Promise<Response>;
  refresh(c: Context): Promise<Response>;
  verify(c: Context): Promise<Response>;
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

  async verify(c: Context) {
    try {
      const authHeader = c.req.header("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: "Authorization token is required" }, 401);
      }

      const token = authHeader.substring(7); // "Bearer "を除去
      const payload = await this.jwtService.verify(c, token);

      if (!payload) {
        return c.json({ error: "Invalid or expired token" }, 401);
      }

      return c.json({
        valid: true,
        userId: payload.sub,
        expiredAt: payload.exp
      });
    } catch (error) {
      console.error("Token verification error:", error);
      return c.json({ error: "Invalid or expired token" }, 401);
    }
  }
}
