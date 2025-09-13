import type { Context } from "hono";
import { injectable } from "inversify";

export interface DiscordOIDCServiceInterface {
  revokeAccessToken(c: Context, accessToken: string): Promise<void>;
}

@injectable()
export class DiscordOIDCService implements DiscordOIDCServiceInterface {
  private readonly discordApiBaseUrl = "https://discord.com/api";

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
  }
}

export interface DiscordOIDCTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
  id_token: string;
}
