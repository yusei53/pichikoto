import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Context } from "hono";
import { PointLeaderController } from "../../../src/presentation/controllers/point-leader";
import type { PointLeaderQueryService } from "../../../src/query-service/PointLeaderQueryService";

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

      vi.mocked(mockQueryService.getWeeklyLeaders).mockResolvedValue(mockLeaders);
      vi.mocked(mockContext.json).mockReturnValue(new Response());

      // テスト実行
      await controller.getWeeklyLeaders(mockContext);

      // 検証
      expect(mockQueryService.getWeeklyLeaders).toHaveBeenCalledOnce();
      expect(mockContext.json).toHaveBeenCalledWith(mockLeaders, 200);
    });

    it("エラーが発生した場合は500エラーを返す", async () => {
      // エラーをモック
      const error = new Error("Database error");
      vi.mocked(mockQueryService.getWeeklyLeaders).mockRejectedValue(error);
      vi.mocked(mockContext.json).mockReturnValue(new Response());

      // コンソールエラーをモック
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // テスト実行
      await controller.getWeeklyLeaders(mockContext);

      // 検証
      expect(mockQueryService.getWeeklyLeaders).toHaveBeenCalledOnce();
      expect(consoleSpy).toHaveBeenCalledWith("Error getting weekly point leaders:", error);
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "週次ポイントリーダーの取得に失敗しました" },
        500
      );

      consoleSpy.mockRestore();
    });
  });
});