import { Hono } from "hono";
import { AppreciationTotalPointQueryService } from "../../query-service/AppreciationTotalPointQueryService";
import { AppreciationUsersQueryService } from "../../query-service/AppreciationUsersQueryService";
import { PointsController } from "../controllers/points";

const pointsRoutes = new Hono();

// クエリサービスのインスタンスを作成
const appreciationTotalPointQueryService =
  new AppreciationTotalPointQueryService();
const appreciationUsersQueryService = new AppreciationUsersQueryService();
const pointsController = new PointsController(
  appreciationTotalPointQueryService,
  appreciationUsersQueryService
);

/**
 * 指定されたDiscord User IDのユーザーの送信・受信総ポイントを取得
 * GET /api/points/:discordUserId
 */
pointsRoutes.get("/:discordUserId", (c) =>
  pointsController.getAppreciationTotalPoint(c)
);

/**
 * 指定されたDiscord User IDのユーザーの送信先・受信元ユーザー一覧を取得
 * GET /api/points/:discordUserId/users
 */
pointsRoutes.get("/:discordUserId/users", (c) =>
  pointsController.getAppreciationUsers(c)
);

export { pointsRoutes };
