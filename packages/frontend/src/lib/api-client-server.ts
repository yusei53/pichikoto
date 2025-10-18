import { decodeJwt } from "jose";
import { cookies } from "next/headers";

type ApiError = {
	error: string;
	status: number;
};

type VerifyTokenResponse = {
	valid: boolean;
	userId: string;
	expiresAt: number;
};

class ApiClientServer {
	private baseURL: string;

	constructor(baseURL?: string) {
		if (baseURL) {
			this.baseURL = baseURL;
		} else {
			const backend =
				process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:8787";
			this.baseURL = `${backend.replace(/\/+$/, "")}/api`;
		}
	}

	/**
	 * アクセストークンを取得（読み取り専用）
	 */
	private async getAccessToken(): Promise<string | null> {
		const cookieStore = await cookies();
		return cookieStore.get("accessToken")?.value || null;
	}

	/**
	 * APIリクエストを実行（読み取り専用、トークンリフレッシュなし）
	 */
	async request<T = any>(
		url: string,
		options: RequestInit & { skipAuth?: boolean } = {}
	): Promise<T> {
		const { skipAuth = false, ...fetchOptions } = options;

		let accessToken: string | null = null;
		if (!skipAuth) {
			accessToken = await this.getAccessToken();
		}

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		// 既存のヘッダーがある場合は安全にマージ
		if (fetchOptions.headers) {
			Object.entries(fetchOptions.headers as Record<string, string>).forEach(
				([key, value]) => {
					headers[key] = value;
				}
			);
		}

		if (accessToken) {
			headers.Authorization = `Bearer ${accessToken}`;
		}

		const requestUrl = url.startsWith("http") ? url : `${this.baseURL}${url}`;

		try {
			const response = await fetch(requestUrl, {
				...fetchOptions,
				headers,
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				const apiError: ApiError = {
					error: errorData.error || `HTTP ${response.status}`,
					status: response.status,
				};
				throw apiError;
			}

			// レスポンスボディが空の場合に対応
			const text = await response.text();
			if (!text || text.trim() === "") {
				return undefined as T;
			}

			return JSON.parse(text);
		} catch (error) {
			if (error instanceof Error && error.message.includes("fetch")) {
				throw new Error("ネットワークエラーが発生しました");
			}
			throw error;
		}
	}

	/**
	 * GETリクエスト
	 */
	async get<T = any>(
		url: string,
		options?: RequestInit & { skipAuth?: boolean }
	): Promise<T> {
		return this.request<T>(url, { ...options, method: "GET" });
	}

	/**
	 * POSTリクエスト
	 */
	async post<T = any>(
		url: string,
		data?: any,
		options?: RequestInit & { skipAuth?: boolean }
	): Promise<T> {
		return this.request<T>(url, {
			...options,
			method: "POST",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	/**
	 * PUTリクエスト
	 */
	async put<T = any>(
		url: string,
		data?: any,
		options?: RequestInit & { skipAuth?: boolean }
	): Promise<T> {
		return this.request<T>(url, {
			...options,
			method: "PUT",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	/**
	 * DELETEリクエスト
	 */
	async delete<T = any>(
		url: string,
		options?: RequestInit & { skipAuth?: boolean }
	): Promise<T> {
		return this.request<T>(url, { ...options, method: "DELETE" });
	}

	/**
	 * 認証状態を確認
	 */
	async isAuthenticated(): Promise<boolean> {
		const token = await this.getAccessToken();
		if (!token) return false;

		try {
			await this.get<VerifyTokenResponse>("/auth/verify");
			return true;
		} catch (error) {
			console.warn("Token validation failed:", error);
			return false;
		}
	}

	/**
	 * アクセストークンからユーザーIDを取得
	 */
	async getUserId(): Promise<string | null> {
		const token = await this.getAccessToken();
		if (!token) return null;

		try {
			const payload = decodeJwt(token);
			return typeof payload.sub === "string" ? payload.sub : null;
		} catch {
			return null;
		}
	}
}

export const apiClientServer = new ApiClientServer();
export { ApiClientServer };
export type { ApiError, VerifyTokenResponse };
