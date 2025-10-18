import { cookieUtils } from "./cookie";

type ApiError = {
	error: string;
	status: number;
};

type RefreshTokenResponse = {
	accessToken: string;
	refreshToken: string;
};

type VerifyTokenResponse = {
	valid: boolean;
	userId: string;
	expiresAt: number;
};

class ApiClient {
	private baseURL: string;

	// トークンリフレッシュの並行制御
	// 複数のAPIリクエストが同時に401エラーになった際、
	// 最初の1回だけリフレッシュを実行し、他は待機させる
	private isRefreshing = false;

	// リフレッシュ待機中のリクエストを管理するキュー
	// Promise.allや連続呼び出しでも無駄なリフレッシュを防ぐ
	private failedQueue: Array<{
		resolve: (token: string) => void;
		reject: (error: Error) => void;
	}> = [];

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
	 * リフレッシュ待機中のリクエストキューを処理する
	 *
	 * 動作例：
	 * 1. Promise.all([api.get('/users'), api.get('/posts'), api.get('/comments')])
	 * 2. 全て同時に401エラー → 最初のリクエストがリフレッシュ実行、他は待機
	 * 3. リフレッシュ成功 → この関数で待機中の全リクエストに新トークンを配布
	 * 4. 各リクエストが新トークンで自動的に再実行される
	 *
	 * @param error リフレッシュでエラーが発生した場合のエラーオブジェクト
	 * @param token リフレッシュ成功時の新しいアクセストークン
	 */
	private processQueue(error: Error | null, token: string | null = null) {
		this.failedQueue.forEach(({ resolve, reject }) => {
			if (error) {
				reject(error); // リフレッシュ失敗 → 待機中の全リクエストを失敗させる
			} else {
				resolve(token!); // リフレッシュ成功 → 新トークンを配布して再実行させる
			}
		});

		this.failedQueue = []; // キューをクリアして次回に備える
	}

	private async refreshAccessToken(): Promise<string> {
		const refreshToken = cookieUtils.auth.getRefreshToken();

		if (!refreshToken) {
			throw new Error("リフレッシュトークンが存在しません");
		}

		const response = await fetch(`${this.baseURL}/auth/refresh`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			credentials: "include",
			body: JSON.stringify({ refreshToken }),
		});

		if (!response.ok) {
			throw new Error("トークンの更新に失敗しました");
		}

		const data: RefreshTokenResponse = await response.json();
		cookieUtils.auth.setAccessToken(data.accessToken);
		cookieUtils.auth.setRefreshToken(data.refreshToken);
		return data.accessToken;
	}

	async request<T = any>(
		url: string,
		options: RequestInit & { skipAuth?: boolean; _retry?: boolean } = {}
	): Promise<T> {
		const { skipAuth = false, _retry = false, ...fetchOptions } = options;

		let accessToken: string | null = null;
		if (!skipAuth) {
			accessToken = cookieUtils.auth.getAccessToken();
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

			if (response.status !== 401 || skipAuth) {
				if (!response.ok) {
					const errorBody = await response.json();

					const apiError: ApiError = {
						error:
							errorBody?.error ||
							response.statusText ||
							`HTTP ${response.status}`,
						status: response.status,
					};
					throw apiError;
				}
				// 204 No Content や非JSONレスポンスを安全に処理
				if (response.status === 204) {
					return undefined as unknown as T;
				}
				const contentType = response.headers.get("content-type") || "";
				if (!contentType.includes("application/json")) {
					return undefined as unknown as T;
				}
				return response.json();
			}

			if (this.isRefreshing) {
				// 既に他のリクエストがリフレッシュ中の場合
				// このリクエストは待機キューに追加して、リフレッシュ完了を待つ
				return new Promise<T>((resolve, reject) => {
					this.failedQueue.push({
						resolve: (token: string) => {
							// リフレッシュ完了後、新しいトークンで自動的に再リクエスト実行
							this.request<T>(url, {
								...options,
								_retry: true,
								headers: {
									...fetchOptions.headers,
									Authorization: `Bearer ${token}`,
								},
							})
								.then(resolve)
								.catch(reject);
						},
						reject,
					});
				});
			}

			// 既に一度リトライ済みで401 → 無限リトライ防止
			if (_retry) {
				cookieUtils.auth.clearAuth();
				throw new Error("Unauthorized");
			}

			// 最初にエラーになったリクエストがトークンリフレッシュを実行
			this.isRefreshing = true;

			try {
				const newAccessToken = await this.refreshAccessToken();

				// リフレッシュ成功 → 待機中の全リクエストに新トークンを配布
				this.processQueue(null, newAccessToken);

				// 最初のリクエスト（このリクエスト）も新しいトークンで再実行
				return this.request<T>(url, {
					...options,
					_retry: true,
					headers: {
						...fetchOptions.headers,
						Authorization: `Bearer ${newAccessToken}`,
					},
				});
			} catch (refreshError) {
				// リフレッシュ失敗 → 待機中の全リクエストも失敗させる
				this.processQueue(refreshError as Error);
				// 認証情報をクリアしてログアウト状態にする
				cookieUtils.auth.clearAuth();
				throw new Error(
					"認証の有効期限が切れました。再度ログインしてください。"
				);
			} finally {
				// 次回のリフレッシュのためにフラグをリセット
				this.isRefreshing = false;
			}
		} catch (error) {
			if (error instanceof Error && error.message.includes("fetch")) {
				throw new Error("ネットワークエラーが発生しました");
			}
			throw error;
		}
	}

	async get<T = any>(
		url: string,
		options?: RequestInit & { skipAuth?: boolean }
	): Promise<T> {
		return this.request<T>(url, { ...options, method: "GET" });
	}

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

	async delete<T = any>(
		url: string,
		options?: RequestInit & { skipAuth?: boolean }
	): Promise<T> {
		return this.request<T>(url, { ...options, method: "DELETE" });
	}

	clearAuth(): void {
		cookieUtils.auth.clearAuth();
	}

	async isAuthenticated(): Promise<boolean> {
		const token = cookieUtils.auth.getAccessToken();
		if (!token) return false;

		try {
			await this.get<VerifyTokenResponse>("/auth/verify");
			return true;
		} catch (error) {
			// 401エラーの場合は自動的にリフレッシュが試行される
			// それでも失敗した場合は認証が無効
			console.warn("Token validation failed:", error);
			return false;
		}
	}
}

export const apiClient = new ApiClient();
export { ApiClient };
export type { ApiError, RefreshTokenResponse, VerifyTokenResponse };
