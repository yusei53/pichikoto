import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UpdateAppreciationMessageUseCaseInterface } from "../../../src/application/use-case/appreciation/UpdateAppreciationMessageUseCase";
import {
  AppreciationNotFoundError,
  UpdateAppreciationMessageUseCaseError
} from "../../../src/application/use-case/appreciation/UpdateAppreciationMessageUseCase";
import {
  AppreciationID,
  AppreciationMessage
} from "../../../src/domain/appreciation/Appreciation";
import { UserID } from "../../../src/domain/user/User";
import { AppreciationController } from "../../../src/presentation/controllers/appreciation";
import { UUID } from "../../../src/utils/UUID";

// モック定数
const MOCK_SENDER_ID = UUID.new().value;
const MOCK_NEW_MESSAGE = "ありがとうございます！";
const MOCK_APPRECIATION_ID = UUID.new().value;

describe("AppreciationUpdateController Tests", () => {
  // モックのUpdateAppreciationMessageUseCase
  let mockUpdateAppreciationMessageUseCase: UpdateAppreciationMessageUseCaseInterface;
  let appreciationController: AppreciationController;

  beforeEach(() => {
    // モックのリセット
    vi.clearAllMocks();

    // UpdateAppreciationMessageUseCaseのモック作成
    const mockExecute = vi.fn();
    mockUpdateAppreciationMessageUseCase = {
      execute: mockExecute
    };

    // AppreciationControllerのインスタンス作成
    appreciationController = new AppreciationController(
      {} as any, // CreateAppreciationUseCaseはダミー
      mockUpdateAppreciationMessageUseCase,
      {} as any // AppreciationsQueryServiceはダミー
    );
  });

  describe("updateAppreciationMessage", () => {
    /**
     * 正常ケース：感謝メッセージの更新が正常に完了する場合のテストケース
     *
     * @description 有効なリクエストボディと認証済みユーザーIDで感謝メッセージの更新が正常に完了し、
     *              適切なレスポンスが返されることを確認する
     */
    it("正常ケース：感謝メッセージの更新が正常に完了すること", async () => {
      // Arrange
      const url = `http://localhost/appreciations/${MOCK_APPRECIATION_ID}`;
      const mockContext = {
        get: vi.fn().mockReturnValue(MOCK_SENDER_ID),
        json: vi.fn().mockReturnValue(new Response()),
        text: vi.fn().mockReturnValue(new Response()),
        req: {
          raw: new Request(url, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer mock-jwt-token"
            },
            body: JSON.stringify({
              message: MOCK_NEW_MESSAGE
            })
          }),
          param: vi.fn().mockReturnValue(MOCK_APPRECIATION_ID),
          json: vi.fn().mockResolvedValue({ message: MOCK_NEW_MESSAGE })
        }
      } as any;

      // UpdateAppreciationMessageUseCaseのモック設定（成功）
      vi.mocked(mockUpdateAppreciationMessageUseCase.execute).mockResolvedValue(
        ok()
      );

      // Act
      await appreciationController.updateAppreciationMessage(mockContext);

      // Assert
      expect(
        vi.mocked(mockUpdateAppreciationMessageUseCase.execute)
      ).toHaveBeenCalledWith(
        AppreciationID.from(MOCK_APPRECIATION_ID),
        UserID.from(MOCK_SENDER_ID),
        AppreciationMessage.from(MOCK_NEW_MESSAGE)
      );
      expect(mockContext.text).toHaveBeenCalledWith("", 200);
    });

    /**
     * 異常ケース：感謝が見つからない場合のテストケース
     *
     * @description 存在しない感謝IDでメッセージ更新を試行した場合、
     *              404 NotFoundエラーが返されることを確認する
     */
    it("異常ケース：感謝が見つからない場合、404エラーが返されること", async () => {
      // Arrange
      const url = `http://localhost/appreciations/${MOCK_APPRECIATION_ID}`;
      const mockContext = {
        get: vi.fn().mockReturnValue(MOCK_SENDER_ID),
        json: vi.fn().mockReturnValue(new Response()),
        text: vi.fn().mockReturnValue(new Response()),
        req: {
          raw: new Request(url, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer mock-jwt-token"
            },
            body: JSON.stringify({
              message: MOCK_NEW_MESSAGE
            })
          }),
          param: vi.fn().mockReturnValue(MOCK_APPRECIATION_ID),
          json: vi.fn().mockResolvedValue({ message: MOCK_NEW_MESSAGE })
        }
      } as any;

      // UpdateAppreciationMessageUseCaseのモック設定（AppreciationNotFoundError）
      vi.mocked(mockUpdateAppreciationMessageUseCase.execute).mockResolvedValue(
        err(
          new AppreciationNotFoundError(
            AppreciationID.from(MOCK_APPRECIATION_ID)
          )
        )
      );

      // Act
      await appreciationController.updateAppreciationMessage(mockContext);

      // Assert
      expect(mockContext.json).toHaveBeenCalledWith(
        {
          error: `AppreciationNotFoundError(cause: Appreciation not found: AppreciationID(value: ${MOCK_APPRECIATION_ID}))`,
          errorType: "AppreciationNotFoundError"
        },
        404
      );
    });

    /**
     * 異常ケース：予期しないエラーが発生した場合のテストケース
     *
     * @description 予期しないエラーが発生した場合、
     *              500 Internal Server Errorが返されることを確認する
     */
    it("異常ケース：予期しないエラーが発生した場合、500エラーが返されること", async () => {
      // Arrange
      const url = `http://localhost/appreciations/${MOCK_APPRECIATION_ID}`;
      const mockContext = {
        get: vi.fn().mockReturnValue(MOCK_SENDER_ID),
        json: vi.fn().mockReturnValue(new Response()),
        text: vi.fn().mockReturnValue(new Response()),
        req: {
          raw: new Request(url, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer mock-jwt-token"
            },
            body: JSON.stringify({
              message: MOCK_NEW_MESSAGE
            })
          }),
          param: vi.fn().mockReturnValue(MOCK_APPRECIATION_ID),
          json: vi.fn().mockResolvedValue({ message: MOCK_NEW_MESSAGE })
        }
      } as any;

      // UpdateAppreciationMessageUseCaseのモック設定（予期しないエラー）
      const unexpectedError = new UpdateAppreciationMessageUseCaseError(
        new Error("Unexpected error")
      );
      vi.mocked(mockUpdateAppreciationMessageUseCase.execute).mockResolvedValue(
        err(unexpectedError)
      );

      // Act
      await appreciationController.updateAppreciationMessage(mockContext);

      // Assert
      expect(mockContext.json).toHaveBeenCalledWith(
        {
          error: expect.stringContaining(
            "UpdateAppreciationMessageUseCaseError"
          ),
          errorType: "InternalServerError"
        },
        500
      );
    });

    /**
     * 異常ケース：不正な感謝IDで更新を試行した場合のテストケース
     *
     * @description 不正なフォーマットの感謝IDでメッセージ更新を試行した場合、
     *              バリデーションエラーが返されることを確認する
     */
    it("異常ケース：不正な感謝IDで更新を試行した場合、バリデーションエラーが返されること", async () => {
      // Arrange
      const invalidAppreciationId = "invalid-uuid";
      const url = `http://localhost/appreciations/${invalidAppreciationId}`;
      const mockContext = {
        get: vi.fn().mockReturnValue(MOCK_SENDER_ID),
        json: vi.fn().mockReturnValue(new Response()),
        text: vi.fn().mockReturnValue(new Response()),
        req: {
          raw: new Request(url, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer mock-jwt-token"
            },
            body: JSON.stringify({
              message: MOCK_NEW_MESSAGE
            })
          }),
          param: vi.fn().mockReturnValue(invalidAppreciationId),
          json: vi.fn().mockResolvedValue({ message: MOCK_NEW_MESSAGE })
        }
      } as any;

      // Act & Assert
      // AppreciationID.from()でバリデーションエラーが発生することを期待
      await expect(
        appreciationController.updateAppreciationMessage(mockContext)
      ).rejects.toThrow();
    });
  });
});
