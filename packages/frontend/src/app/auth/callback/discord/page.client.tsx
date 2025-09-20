"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authLoginPageAPI } from "~/features/routes/auth/login/endpoints/authLoginPageAPI";
import { cookieUtils } from "~/lib/cookie";

type ClientAuthCallbackDiscordPageProps = {
  error?: string;
  code?: string;
  state?: string;
};

const ClientAuthCallbackDiscordPage: React.FC<
  ClientAuthCallbackDiscordPageProps
> = ({ error, code, state }) => {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processAuth = async () => {
      if (error) {
        setAuthError("認証に失敗しました");
        return;
      }

      if (!code || !state) {
        setAuthError("認証コードまたはstateが不足しています");
        return;
      }

      setIsProcessing(true);

      try {
        // APIクライアントを使用して認証処理を実行
        const { accessToken, refreshToken } = await authLoginPageAPI.callback(
          code,
          state
        );

        // トークンをCookieに保存
        cookieUtils.auth.setAccessToken(accessToken);
        cookieUtils.auth.setRefreshToken(refreshToken);

        // トップページにリダイレクト
        router.replace("/");
      } catch (err) {
        console.error("Auth callback error:", err);
        setAuthError(
          err instanceof Error ? err.message : "認証処理に失敗しました"
        );
      } finally {
        setIsProcessing(false);
      }
    };

    processAuth();
  }, [error, code, state, router]);

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌</div>
          <h1 className="text-xl font-bold mb-2">認証エラー</h1>
          <p className="text-gray-600 mb-4">{authError}</p>
          <button
            onClick={() => router.replace("/")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            トップページへ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>
          {isProcessing ? "認証処理を完了しています..." : "認証情報を処理中..."}
        </p>
      </div>
    </div>
  );
};

export default ClientAuthCallbackDiscordPage;
