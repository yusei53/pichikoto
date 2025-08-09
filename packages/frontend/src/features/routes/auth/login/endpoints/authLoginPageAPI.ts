export const authLoginPageAPI = {
  async getDiscordAuthUrl(): Promise<string> {
    const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
    const response = await fetch(`${backendBaseUrl}/api/auth`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Discord認証URL取得に失敗しました");
    }

    const data = await response.json();
    return data.authUrl;
  }
};
