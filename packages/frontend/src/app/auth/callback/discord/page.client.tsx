"use client";

import { cookieUtils } from "@/lib/cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ClientSuccessPage: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // バックエンドがSet-Cookieしたトークンを確認
    const accessToken = cookieUtils.auth.getAccessToken();
    const refreshToken = cookieUtils.auth.getRefreshToken();
    if (accessToken && refreshToken) {
      router.replace("/");
      return;
    }
    setError("トークンが見つかりませんでした。Cookieがブロックされていないか確認してください。");
  }, [router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌</div>
          <h1 className="text-xl font-bold mb-2">認証エラー</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => router.replace("/")} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
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
