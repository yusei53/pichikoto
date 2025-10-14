import type { Context } from "hono";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateAppreciationUseCaseInterface } from "../../../src/application/use-case/appreciation/CreateAppreciationUseCase";
import type { UpdateAppreciationMessageUseCaseInterface } from "../../../src/application/use-case/appreciation/UpdateAppreciationMessageUseCase";
import { AppreciationController } from "../../../src/presentation/controllers/appreciation";
import type { AppreciationsQueryService } from "../../../src/query-service/AppreciationsQueryService";
import { AppreciationsQueryServiceError } from "../../../src/query-service/AppreciationsQueryService";

describe("AppreciationController", () => {
  let controller: AppreciationController;
  let mockCreateUseCase: CreateAppreciationUseCaseInterface;
  let mockUpdateUseCase: UpdateAppreciationMessageUseCaseInterface;
  let mockQueryService: AppreciationsQueryService;
  let mockContext: Context;

  beforeEach(() => {
    mockCreateUseCase = {
      execute: vi.fn()
    } as any;

    mockUpdateUseCase = {
      execute: vi.fn()
    } as any;

    mockQueryService = {
      getAll: vi.fn()
    } as any;

    mockContext = {
      json: vi.fn().mockReturnValue(new Response())
    } as any;

    controller = new AppreciationController(
      mockCreateUseCase,
      mockUpdateUseCase,
      mockQueryService
    );
  });

  describe("getAllAppreciations", () => {
    it("感謝投稿一覧を正常に取得できる", async () => {
      // Arrange
      const mockResult = {
        appreciations: [
          {
            id: "appreciation-1",
            sender: {
              id: "user-1",
              discordUserName: "sender",
              discordGlobalName: "Sender Display Name",
              discordAvatar: "sender-avatar"
            },
            receivers: [
              {
                id: "user-2",
                discordUserName: "receiver",
                discordGlobalName: "Receiver Display Name",
                discordAvatar: "receiver-avatar"
              }
            ],
            message: "ありがとうございます！",
            pointPerReceiver: 10,
            createdAt: "2023-01-01T00:00:00.000Z"
          }
        ]
      };

      vi.mocked(mockQueryService.getAll).mockResolvedValue(ok(mockResult));

      // Act
      await controller.getAllAppreciations(mockContext);

      // Assert
      expect(mockQueryService.getAll).toHaveBeenCalledOnce();
      expect(mockContext.json).toHaveBeenCalledWith(mockResult, 200);
    });

    it("エラーが発生した場合は500エラーを返す", async () => {
      // Arrange
      const error = new AppreciationsQueryServiceError("Database error");
      vi.mocked(mockQueryService.getAll).mockResolvedValue(err(error));

      // Act
      await controller.getAllAppreciations(mockContext);

      // Assert
      expect(mockQueryService.getAll).toHaveBeenCalledOnce();
      expect(mockContext.json).toHaveBeenCalledWith(
        {
          error: "Database error",
          errorType: "AppreciationsQueryServiceError"
        },
        500
      );
    });
  });
});
