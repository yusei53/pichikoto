import type { TopPageData } from "@/features/routes/top-page/type";
import { topPageMock } from "@/mock/top";

export const getTopPageData = async (): Promise<TopPageData> => {
  // 将来的に実際のAPI呼び出しに置き換え
  return topPageMock;
};
