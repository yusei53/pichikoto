import type { Context } from "hono";
import { injectable } from "inversify";

export interface IDiscordAuthService {
  getAuthUrl(c: Context): Promise<string>;
  authorization(c: Context, code: string): Promise<AuthorizationResponse>;
  refreshToken(
    c: Context,
    refreshToken: string
  ): Promise<AuthorizationResponse>;
}

@injectable()
export class DiscordAuthService implements IDiscordAuthService {
  constructor() {}

  async getAuthUrl(c: Context) {
    const authUrl = c.env.DISCORD_AUTH_URL;
    return authUrl;
  }

  async authorization(
    c: Context,
    code: string
  ): Promise<AuthorizationResponse> {
    const response = await fetch(
      `https://discordapp.com/api/oauth2/token?code=${code}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: c.env.DISCORD_CLIENT_ID,
          client_secret: c.env.DISCORD_CLIENT_SECRET,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: `${c.env.BASE_URL}/auth/redirect`
        })
      }
    );
    if (!response.ok) {
      throw new Error("Failed to authorize");
    }

    const data = (await response.json()) as AuthorizationResponse;

    console.log(data);
    return data;
  }

  async refreshToken(
    c: Context,
    refreshToken: string
  ): Promise<AuthorizationResponse> {
    const response = await fetch(`https://discordapp.com/api/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: c.env.DISCORD_CLIENT_ID,
        client_secret: c.env.DISCORD_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken
      })
    });
    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = (await response.json()) as AuthorizationResponse;
    return data;
  }

  async revokeAccessToken(c: Context, accessToken: string): Promise<void> {
    const response = await fetch(`https://discordapp.com/api/oauth2/revoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: c.env.DISCORD_CLIENT_ID,
        client_secret: c.env.DISCORD_CLIENT_SECRET,
        token: accessToken,
        token_type_hint: "access_token"
      })
    });
    if (!response.ok) {
      throw new Error("Failed to revoke access token");
    }

    return;
  }
}

export type AuthorizationResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
};
