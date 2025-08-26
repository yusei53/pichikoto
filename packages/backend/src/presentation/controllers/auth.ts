import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { inject, injectable } from "inversify";
import type { DiscordOIDCServiceInterface } from "../../application/services/discord-oidc";
import type { JwtServiceInterface } from "../../application/services/jwt";
import type { AuthUsecaseInterface } from "../../application/usecases/auth";
import { TYPES } from "../../infrastructure/config/types";

export interface AuthControllerInterface {
  RedirectToAuthUrl(c: Context): Promise<Response>;
  callback(
    c: Context,
    code: string | undefined,
    state: string | undefined
  ): Promise<Response>;
  refresh(c: Context): Promise<Response>;
  verify(c: Context): Promise<Response>;
}

@injectable()
export class AuthController implements AuthControllerInterface {
  constructor(
    @inject(TYPES.DiscordOIDCService)
    private readonly discordOIDCService: DiscordOIDCServiceInterface,
    @inject(TYPES.AuthUsecase)
    private readonly authUsecase: AuthUsecaseInterface,
    @inject(TYPES.JwtService)
    private readonly jwtService: JwtServiceInterface
  ) {}

  async RedirectToAuthUrl(c: Context) {
    const { authUrl, sessionId } =
      await this.discordOIDCService.generateAuthUrl(c);

    // sessionIdをHttpOnlyCookieとして設定
    setCookie(c, "oauth_session", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 900 // 15分
    });

    return c.redirect(authUrl);
  }

  async callback(
    c: Context,
    code: string | undefined,
    state: string | undefined
  ) {
    try {
      if (!code) {
        console.error("Auth callback error: No code provided");
        return c.json({ error: "No code provided" }, 400);
      }

      if (!state) {
        console.error("Auth callback error: No state provided");
        return c.json({ error: "No state provided" }, 400);
      }

      // Cookieから sessionId を取得
      const sessionId = getCookie(c, "oauth_session");

      if (!sessionId) {
        console.error("Auth callback error: No session cookie provided");
        return c.json({ error: "No session cookie provided" }, 400);
      }

      const authPayload = await this.authUsecase.callback(
        c,
        code,
        state,
        sessionId
      );

      // 使用済みのセッションCookieを削除
      setCookie(c, "oauth_session", "", {
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        path: "/",
        maxAge: 0
      });

      // リライト前提: フロントオリジンからのレスポンスとしてSet-Cookieされる
      setCookie(c, "accessToken", authPayload.accessToken, {
        secure: true,
        sameSite: "Lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30
      });
      setCookie(c, "refreshToken", authPayload.refreshToken, {
        secure: true,
        sameSite: "Lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365
      });

      const redirectUrl = `${c.env.FRONTEND_BASE_URL}/auth/callback/discord`;
      return c.redirect(redirectUrl);
    } catch (error) {
      console.error("Auth callback error:", error);

      // エラー時もセッションCookieを削除
      setCookie(c, "oauth_session", "", {
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        path: "/",
        maxAge: 0
      });

      return c.redirect(`${c.env.FRONTEND_BASE_URL}/auth/callback/discord`);
    }
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
        expiresAt: payload.exp
      });
    } catch (error) {
      console.error("Token verification error:", error);
      return c.json({ error: "Invalid or expired token" }, 401);
    }
  }
}
