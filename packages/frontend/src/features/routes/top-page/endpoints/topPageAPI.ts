import { mockPointLog } from "~/mock/point-log";
import { mockPointRanking } from "~/mock/point-ranking/point-ranking";
import { mockPost } from "~/mock/post";
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
        return [mockPost, mockPost, mockPost];
    },

    async getReceivedPointRanking(): Promise<PointRanking[]> {
        return [mockPointRanking, mockPointRanking, mockPointRanking];
    },

    async getSendPointRanking(): Promise<PointRanking[]> {
        return [mockPointRanking, mockPointRanking, mockPointRanking];
    },
};
