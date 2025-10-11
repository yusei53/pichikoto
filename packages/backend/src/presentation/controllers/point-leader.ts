import type { Context } from "hono";
import { PointLeaderQueryService } from "../../query-service/PointLeaderQueryService";
import { ResponseCreator } from "../../utils/ResponseCreator";

export class PointLeaderController {
  constructor(private readonly pointLeaderQueryService: PointLeaderQueryService) {}

  /**
   * 今週のポイント送信・受信上位3人ずつを取得するエンドポイント
   */
  async getWeeklyLeaders(c: Context) {
    try {
      const leaders = await this.pointLeaderQueryService.getWeeklyLeaders();
      
      return ResponseCreator.success(c, leaders);
    } catch (error) {
      console.error("Error getting weekly point leaders:", error);
      return ResponseCreator.internalServerError(c, "週次ポイントリーダーの取得に失敗しました");
    }
  }
}