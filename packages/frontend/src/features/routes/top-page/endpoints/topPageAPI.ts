import type {
	AllAppreciationsResponse,
	GetAllUsersResponse,
} from "@pichikoto/http-contracts";
import { apiClient } from "~/lib/api-client-class";
import { mockPointLog } from "~/mock/point-log";
import { mockPointRankings } from "~/mock/point-ranking/point-ranking";
import type { Appreciation } from "~/model/appreciation";
import type { PointLog } from "~/model/point-log";
import type { PointRanking } from "~/model/point-ranking";
import type { User } from "~/model/user";
import { toAllUsers, toAppreciations } from "../../../../model/mapper";

export const topPageAPI = {
	async getPointLog(): Promise<PointLog> {
		// 将来的に実際のAPI呼び出しに置き換え
		return mockPointLog;
	},
	async getAppreciationList(): Promise<Appreciation[]> {
		const result = await apiClient.request<AllAppreciationsResponse>(
			"/appreciations",
			{
				method: "GET",
				next: {
					tags: ["appreciations"],
				},
			}
		);
		return toAppreciations(result);
	},

	async getAllUsers(): Promise<User[]> {
		const result = await apiClient.request<GetAllUsersResponse>("/users", {
			method: "GET",
			next: {
				tags: ["users"],
			},
		});
		return toAllUsers(result);
	},
	async getReceivedPointRankings(): Promise<PointRanking[]> {
		return mockPointRankings;
	},

	async getSendPointRankings(): Promise<PointRanking[]> {
		return mockPointRankings;
	},
};
