import type { Context } from "hono";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PointLeaderController } from "../../../src/presentation/controllers/point-leader";
import type { PointLeaderQueryService } from "../../../src/query-service/PointLeaderQueryService";
import { PointLeaderQueryServiceError } from "../../../src/query-service/PointLeaderQueryService";

describe("PointLeaderController", () => {
  let controller: PointLeaderController;
  let mockQueryService: PointLeaderQueryService;
  let mockContext: Context;

  beforeEach(() => {
    mockQueryService = {
      getWeeklyLeaders: vi.fn()
    } as any;

    controller = new PointLeaderController(mockQueryService);

    mockContext = {
      json: vi.fn()
    } as any;
  });

  describe("getWeeklyLeaders", () => {
    it("正常にポイントリーダーを取得できる", async () => {
      // モックデータの準備
      const mockLeaders = {
        topSenders: [
          {
            id: "user1",
            discordUserName: "User1",
            discordAvatar: "avatar1.png",
            totalPoints: 100
          }
        ],
        topReceivers: [
          {
            id: "user2",
            discordUserName: "User2",
            discordAvatar: "avatar2.png",
            totalPoints: 80
          }
        ]
      };

      vi.mocked(mockQueryService.getWeeklyLeaders).mockResolvedValue(
        ok(mockLeaders)
      );

      // テスト実行
      await controller.getWeeklyLeaders(mockContext);

      // 検証
      expect(mockQueryService.getWeeklyLeaders).toHaveBeenCalledOnce();
      expect(mockContext.json).toHaveBeenCalledWith(mockLeaders, 200);
    });

    it("エラーが発生した場合は500エラーを返す", async () => {
      // エラーをモック
      const error = new PointLeaderQueryServiceError("Database error");
      vi.mocked(mockQueryService.getWeeklyLeaders).mockResolvedValue(
        err(error)
      );

      // テスト実行
      await controller.getWeeklyLeaders(mockContext);

      // 検証
      expect(mockQueryService.getWeeklyLeaders).toHaveBeenCalledOnce();
      expect(mockContext.json).toHaveBeenCalledWith(
        {
          error: "Database error",
          errorType: "PointLeaderQueryServiceError"
        },
        500
      );
    });
  });
});
