import { Hono } from "hono";
import { PointLeaderQueryService } from "../../query-service/PointLeaderQueryService";
import { PointLeaderController } from "../controllers/point-leader";

const pointLeaderRoutes = new Hono();

// PointLeaderQueryServiceのインスタンスを作成
const pointLeaderQueryService = new PointLeaderQueryService();
const pointLeaderController = new PointLeaderController(
  pointLeaderQueryService
);

/**
 * 今週のポイント送信・受信上位3人ずつを取得
 * GET /api/point-leaders/weekly
 */
pointLeaderRoutes.get("/weekly", (c) =>
  pointLeaderController.getWeeklyLeaders(c)
);

export { pointLeaderRoutes };
