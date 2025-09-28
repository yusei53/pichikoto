import { mockAppreciationList } from "~/mock/appreciation/appreciation";
import { mockPointRankings } from "~/mock/point-ranking/point-ranking";
import { mockUser } from "~/mock/user";
import { mockUsers } from "~/mock/user/user";
import type { Appreciation } from "~/model/appreciation";
import type { PointRanking } from "~/model/point-ranking";
import type { User } from "~/model/user";

export const userPageAPI = {
	async getCurrentUser(): Promise<User> {
		return mockUser;
	},

	async getUserById(userId: string): Promise<User | null> {
		const found = mockUsers.find((u) => u.userID === userId);
		return found ?? null;
	},

	async getUser(): Promise<User> {
		return mockUser;
	},

	async getAppreciationList(): Promise<Appreciation[]> {
		// 将来的に実際のAPI呼び出しに置き換え
		return mockAppreciationList;
	},

	async getReceivedPointRankings(): Promise<PointRanking[]> {
		return mockPointRankings;
	},

	async getSendPointRankings(): Promise<PointRanking[]> {
		return mockPointRankings;
	},
};
