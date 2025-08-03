import type { AuthPayload } from "@/model/auth";

export const authCallbackDiscordPageAPI = {
  async exchangeCodeToToken(code: string): Promise<AuthPayload> {
    const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
    const response = await fetch(`${backendBaseUrl}/api/auth/callback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to authenticate");
    }

    return response.json();
  }
};
