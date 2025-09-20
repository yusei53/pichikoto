// 認証コールバックのレスポンス型定義
interface AuthCallbackResponse {
  accessToken: string;
  refreshToken: string;
}

// エラーレスポンスの型定義
interface AuthErrorResponse {
  error: string;
}

export const authLoginPageAPI = {
  // 直接バックエンドを叩く（リライトなし）
  oidcStartUrl: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth`,

  // 認証コールバック処理
  async callback(code: string, state: string): Promise<AuthCallbackResponse> {
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
      const errorData: AuthErrorResponse = await response.json().catch(() => ({
        error: "認証処理に失敗しました"
      }));
      throw new Error(errorData.error || "認証処理に失敗しました");
    }

    const data: AuthCallbackResponse = await response.json();
    return data;
  }
};
