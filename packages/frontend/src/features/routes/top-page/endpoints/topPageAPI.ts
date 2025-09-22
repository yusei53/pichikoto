import { mockPointLog } from "~/mock/point-log";
import { mockPointRankings } from "~/mock/point-ranking/point-ranking";
import { mockPosts } from "~/mock/post";
import type { PointLog } from "~/model/point-log";
import type { PointRanking } from "~/model/point-ranking";
import type { Post } from "~/model/post";

export const topPageAPI = {
	async getPointLog(): Promise<PointLog> {
		// 将来的に実際のAPI呼び出しに置き換え
		return mockPointLog;
	},
	async getPosts(): Promise<Post[]> {
		// 将来的に実際のAPI呼び出しに置き換え
		return mockPosts;
	},

	async getReceivedPointRankings(): Promise<PointRanking[]> {
		return mockPointRankings;
	},

	async getSendPointRankings(): Promise<PointRanking[]> {
		return mockPointRankings;
	},
};
