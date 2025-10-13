import { mockAppreciationList } from "~/mock/appreciation";
import { mockPointLog } from "~/mock/point-log";
import { mockPointRankings } from "~/mock/point-ranking/point-ranking";
import type { Appreciation } from "~/model/appreciation";
import type { PointLog } from "~/model/point-log";
import type { PointRanking } from "~/model/point-ranking";

export const topPageAPI = {
	async getPointLog(): Promise<PointLog> {
		// 将来的に実際のAPI呼び出しに置き換え
		return mockPointLog;
	},
	async getAppreciationList(): Promise<Appreciation[]> {
		return mockAppreciationList;
	},

	async getReceivedPointRankings(): Promise<PointRanking[]> {
		return mockPointRankings;
	},

	async getSendPointRankings(): Promise<PointRanking[]> {
		return mockPointRankings;
	},
};
