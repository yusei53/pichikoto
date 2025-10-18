import { apiClient } from "~/lib/api-client-class";
import type { AppreciationValues } from "./appreciationSchema";

export const appreciationFormAPI = {
	async postAppreciation(appreciation: AppreciationValues): Promise<void> {
		await apiClient.post<void>("/appreciations", appreciation);
	},
};
