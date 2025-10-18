import type { Context } from "hono";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GetAllUsersUseCase } from "../../../src/application/use-case/user/GetAllUsersUseCase";
import { DiscordUserID, User } from "../../../src/domain/user/User";
import { UserController } from "../../../src/presentation/controllers/user";
import {
  UserInfoQueryServiceError,
  type UserInfoQueryService
} from "../../../src/query-service/UserInfoQueryService";

describe("UserController", () => {
  let controller: UserController;
  let mockGetAllUsersUseCase: GetAllUsersUseCase;
  let mockUserInfoQueryService: UserInfoQueryService;
  let mockContext: Context;

  beforeEach(() => {
    mockGetAllUsersUseCase = {
      execute: vi.fn()
    } as any;

    mockUserInfoQueryService = {
      getUserInfo: vi.fn()
    } as any;

    mockContext = {
      json: vi.fn(),
      req: {
        param: vi.fn(),
        query: vi.fn()
      }
    } as any;

    controller = new UserController(
      mockGetAllUsersUseCase,
      mockUserInfoQueryService
    );
  });

  describe("getAllUsers", () => {
    it("全ユーザー一覧を正常に取得できる", async () => {
      // Arrange
      const mockUsers = [
        User.reconstruct(
          DiscordUserID.from("123456789012345678"),
          "testuser1",
          "Test User 1",
          "avatar1.png"
        ),
        User.reconstruct(
          DiscordUserID.from("987654321098765432"),
          "testuser2",
          null,
          "avatar2.png"
        )
      ];

      vi.mocked(mockGetAllUsersUseCase.execute).mockResolvedValue(mockUsers);

      // Act
      await controller.getAllUsers(mockContext);

      // Assert
      expect(mockGetAllUsersUseCase.execute).toHaveBeenCalledOnce();
      expect(mockContext.json).toHaveBeenCalledWith({
        users: [
          {
            discordUserID: "123456789012345678",
            discordUserName: "testuser1",
            discordGlobalName: "Test User 1",
            discordAvatar: "avatar1.png"
          },
          {
            discordUserID: "987654321098765432",
            discordUserName: "testuser2",
            discordGlobalName: null,
            discordAvatar: "avatar2.png"
          }
        ]
      });
    });

    it("空の配列でも正常に処理できる", async () => {
      // Arrange
      vi.mocked(mockGetAllUsersUseCase.execute).mockResolvedValue([]);

      // Act
      await controller.getAllUsers(mockContext);

      // Assert
      expect(mockGetAllUsersUseCase.execute).toHaveBeenCalledOnce();
      expect(mockContext.json).toHaveBeenCalledWith({
        users: []
      });
    });
  });

  describe("getUserInfo", () => {
    it("ユーザー情報を正常に取得できる", async () => {
      // Arrange
      const discordUserID = "123456789012345678";
      const mockUserInfo = {
        discordUserID: DiscordUserID.from(discordUserID).value,
        discordUserName: "testuser",
        discordGlobalName: "Test User",
        discordAvatar: "avatar.png",
        remainingPoints: 350
      };

      vi.mocked(mockContext.req.param).mockReturnValue(discordUserID);
      vi.mocked(mockUserInfoQueryService.getUserInfo).mockResolvedValue(
        ok(mockUserInfo)
      );

      // Act
      await controller.getUserInfo(mockContext);

      // Assert
      expect(mockContext.req.query).toHaveBeenCalledWith("name");
      expect(mockContext.req.param).toHaveBeenCalledWith("discordUserID");
      expect(mockUserInfoQueryService.getUserInfo).toHaveBeenCalledWith(
        DiscordUserID.from(discordUserID)
      );
    });

    it("ユーザーが見つからない場合はエラーレスポンスを返す", async () => {
      // Arrange
      const discordUserID = "123456789012345678";
      const error = new UserInfoQueryServiceError("User not found");

      vi.mocked(mockContext.req.param).mockReturnValue(discordUserID);
      vi.mocked(mockUserInfoQueryService.getUserInfo).mockResolvedValue(
        err(error)
      );

      // Act
      await controller.getUserInfo(mockContext);

      // Assert
      expect(mockContext.req.query).toHaveBeenCalledWith("name");
      expect(mockContext.req.param).toHaveBeenCalledWith("discordUserID");
      expect(mockUserInfoQueryService.getUserInfo).toHaveBeenCalledWith(
        DiscordUserID.from(discordUserID)
      );
    });

    it("不正なDiscordUserIDの場合はエラーが発生する", async () => {
      // Arrange
      const invalidDiscordUserID = "invalid-id";
      vi.mocked(mockContext.req.param).mockReturnValue(invalidDiscordUserID);

      // Act & Assert
      await expect(controller.getUserInfo(mockContext)).rejects.toThrow();
      expect(mockContext.req.query).toHaveBeenCalledWith("name");
      expect(mockContext.req.param).toHaveBeenCalledWith("discordUserID");
    });
  });
});
