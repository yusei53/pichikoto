import { mockPointLog } from "@/mock/point-log";
import type { PointLog } from "@/model/point-log";

export const topPageAPI = {
  async getPointLog(): Promise<PointLog> {
    // 将来的に実際のAPI呼び出しに置き換え
    return mockPointLog;
  }
};
