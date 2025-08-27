"use client";

import { cookieUtils } from "@/lib/cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ClientAuthCallbackDiscordPageProps = {
  code?: string;
  state?: string;
  error?: string;
};

const ClientAuthCallbackDiscordPage: React.FC<
  ClientAuthCallbackDiscordPageProps
> = ({ code, state, error }) => {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (error) {
          setAuthError("Discord認証が拒否されました");
          return;
        }
        if (!code || !state) {
          setAuthError("認証コードが見つかりません");
          return;
        }

        const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
        const url = `${backendBaseUrl}/api/auth/callback?code=${encodeURIComponent(
          code
        )}&state=${encodeURIComponent(state)}`;

        const resp = await fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" },
          // backend側のoauth_sessionクッキーを送るため必須
          credentials: "include"
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}) as any);
          throw new Error(err.error || "認証に失敗しました");
        }

        const data = (await resp.json()) as {
          accessToken: string;
          refreshToken: string;
        };
        cookieUtils.auth.setTokens(data.accessToken, data.refreshToken);
        router.replace("/");
      } catch (e) {
        setAuthError(e instanceof Error ? e.message : "認証に失敗しました");
      }
    };
    handleAuthCallback();
  }, [code, state, error, router]);

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
        <p>認証処理中...</p>
      </div>
    </div>
  );
};

export default ClientAuthCallbackDiscordPage;
