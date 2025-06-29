import type { PointLog } from "@/features/routes/top-page/type";
import { mockPointLog } from "@/mock/point-log";

export const topPageAPI = {
  async getPointLog(): Promise<PointLog> {
    // 将来的に実際のAPI呼び出しに置き換え
    return mockPointLog;
  }
};
