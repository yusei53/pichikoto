export const authLoginPageAPI = {
  // 直接バックエンドを叩く（リライトなし）
  oidcStartUrl: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth`,

  // 認証コールバック処理
  async callback(code: string, state: string) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/callback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code,
          state
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "認証処理に失敗しました");
    }

    return response.json();
  }
};
