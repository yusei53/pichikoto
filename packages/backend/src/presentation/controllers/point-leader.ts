import type { Context } from "hono";
import type { PointLeaderQueryService } from "../../query-service/PointLeaderQueryService";
import { Response } from "../../utils/Response";

export class PointLeaderController {
  constructor(
    private readonly pointLeaderQueryService: PointLeaderQueryService
  ) {}

  /**
   * 今週のポイント送信・受信上位3人ずつを取得するエンドポイント
   */
  async getWeeklyLeaders(c: Context) {
    try {
      const leaders = await this.pointLeaderQueryService.getWeeklyLeaders();

      return Response.ok(leaders).respond(c);
    } catch (error) {
      console.error("Error getting weekly point leaders:", error);
      return c.json({ error: "週次ポイントリーダーの取得に失敗しました" }, 500);
    }
  }
}
