"use client";

import { cookieUtils } from "@/lib/cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ClientSuccessPage: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: ドメインを用意したらフラグメント方式を廃止して、
    // バックエンドのSet-Cookie（SameSite=Lax, Secure, Path=/, Domain=.example.com など）に切替える。
    // その際はここでhashを読む処理を削除し、Cookie存在チェックのみでトップへ遷移する。
    try {
      // 1) URLフラグメントからトークン取得（暫定フロー: バックエンド→フロント）
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (hash && hash.startsWith("#")) {
        const params = new URLSearchParams(hash.slice(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          cookieUtils.auth.setTokens(accessToken, refreshToken);
          router.replace("/");
          return;
        }
      }

      // 2) 既にCookieにある場合（将来ドメイン統一後のフロー）
      const accessToken = cookieUtils.auth.getAccessToken();
      const refreshToken = cookieUtils.auth.getRefreshToken();
      if (accessToken && refreshToken) {
        router.replace("/");
        return;
      }

      setError("トークンが取得できませんでした");
    } catch {
      setError("トークン処理中にエラーが発生しました");
    }
  }, [router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌</div>
          <h1 className="text-xl font-bold mb-2">認証エラー</h1>
          <p className="text-gray-600 mb-4">{error}</p>
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
        <p>サインイン完了。リダイレクトしています...</p>
      </div>
    </div>
  );
};

export default ClientSuccessPage;
