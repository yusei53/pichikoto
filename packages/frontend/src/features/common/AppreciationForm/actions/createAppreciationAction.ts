"use server";

import { revalidateTag } from "next/cache";
import { apiClientServer } from "~/lib/api-client-server";
import type { AppreciationValues } from "../endpoints/appreciationSchema";

export async function createAppreciationAction(
	appreciation: AppreciationValues
): Promise<{ success: boolean; error?: string }> {
	try {
		await apiClientServer.post<void>("/appreciations", appreciation);

		revalidateTag("appreciations");
		revalidateTag("point-leaders");
		revalidateTag("users");

		return { success: true };
	} catch (error) {
		console.error("Failed to create appreciation:", error);
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "ポストの送信に失敗しました",
		};
	}
}
