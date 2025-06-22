import type { Context } from "hono";
import { injectable } from "inversify";

export interface IDiscordAuthService {
  getAuthUrl(c: Context): Promise<string>;
  authorization(c: Context, code: string): Promise<AuthorizationResponse>;
  refreshToken(
    c: Context,
    refreshToken: string
  ): Promise<AuthorizationResponse>;
  getUserResource(
    c: Context,
    accessToken: string
  ): Promise<DiscordUserResource>;
}

@injectable()
export class DiscordAuthService implements IDiscordAuthService {
  constructor() {}

  private discordApiBaseUrl = "https://discordapp.com/api";

  async getAuthUrl(c: Context) {
    const authUrl = c.env.DISCORD_AUTH_URL;
    return authUrl;
  }

  async authorization(
    c: Context,
    code: string
  ): Promise<AuthorizationResponse> {
    const response = await fetch(
      `${this.discordApiBaseUrl}/oauth2/token?code=${code}`,
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
    // TODO: status処理
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
    const response = await fetch(`${this.discordApiBaseUrl}/oauth2/token`, {
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
    // TODO: status処理
    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = (await response.json()) as AuthorizationResponse;
    return data;
  }

  async revokeAccessToken(c: Context, accessToken: string): Promise<void> {
    const response = await fetch(`${this.discordApiBaseUrl}/oauth2/revoke`, {
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
    // TODO: status処理
    if (!response.ok) {
      throw new Error("Failed to revoke access token");
    }

    return;
  }

  async getUserResource(
    c: Context,
    accessToken: string
  ): Promise<DiscordUserResource> {
    const response = await fetch(`${this.discordApiBaseUrl}/users/@me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    // TODO: status処理
    if (!response.ok) {
      throw new Error("Failed to get user resource");
    }

    const data = (await response.json()) as DiscordUserResource;
    return data;
  }
}

export type AuthorizationResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
};

export type DiscordUserResource = {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
};
