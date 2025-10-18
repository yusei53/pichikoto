import { decodeJwt } from "jose";

export const cookieUtils = {
	set: (
		name: string,
		value: string,
		options: {
			maxAge?: number;
			secure?: boolean;
			httpOnly?: boolean;
			sameSite?: "strict" | "lax" | "none";
		} = {}
	) => {
		if (typeof document === "undefined") return;

		const {
			maxAge = 60 * 60 * 24 * 7, // デフォルト7日間
			secure = true,
			sameSite = "strict",
		} = options;

		let cookieString = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=${sameSite}`;

		if (secure) {
			cookieString += "; Secure";
		}

		document.cookie = cookieString;
	},

	get: (name: string): string | null => {
		if (typeof document === "undefined") return null;

		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);

		if (parts.length === 2) {
			const cookieValue = parts.pop()?.split(";").shift();
			return cookieValue ? decodeURIComponent(cookieValue) : null;
		}

		return null;
	},

	remove: (name: string) => {
		if (typeof document === "undefined") return;

		document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
	},

	// 認証関連のトークン管理用のヘルパー関数
	auth: {
		// アクセストークンのみクライアント側で保持する
		setAccessToken: (accessToken: string) => {
			cookieUtils.set("accessToken", accessToken, {
				maxAge: 60 * 60 * 24 * 30,
				secure: true,
				sameSite: "none",
			});
		},

		getAccessToken: (): string | null => {
			return cookieUtils.get("accessToken");
		},

		getUserId: (): string | null => {
			const token = cookieUtils.auth.getAccessToken();
			if (!token) return null;

			try {
				const payload = decodeJwt(token);
				return typeof payload.sub === "string" ? payload.sub : null;
			} catch {
				return null;
			}
		},

		setRefreshToken: (refreshToken: string) => {
			cookieUtils.set("refreshToken", refreshToken, {
				maxAge: 60 * 60 * 24 * 365,
				secure: true,
				sameSite: "none",
			});
		},

		getRefreshToken: (): string | null => {
			return cookieUtils.get("refreshToken");
		},

		clearAuth: () => {
			cookieUtils.remove("accessToken");
			cookieUtils.remove("refreshToken");
		},
	},
};
