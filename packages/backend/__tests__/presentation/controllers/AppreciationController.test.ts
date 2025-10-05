import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateAppreciationUseCaseInterface } from "../../../src/application/use-case/appreciation/CreateAppreciationUseCase";
import {
  AppreciationDomainError,
  AppreciationDomainServiceError,
  CreateAppreciationUseCaseError
} from "../../../src/application/use-case/appreciation/CreateAppreciationUseCase";
import {
  AppreciationMessage,
  PointPerReceiver,
  ReceiverIDs
} from "../../../src/domain/appreciation/Appreciation";
import { CreateAppreciationError } from "../../../src/domain/appreciation/AppreciationError";
import { ValidateWeeklyLimitError } from "../../../src/domain/appreciation/WeeklyPointLimitDomainService";
import { UserID } from "../../../src/domain/user/User";
import { AppreciationController } from "../../../src/presentation/controllers/appreciation";
import { UUID } from "../../../src/utils/UUID";

// モック定数
const MOCK_SENDER_ID = UUID.new().value;
const MOCK_RECEIVER_ID_1 = UUID.new().value;
const MOCK_RECEIVER_ID_2 = UUID.new().value;
const MOCK_MESSAGE = "いつもお疲れ様です！";
const MOCK_POINT_PER_RECEIVER = 10;

