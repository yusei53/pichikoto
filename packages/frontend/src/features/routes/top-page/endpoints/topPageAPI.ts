import { mockPointLog } from "@/mock/point-log";
import { mockPointSet } from "@/mock/point-set";
import type { PointLog } from "@/model/point-log";
import type { PointSet } from "@/model/point-set";

export const topPageAPI = {
  async getPointLog(): Promise<PointLog> {
    // 将来的に実際のAPI呼び出しに置き換え
    return mockPointLog;
  },
  async getPointSet(): Promise<PointSet> {
    return mockPointSet;
  }
};
