export const authLoginPageAPI = {
  async getDiscordAuthUrl(): Promise<string> {
    const response = await fetch('/api/auth/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Discord認証URL取得に失敗しました');
    }

    const data = await response.json();
    return data.authUrl;
  }
};