import type { Context } from "hono";
import { injectable } from "inversify";

export interface DiscordAuthServiceInterface {
  generateAuthUrl(c: Context): Promise<string>;
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
export class DiscordAuthService implements DiscordAuthServiceInterface {
  constructor() {}

  private discordApiBaseUrl = "https://discordapp.com/api";

  async generateAuthUrl(c: Context) {
    const params = new URLSearchParams();
    params.append("client_id", c.env.DISCORD_CLIENT_ID);
    params.append("response_type", "code");
    params.append(
      "redirect_uri",
      `${c.env.FRONTEND_BASE_URL}/auth/callback/discord`
    );
    params.append("scope", "identify openid");

    const authUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
    return authUrl;
  }

  async authorization(
    c: Context,
    code: string
  ): Promise<AuthorizationResponse> {
    const params = new URLSearchParams();
    params.append("client_id", c.env.DISCORD_CLIENT_ID);
    params.append("client_secret", c.env.DISCORD_CLIENT_SECRET);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append(
      "redirect_uri",
      `${c.env.FRONTEND_BASE_URL}/auth/callback/discord`
    );

    const response = await fetch(`${this.discordApiBaseUrl}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Discord authorization failed with status ${response.status}:`,
        errorText
      );
      throw new Error(
        `Discord authorization failed: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as AuthorizationResponse;

    console.log(data);
    return data;
  }

  async refreshToken(
    c: Context,
    refreshToken: string
  ): Promise<AuthorizationResponse> {
    const params = new URLSearchParams();
    params.append("client_id", c.env.DISCORD_CLIENT_ID);
    params.append("client_secret", c.env.DISCORD_CLIENT_SECRET);
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);

    const response = await fetch(`${this.discordApiBaseUrl}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Discord token refresh failed with status ${response.status}:`,
        errorText
      );
      throw new Error(
        `Discord token refresh failed: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as AuthorizationResponse;
    return data;
  }

  async revokeAccessToken(c: Context, accessToken: string): Promise<void> {
    const params = new URLSearchParams();
    params.append("client_id", c.env.DISCORD_CLIENT_ID);
    params.append("client_secret", c.env.DISCORD_CLIENT_SECRET);
    params.append("token", accessToken);
    params.append("token_type_hint", "access_token");

    const response = await fetch(
      `${this.discordApiBaseUrl}/oauth2/token/revoke`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Discord token revocation failed with status ${response.status}:`,
        errorText
      );
      throw new Error(
        `Discord token revocation failed: ${response.status} ${response.statusText}`
      );
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
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Discord user resource retrieval failed with status ${response.status}:`,
        errorText
      );
      throw new Error(
        `Discord user resource retrieval failed: ${response.status} ${response.statusText}`
      );
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
  id_token?: string; // OIDC用のid_token
};

export type DiscordUserResource = {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
};
