import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { inject, injectable } from "inversify";
import type { JwtServiceInterface } from "../../application/services/jwt";
import type { DiscordAuthCallbackUseCaseInterface } from "../../application/use-case/discord-auth/DiscordAuthCallbackUseCase";
import type { DiscordAuthInitiateUseCaseInterface } from "../../application/use-case/discord-auth/DiscordAuthInitiateUseCase";
import { TYPES } from "../../di-container/types";

export interface AuthControllerInterface {
  redirectToAuthURL(c: Context): Promise<Response>;
  callback(c: Context): Promise<Response>;
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
      secure: true,
      sameSite: "None",
      path: "/",
      maxAge: 900 // 15分
    });

    return c.redirect(authURL);
  }

  async callback(c: Context) {
    try {
      const body = await c.req
        .json<{ code?: string; state?: string }>()
        .catch(() => ({ code: undefined, state: undefined }));

      const code = body.code;
      const state = body.state;

      if (!code) {
        console.error("Auth callback error: No code provided");
        return c.json({ error: "no_code" }, 400);
      }

      if (!state) {
        console.error("Auth callback error: No state provided");
        return c.json({ error: "no_state" }, 400);
      }

      // Cookieから sessionId を取得
      const sessionId = getCookie(c, "oauth_session");

      if (!sessionId) {
        console.error("Auth callback error: No session cookie provided");
        return c.json({ error: "no_session" }, 400);
      }

      const authPayload = await this.discordAuthCallbackUseCase.execute(
        c,
        code,
        state,
        sessionId
      );

      // 使用済みのセッションCookieを削除
      setCookie(c, "oauth_session", "", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
        maxAge: 0
      });

      c.header("Cache-Control", "no-store");

      // フロントエンドにトークンをJSONで返す
      return c.json({
        accessToken: authPayload.accessToken,
        refreshToken: authPayload.refreshToken
      });
    } catch (error) {
      console.error("Auth callback error:", error);

      // エラー時もセッションCookieを削除
      setCookie(c, "oauth_session", "", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
        maxAge: 0
      });

      return c.json({ error: "auth_failed" }, 500);
    }
  }

  async refresh(c: Context) {
    try {
      const requestBody = await c.req
        .json<{ refreshToken?: string }>()
        .catch(() => ({ refreshToken: undefined }));
      const refreshToken = requestBody.refreshToken;

      if (!refreshToken) {
        return c.json({ error: "Refresh token is required" }, 401);
      }

      const tokens = await this.jwtService.refreshAccessToken(c, refreshToken);

      return c.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      return c.json({ error: "Invalid refresh token" }, 401);
    }
  }

  async verify(c: Context) {
    try {
      const authHeader = c.req.header("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const token = authHeader.substring(7); // "Bearer "を除去
      const payload = await this.jwtService.verify(c, token);

      if (!payload) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      return c.json({ message: "OK" }, 200);
    } catch (error) {
      console.error("Token verification error:", error);
      return c.json({ error: "Unauthorized" }, 401);
    }
  }
}
