"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cookieUtils } from "~/lib/cookie";

type ClientAuthCallbackCompletePageProps = {
	error?: string;
};

const ClientAuthCallbackCompletePage: React.FC<ClientAuthCallbackCompletePageProps> = ({
	error,
}) => {
	const router = useRouter();
	const [authError, setAuthError] = useState<string | null>(null);

	useEffect(() => {
		if (error) {
			setAuthError("認証に失敗しました");
			return;
		}

		const accessToken = cookieUtils.auth.getAccessToken();
		const refreshToken = cookieUtils.auth.getRefreshToken();

		if (!accessToken || !refreshToken) {
			setAuthError("トークンを取得できませんでした");
			return;
		}

		router.replace("/");
	}, [error, router]);

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
				<p>認証処理を完了しています...</p>
			</div>
		</div>
	);
};

export default ClientAuthCallbackCompletePage;
