"use client";

import { authLoginPageAPI } from "@/features/routes/auth/login/endpoints/authLoginPageAPI";
import { LogIn } from "lucide-react";

type DiscordLoginButtonProps = {
  className?: string;
};

export const DiscordLoginButton: React.FC<DiscordLoginButtonProps> = ({
  className = ""
}) => {
  const handleLogin = async () => {
    try {
      const authUrl = authLoginPageAPI.oidcStartUrl;
      window.location.href = authUrl;
    } catch (error) {
      console.error("Discord認証開始エラー:", error);
      alert("認証開始に失敗しました。もう一度お試しください。");
    }
  };

  return (
    <button
      onClick={handleLogin}
      className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${className}`}
    >
      <LogIn className="w-4 h-4" />
      Discordでログイン
    </button>
  );
};
