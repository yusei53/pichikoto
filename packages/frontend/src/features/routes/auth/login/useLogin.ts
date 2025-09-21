import { useCallback } from "react";
import { authLoginPageAPI } from "./endpoints/authLoginPageAPI";

export const useLogin = () => {
    const onLogin = useCallback(async () => {
        try {
            const authUrl = authLoginPageAPI.oidcStartUrl;
            window.location.href = authUrl;
        } catch (error) {
            console.error("Discord認証開始エラー:", error);
            alert("認証開始に失敗しました。もう一度お試しください。");
        }
    }, []);

    return { onLogin };
};