describe("AppreciationController Tests", () => {
  // モックのCreateAppreciationUseCase
  let mockCreateAppreciationUseCase: CreateAppreciationUseCaseInterface;
  let appreciationController: AppreciationController;

  beforeEach(() => {
    // モックのリセット
    vi.clearAllMocks();

    // CreateAppreciationUseCaseのモック作成
    const mockExecute = vi.fn();
    mockCreateAppreciationUseCase = {
      execute: mockExecute
    };

    // AppreciationControllerのインスタンス作成
    appreciationController = new AppreciationController(
      mockCreateAppreciationUseCase,
      {} as any // UpdateAppreciationMessageUseCaseは別テストで扱うため、ダミーを渡す
    );
  });

  describe("createAppreciation", () => {
    /**
     * 正常ケース：感謝の作成が正常に完了する場合のテストケース
     *
     * @description 有効なリクエストボディと認証済みユーザーIDで感謝の作成が正常に完了し、
     *              適切なレスポンスが返されることを確認
     *
     * Arrange
     * - 有効なリクエストボディを準備
     * - 認証済みユーザーIDを設定
     * - CreateAppreciationUseCaseのexecuteメソッドを成功するようにモック設定
     *
     * Act
     * - AppreciationControllerのcreateAppreciationメソッド実行
     *
     * Assert
     * - 正常レスポンス（200）の確認
     * - CreateAppreciationUseCaseのexecuteメソッドが適切なパラメータで呼び出されることの確認
     */
    it("正常ケース：感謝の作成が正常に完了すること", async () => {
      // Arrange
      const mockContext = {
        get: vi.fn().mockReturnValue(MOCK_SENDER_ID),
        json: vi.fn().mockReturnValue(new Response()),
        text: vi.fn().mockReturnValue(new Response()),
        req: {
          raw: new Request("http://localhost", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer mock-jwt-token"
            },
            body: JSON.stringify({
              receiverIDs: [MOCK_RECEIVER_ID_1, MOCK_RECEIVER_ID_2],
              message: MOCK_MESSAGE,
              pointPerReceiver: MOCK_POINT_PER_RECEIVER
            })
          })
        }
      } as any;

      // CreateAppreciationUseCaseのモック設定（成功）
      vi.mocked(mockCreateAppreciationUseCase.execute).mockResolvedValue(ok());

      // Act
      await appreciationController.createAppreciation(mockContext);

      // Assert
      expect(
        vi.mocked(mockCreateAppreciationUseCase.execute)
      ).toHaveBeenCalledWith(
        UserID.from(MOCK_SENDER_ID),
        ReceiverIDs.from([
          UserID.from(MOCK_RECEIVER_ID_1),
          UserID.from(MOCK_RECEIVER_ID_2)
        ]),
        AppreciationMessage.from(MOCK_MESSAGE),
        PointPerReceiver.from(MOCK_POINT_PER_RECEIVER)
      );
      expect(mockContext.text).toHaveBeenCalledWith("", 200);
    });

    /**
     * 異常ケース：認証されていないユーザーの場合のテストケース
     *
     * @description userIDがContextに設定されていない場合、401 Unauthorizedが返されることを確認
     */
    it("異常ケース：認証されていないユーザーの場合、401 Unauthorizedが返されること", async () => {
      // Arrange
      const mockContext = {
        get: vi.fn().mockReturnValue(null), // userIDがnull
        json: vi.fn().mockReturnValue(new Response()),
        text: vi.fn().mockReturnValue(new Response()),
        req: {
          raw: new Request("http://localhost", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer mock-jwt-token"
            },
            body: JSON.stringify({
              receiverIDs: [MOCK_RECEIVER_ID_1],
              message: MOCK_MESSAGE,
              pointPerReceiver: MOCK_POINT_PER_RECEIVER
            })
          })
        }
      } as any;

      // Act
      await appreciationController.createAppreciation(mockContext);

      // Assert
      expect(
        vi.mocked(mockCreateAppreciationUseCase.execute)
      ).not.toHaveBeenCalled();
      expect(mockContext.json).toHaveBeenCalledWith(
        { error: "Unauthorized" },
        401
      );
    });

    /**
     * 異常ケース：AppreciationDomainErrorが発生した場合のテストケース
     *
     * @description CreateAppreciationUseCaseでAppreciationDomainErrorが発生した場合、
     *              適切なBadRequestErrorレスポンスが返されることを確認
     */
    it("異常ケース：AppreciationDomainErrorが発生した場合、BadRequestErrorが返されること", async () => {
      // Arrange
      const mockContext = {
        get: vi.fn().mockReturnValue(MOCK_SENDER_ID),
        json: vi.fn().mockReturnValue(new Response()),
        text: vi.fn().mockReturnValue(new Response()),
        req: {
          raw: new Request("http://localhost", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer mock-jwt-token"
            },
            body: JSON.stringify({
              receiverIDs: [MOCK_SENDER_ID],
              message: MOCK_MESSAGE,
              pointPerReceiver: MOCK_POINT_PER_RECEIVER
            })
          })
        }
      } as any;

      // CreateAppreciationUseCaseのモック設定（AppreciationDomainError）
      vi.mocked(mockCreateAppreciationUseCase.execute).mockResolvedValue(
        err(
          new AppreciationDomainError(
            new CreateAppreciationError("送信者が受信者リストに含まれています")
          )
        )
      );

      // Act
      await appreciationController.createAppreciation(mockContext);

      // Assert
      expect(mockContext.json).toHaveBeenCalledWith(
        {
          error:
            "AppreciationDomainError(cause: CreateAppreciationError(送信者が受信者リストに含まれています))",
          errorType: "AppreciationDomainError"
        },
        400
      );
    });

    /**
     * 異常ケース：AppreciationDomainServiceErrorが発生した場合のテストケース
     *
     * @description CreateAppreciationUseCaseでAppreciationDomainServiceErrorが発生した場合、
     *              適切なBadRequestErrorレスポンスが返されることを確認
     */
    it("異常ケース：AppreciationDomainServiceErrorが発生した場合、BadRequestErrorが返されること", async () => {
      // Arrange
      const mockContext = {
        get: vi.fn().mockReturnValue(MOCK_SENDER_ID),
        json: vi.fn().mockReturnValue(new Response()),
        text: vi.fn().mockReturnValue(new Response()),
        req: {
          raw: new Request("http://localhost", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer mock-jwt-token"
            },
            body: JSON.stringify({
              receiverIDs: [MOCK_RECEIVER_ID_1],
              message: MOCK_MESSAGE,
              pointPerReceiver: MOCK_POINT_PER_RECEIVER
            })
          })
        }
      } as any;

      vi.mocked(mockCreateAppreciationUseCase.execute).mockResolvedValue(
        err(
          new AppreciationDomainServiceError(
            new ValidateWeeklyLimitError("週次ポイント制限を超えています")
          )
        )
      );

      // Act
      await appreciationController.createAppreciation(mockContext);

      // Assert
      expect(mockContext.json).toHaveBeenCalledWith(
        {
          error:
            "AppreciationDomainServiceError(cause: ValidateWeeklyLimitError(週次ポイント制限を超えています))",
          errorType: "AppreciationDomainServiceError"
        },
        400
      );
    });

    /**
     * 異常ケース：その他のCreateAppreciationUseCaseErrorが発生した場合のテストケース
     *
     * @description CreateAppreciationUseCaseでその他のエラーが発生した場合、
     *              適切なInternalServerErrorレスポンスが返されることを確認
     */
    it("異常ケース：その他のCreateAppreciationUseCaseErrorが発生した場合、InternalServerErrorが返されること", async () => {
      // Arrange
      const mockContext = {
        get: vi.fn().mockReturnValue(MOCK_SENDER_ID),
        json: vi.fn().mockReturnValue(new Response()),
        text: vi.fn().mockReturnValue(new Response()),
        req: {
          raw: new Request("http://localhost", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer mock-jwt-token"
            },
            body: JSON.stringify({
              receiverIDs: [MOCK_RECEIVER_ID_1],
              message: MOCK_MESSAGE,
              pointPerReceiver: MOCK_POINT_PER_RECEIVER
            })
          })
        }
      } as any;

      vi.mocked(mockCreateAppreciationUseCase.execute).mockResolvedValue(
        err(
          new CreateAppreciationUseCaseError(
            new Error("予期しないエラーが発生しました")
          )
        )
      );

      // Act
      await appreciationController.createAppreciation(mockContext);

      // Assert
      expect(mockContext.json).toHaveBeenCalledWith(
        {
          error:
            "CreateAppreciationUseCaseError(cause: Error(予期しないエラーが発生しました))",
          errorType: "InternalServerError"
        },
        500
      );
    });

    /**
     * 正常ケース：単一受信者への感謝が正常に作成されることのテストケース
     *
     * @description 単一受信者への感謝が正常に作成されることを確認
     */
    it("正常ケース：単一受信者への感謝が正常に作成されること", async () => {
      // Arrange
      const mockContext = {
        get: vi.fn().mockReturnValue(MOCK_SENDER_ID),
        json: vi.fn().mockReturnValue(new Response()),
        text: vi.fn().mockReturnValue(new Response()),
        req: {
          raw: new Request("http://localhost", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer mock-jwt-token"
            },
            body: JSON.stringify({
              receiverIDs: [MOCK_RECEIVER_ID_1],
              message: MOCK_MESSAGE,
              pointPerReceiver: MOCK_POINT_PER_RECEIVER
            })
          })
        }
      } as any;

      // CreateAppreciationUseCaseのモック設定（成功）
      vi.mocked(mockCreateAppreciationUseCase.execute).mockResolvedValue(ok());

      // Act
      await appreciationController.createAppreciation(mockContext);

      // Assert
      expect(
        vi.mocked(mockCreateAppreciationUseCase.execute)
      ).toHaveBeenCalledWith(
        UserID.from(MOCK_SENDER_ID),
        ReceiverIDs.from([UserID.from(MOCK_RECEIVER_ID_1)]),
        AppreciationMessage.from(MOCK_MESSAGE),
        PointPerReceiver.from(MOCK_POINT_PER_RECEIVER)
      );
      expect(mockContext.text).toHaveBeenCalledWith("", 200);
    });

    /**
     * 正常ケース：最大受信者数（6人）への感謝が正常に作成されることのテストケース
     *
     * @description 最大受信者数（6人）への感謝が正常に作成されることを確認
     */
    it("正常ケース：最大受信者数（6人）への感謝が正常に作成されること", async () => {
      // Arrange
      const receiverIds = [
        MOCK_RECEIVER_ID_1,
        MOCK_RECEIVER_ID_2,
        UUID.new().value,
        UUID.new().value,
        UUID.new().value,
        UUID.new().value
      ];

      const mockContext = {
        get: vi.fn().mockReturnValue(MOCK_SENDER_ID),
        json: vi.fn().mockReturnValue(new Response()),
        text: vi.fn().mockReturnValue(new Response()),
        req: {
          raw: new Request("http://localhost", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer mock-jwt-token"
            },
            body: JSON.stringify({
              receiverIDs: receiverIds,
              message: MOCK_MESSAGE,
              pointPerReceiver: MOCK_POINT_PER_RECEIVER
            })
          })
        }
      } as any;

      // CreateAppreciationUseCaseのモック設定（成功）
      vi.mocked(mockCreateAppreciationUseCase.execute).mockResolvedValue(ok());

      // Act
      await appreciationController.createAppreciation(mockContext);

      // Assert
      expect(
        vi.mocked(mockCreateAppreciationUseCase.execute)
      ).toHaveBeenCalledWith(
        UserID.from(MOCK_SENDER_ID),
        ReceiverIDs.from(receiverIds.map((id) => UserID.from(id))),
        AppreciationMessage.from(MOCK_MESSAGE),
        PointPerReceiver.from(MOCK_POINT_PER_RECEIVER)
      );
      expect(mockContext.text).toHaveBeenCalledWith("", 200);
    });
  });
});
