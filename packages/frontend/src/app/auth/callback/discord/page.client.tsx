"use client";

import { authCallbackDiscordPageAPI } from "@/features/routes/auth/callback/discord/endpoints/authCallbackDiscordPageAPI";
import type { AuthPayload } from "@/model/auth";
import { cookieUtils } from "@/lib/cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ClientAuthCallbackDiscordPageProps = {
  code?: string;
  error?: string;
};

const ClientAuthCallbackDiscordPage: React.FC<ClientAuthCallbackDiscordPageProps> = ({
  code,
  error
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Discord認証でエラーが発生した場合
        if (error) {
          setAuthError("Discord認証が拒否されました");
          setIsLoading(false);
          return;
        }

        // codeパラメータが存在しない場合
        if (!code) {
          setAuthError("認証コードが見つかりません");
          setIsLoading(false);
          return;
        }

        // コードをトークンに交換
        const authPayload: AuthPayload = await authCallbackDiscordPageAPI.exchangeCodeToToken(code);

        // トークンをCookieに保存
        cookieUtils.auth.setTokens(authPayload.accessToken, authPayload.refreshToken);

        // 認証成功時はトップページへリダイレクト
        router.push("/");
      } catch (err) {
        console.error("認証エラー:", err);
        setAuthError(err instanceof Error ? err.message : "認証に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [code, error, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>認証処理中...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌</div>
          <h1 className="text-xl font-bold mb-2">認証エラー</h1>
          <p className="text-gray-600 mb-4">{authError}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            トップページへ戻る
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ClientAuthCallbackDiscordPage;