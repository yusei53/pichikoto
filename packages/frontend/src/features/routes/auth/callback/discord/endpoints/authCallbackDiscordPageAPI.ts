import type { AuthPayload } from "@/model/auth";

export const authCallbackDiscordPageAPI = {
  async exchangeCodeToToken(code: string): Promise<AuthPayload> {
    const response = await fetch('/api/auth/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to authenticate');
    }

    return response.json();
  }
};
