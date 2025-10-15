import { Hono } from "hono";
import { AppreciationTotalPointQueryService } from "../../query-service/AppreciationTotalPointQueryService";
import { PointsController } from "../controllers/points";

const pointsRoutes = new Hono();

// AppreciationTotalPointQueryServiceのインスタンスを作成
const appreciationTotalPointQueryService =
  new AppreciationTotalPointQueryService();
const pointsController = new PointsController(
  appreciationTotalPointQueryService
);

/**
 * 指定されたDiscord User IDのユーザーの送信・受信総ポイントを取得
 * GET /api/points/:discordUserId
 */
pointsRoutes.get("/:discordUserId", (c) =>
  pointsController.getAppreciationTotalPoint(c)
);

export { pointsRoutes };
