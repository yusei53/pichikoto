"use client";

import { authLoginPageAPI } from "@/features/routes/auth/login/endpoints/authLoginPageAPI";
import { LogIn } from "lucide-react";
import { useState } from "react";

type DiscordLoginButtonProps = {
  className?: string;
};

export const DiscordLoginButton: React.FC<DiscordLoginButtonProps> = ({
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const authUrl = await authLoginPageAPI.getDiscordAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Discord認証開始エラー:", error);
      alert("認証開始に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${className}`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          認証中...
        </>
      ) : (
        <>
          <LogIn className="w-4 h-4" />
          Discordでログイン
        </>
      )}
    </button>
  );
};