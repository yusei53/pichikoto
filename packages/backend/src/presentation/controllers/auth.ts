import {
  toCallbackRequest,
  toRefreshTokenRequest,
  toVerifyTokenRequest
} from "@pichikoto/http-contracts";
import type { Context } from "hono";
import type { DiscordAuthCallbackUseCaseInterface } from "../../application/use-case/discord-auth/DiscordAuthCallbackUseCase";
import type { DiscordAuthInitiateUseCaseInterface } from "../../application/use-case/discord-auth/DiscordAuthInitiateUseCase";
import type { DiscordAuthVerifyUseCaseInterface } from "../../application/use-case/discord-auth/DiscordAuthVerifyUseCase.js";
import type { JwtRefreshTokenUseCaseInterface } from "../../application/use-case/discord-auth/JwtRefreshTokenUseCase";

export interface AuthControllerInterface {
  redirectToAuthURL(c: Context): Promise<Response>;
  callback(c: Context): Promise<Response>;
  refresh(c: Context): Promise<Response>;
  verify(c: Context): Promise<Response>;
}

export class AuthController implements AuthControllerInterface {
  constructor(
    private readonly discordAuthInitiateUseCase: DiscordAuthInitiateUseCaseInterface,
    private readonly discordAuthCallbackUseCase: DiscordAuthCallbackUseCaseInterface,
    private readonly jwtRefreshTokenUseCase: JwtRefreshTokenUseCaseInterface,
    private readonly discordAuthVerifyUseCase: DiscordAuthVerifyUseCaseInterface
  ) {}

  async redirectToAuthURL(c: Context) {
    const { authURL } = await this.discordAuthInitiateUseCase.execute(c);

    return c.redirect(authURL);
  }

  async callback(c: Context) {
    const req = await toCallbackRequest(c.req.raw);

    const decoded = Buffer.from(req.body.state, "base64url").toString("utf-8");
    const [sessionId, state] = decoded.split(":");

    if (!sessionId || !state) {
      console.error("Auth callback error: Invalid state format");
      return c.json({ error: "invalid_state" }, 400);
    }

    const resp = await this.discordAuthCallbackUseCase.execute(
      c,
      req.body.code,
      state,
      sessionId
    );

    c.header("Cache-Control", "no-store");

    // TODO: ドメイン取得時にHTTPOnly Cookieでトークンを保存するようにする
    // フロントエンドにトークンをJSONで返す
    return c.json(resp);
  }

  async refresh(c: Context) {
    const req = await toRefreshTokenRequest(c.req.raw);

    const res = await this.jwtRefreshTokenUseCase.execute(
      c,
      req.body.refreshToken
    );

    return c.json(res);
  }

  async verify(c: Context) {
    const req = await toVerifyTokenRequest(c.req.raw);

    await this.discordAuthVerifyUseCase.execute(c, req.headers.authorization);

    return c.json({ message: "OK" }, 200);
  }
}
