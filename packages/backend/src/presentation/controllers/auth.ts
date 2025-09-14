import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { inject, injectable } from "inversify";
import type { JwtServiceInterface } from "../../application/services/jwt";
import type { DiscordAuthCallbackUseCaseInterface } from "../../application/use-case/discord-auth/DiscordAuthCallbackUseCase";
import type { DiscordAuthInitiateUseCaseInterface } from "../../application/use-case/discord-auth/DiscordAuthInitiateUseCase";
import { TYPES } from "../../infrastructure/config/types";

export interface AuthControllerInterface {
  redirectToAuthURL(c: Context): Promise<Response>;
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
    @inject(TYPES.DiscordAuthInitiateUseCase)
    private readonly discordAuthInitiateUseCase: DiscordAuthInitiateUseCaseInterface,
    @inject(TYPES.DiscordAuthCallbackUseCase)
    private readonly discordAuthCallbackUseCase: DiscordAuthCallbackUseCaseInterface,
    @inject(TYPES.JwtService)
    private readonly jwtService: JwtServiceInterface
  ) {}

  async redirectToAuthURL(c: Context) {
    const { authURL, sessionID } =
      await this.discordAuthInitiateUseCase.execute(c);

    // sessionIdをHttpOnlyCookieとして設定
    setCookie(c, "oauth_session", sessionID, {
      httpOnly: true,
      secure: c.env.NODE_ENV !== "development",
      sameSite: c.env.NODE_ENV === "development" ? "Lax" : "None",
      path: "/",
      maxAge: 900 // 15分
    });

    return c.redirect(authURL);
  }

  async callback(
    c: Context,
    code: string | undefined,
    state: string | undefined
  ) {
    const completeUrl = `${c.env.FRONTEND_BASE_URL}/auth/callback/complete`;
    try {
      if (!code) {
        console.error("Auth callback error: No code provided");
        return c.redirect(`${completeUrl}?error=no_code`);
      }

      if (!state) {
        console.error("Auth callback error: No state provided");
        return c.redirect(`${completeUrl}?error=no_state`);
      }

      // Cookieから sessionId を取得
      const sessionId = getCookie(c, "oauth_session");

      if (!sessionId) {
        console.error("Auth callback error: No session cookie provided");
        return c.redirect(`${completeUrl}?error=no_session`);
      }

      const authPayload = await this.discordAuthCallbackUseCase.execute(
        c,
        code,
        state,
        sessionId
      );

      // Refresh TokenはHttpOnly Cookieで付与（クライアントJSから不可視）
      if (authPayload.refreshToken) {
        setCookie(c, "refresh_token", authPayload.refreshToken, {
          httpOnly: true,
          secure: c.env.NODE_ENV !== "development",
          sameSite: c.env.NODE_ENV === "development" ? "Lax" : "None",
          path: "/",
          maxAge: 60 * 60 * 24 * 365 // 1年
        });
      }

      // 使用済みのセッションCookieを削除
      setCookie(c, "oauth_session", "", {
        httpOnly: true,
        secure: c.env.NODE_ENV !== "development",
        sameSite: c.env.NODE_ENV === "development" ? "Lax" : "None",
        path: "/",
        maxAge: 0
      });

      c.header("Cache-Control", "no-store");
      // フロントの完了ページへリダイレクト（アクセストークンは返さない）
      return c.redirect(completeUrl);
    } catch (error) {
      console.error("Auth callback error:", error);

      // エラー時もセッションCookieを削除
      setCookie(c, "oauth_session", "", {
        httpOnly: true,
        secure: c.env.NODE_ENV !== "development",
        sameSite: c.env.NODE_ENV === "development" ? "Lax" : "None",
        path: "/",
        maxAge: 0
      });

      return c.redirect(`${completeUrl}?error=auth_failed`);
    }
  }

  async refresh(c: Context) {
    try {
      // CSRF緩和: Origin/Referer が許可ドメイン（FRONTEND_BASE_URL）か検証
      const headerOrigin = c.req.header("Origin");
      const headerReferer = c.req.header("Referer");
      const allowOrigin = (() => {
        try {
          const allowed = new URL(c.env.FRONTEND_BASE_URL).origin;
          const received = headerOrigin ?? headerReferer;
          if (!received) return false;
          const receivedOrigin = new URL(received).origin;
          return receivedOrigin === allowed;
        } catch {
          return false;
        }
      })();

      if (!allowOrigin) {
        return c.json({ error: "Forbidden" }, 403);
      }

      // HttpOnly Cookie から refresh_token を取得
      const refreshToken = getCookie(c, "refresh_token");

      if (!refreshToken) {
        return c.json({ error: "Refresh token cookie is required" }, 401);
      }

      const tokens = await this.jwtService.refreshAccessToken(c, refreshToken);

      // Refresh Tokenをローテーションし、Cookieを更新
      setCookie(c, "refresh_token", tokens.refreshToken, {
        httpOnly: true,
        secure: c.env.NODE_ENV !== "development",
        sameSite: "None",
        path: "/",
        maxAge: 60 * 60 * 24 * 365
      });

      // レスポンスはアクセストークンのみ返す
      return c.json({ accessToken: tokens.accessToken });
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
