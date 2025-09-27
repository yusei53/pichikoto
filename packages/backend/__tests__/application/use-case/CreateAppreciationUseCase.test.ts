import { err, ok } from "neverthrow";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as schema from "../../../database/schema";
import {
  CreateAppreciationUseCase,
  type CreateAppreciationUseCaseInterface
} from "../../../src/application/use-case/appreciation/CreateAppreciationUseCase";
import {
  Appreciation,
  AppreciationID,
  AppreciationMessage,
  PointPerReceiver,
  ReceiverIDs
} from "../../../src/domain/appreciation/Appreciation";
import {
  ValidateWeeklyLimitError,
  type WeeklyPointLimitDomainServiceInterface
} from "../../../src/domain/appreciation/WeeklyPointLimitDomainService";
import {
  ConsumedPointLog,
  ConsumedPointLogID,
  ConsumedPoints,
  WeekStartDate
} from "../../../src/domain/consumed-point-log/ConsumedPointLog";
import { UserID } from "../../../src/domain/user/User";
import { AppreciationRepository } from "../../../src/infrastructure/repositories/AppreciationRepository";
import { ConsumedPointLogRepository } from "../../../src/infrastructure/repositories/ConsumedPointLogRepository";
import { CreatedAt } from "../../../src/utils/CreatedAt";
import { UUID } from "../../../src/utils/UUID";
import {
  assertEqualAppreciationReceiversTable,
  assertEqualAppreciationTable
} from "../../testing/table_assert/AssertEqualAppreciationTable";
import { assertEqualConsumedPointLogTable } from "../../testing/table_assert/AssertEqualConsumedPointLogTable";
import { expectOk } from "../../testing/utils/AssertResult";
import {
  getTypedMultipleRecords,
  getTypedSingleRecord
} from "../../testing/utils/DatabaseAssertHelpers";
import {
  deleteFromDatabase,
  insertToDatabase
} from "../../testing/utils/GenericTableHelper";

// モック定数（有効なUUID形式）
const MOCK_SENDER_ID = UUID.new().value;
const MOCK_RECEIVER_ID_1 = UUID.new().value;
const MOCK_RECEIVER_ID_2 = UUID.new().value;
const MOCK_MESSAGE = "いつもお疲れ様です！";
const MOCK_POINT_PER_RECEIVER = 10;

describe("CreateAppreciationUseCase Tests", () => {
  // 実際のリポジトリ（テスト用データベースに接続）
  const appreciationRepository = new AppreciationRepository();
  const consumedPointLogRepository = new ConsumedPointLogRepository();

  // モックドメインサービス
  const mockWeeklyPointLimitDomainService = {
    validateWeeklyLimit: vi.fn()
  };

  const createAppreciationUseCase: CreateAppreciationUseCaseInterface =
    new CreateAppreciationUseCase(
      appreciationRepository,
      consumedPointLogRepository,
      mockWeeklyPointLimitDomainService as WeeklyPointLimitDomainServiceInterface
    );

  // 共通のテストデータ
  let senderID: UserID;
  let receiverIDs: ReceiverIDs;
  let message: AppreciationMessage;
  let pointPerReceiver: PointPerReceiver;

  beforeEach(async () => {
    // モックのリセット
    vi.clearAllMocks();

    const MOCK_APPRECIATION_ID = UUID.new().value;
    vi.spyOn(AppreciationID, "new").mockReturnValue(
      new (class {
        constructor(public readonly value: UUID) {}
      })(UUID.from(MOCK_APPRECIATION_ID))
    );

    const MOCK_CONSUMED_POINT_LOG_ID = UUID.new().value;
    vi.spyOn(ConsumedPointLogID, "new").mockReturnValue(
      new (class {
        constructor(public readonly value: UUID) {}
      })(UUID.from(MOCK_CONSUMED_POINT_LOG_ID))
    );

    // データベースのクリア（外部キー制約の順序に注意）
    await deleteFromDatabase(schema.consumedPointLog);
    await deleteFromDatabase(schema.appreciationReceivers);
    await deleteFromDatabase(schema.appreciations);
    await deleteFromDatabase(schema.user);

    // テスト用ユーザーデータの作成
    await insertToDatabase(schema.user, {
      id: MOCK_SENDER_ID,
      discordId: "sender_discord_id",
      discordUserName: "送信者テストユーザー",
      discordAvatar: "avatar_url"
    });

    await insertToDatabase(schema.user, {
      id: MOCK_RECEIVER_ID_1,
      discordId: "receiver1_discord_id",
      discordUserName: "受信者1テストユーザー",
      discordAvatar: "avatar_url"
    });

    await insertToDatabase(schema.user, {
      id: MOCK_RECEIVER_ID_2,
      discordId: "receiver2_discord_id",
      discordUserName: "受信者2テストユーザー",
      discordAvatar: "avatar_url"
    });

    // テストデータの準備
    senderID = UserID.from(MOCK_SENDER_ID);
    receiverIDs = ReceiverIDs.from([
      UserID.from(MOCK_RECEIVER_ID_1),
      UserID.from(MOCK_RECEIVER_ID_2)
    ]);
    message = AppreciationMessage.from(MOCK_MESSAGE);
    pointPerReceiver = PointPerReceiver.from(MOCK_POINT_PER_RECEIVER);

    // デフォルトのモック動作設定
    mockWeeklyPointLimitDomainService.validateWeeklyLimit.mockResolvedValue(
      ok()
    );
  });

  afterEach(async () => {
    vi.clearAllMocks();

    // データベースのクリア（外部キー制約の順序に注意）
    await deleteFromDatabase(schema.consumedPointLog);
    await deleteFromDatabase(schema.appreciationReceivers);
    await deleteFromDatabase(schema.appreciations);
    await deleteFromDatabase(schema.user);
  });

  describe("execute", () => {
    /**
     * 正常ケース：感謝の作成とポイント消費ログの記録が正常に行われることのテストケース
     *
     * @description 有効な入力で感謝を作成し、週次ポイント制限検証を通過し、感謝とポイント消費ログが正常に保存されることを確認
     *
     * Arrange
     * - 有効な送信者ID、受信者ID、メッセージ、ポイントを準備
     * - 週次ポイント制限検証を成功するようにモック設定
     * - リポジトリのstoreメソッドを成功するようにモック設定
     *
     * Act
     * - CreateAppreciationUseCaseのexecuteメソッド実行
     *
     * Assert
     * - 正常完了（void）の確認
     * - 週次ポイント制限検証の呼び出し確認
     * - 感謝リポジトリのstore呼び出し確認
     * - ポイント消費ログリポジトリのstore呼び出し確認
     * - データベースにレコードが正しくインサートされていることを確認
     */
    it("正常ケース：感謝の作成とポイント消費ログの記録が正常に行われること", async () => {
      // Arrange
      const appreciation = Appreciation.reconstruct(
        AppreciationID.new(),
        senderID,
        receiverIDs,
        message,
        pointPerReceiver,
        CreatedAt.new()
      );

      const consumedPointLog = ConsumedPointLog.reconstruct(
        ConsumedPointLogID.new(),
        senderID,
        appreciation.appreciationID,
        WeekStartDate.new(),
        ConsumedPoints.from(pointPerReceiver.value * 2),
        CreatedAt.new()
      );

      // Act
      const result = await createAppreciationUseCase.execute(
        senderID,
        receiverIDs,
        message,
        pointPerReceiver
      );

      // Assert
      expectOk(result);

      const appreciationRecord = await getTypedSingleRecord(
        schema.appreciations
      );
      assertEqualAppreciationTable(appreciation, appreciationRecord!);

      const actualReceiverRecords = await getTypedMultipleRecords(
        schema.appreciationReceivers
      );
      assertEqualAppreciationReceiversTable(
        appreciation,
        actualReceiverRecords
      );

      const consumedPointLogRecord = await getTypedSingleRecord(
        schema.consumedPointLog
      );
      assertEqualConsumedPointLogTable(
        consumedPointLog,
        consumedPointLogRecord!
      );
    });

    /**
     * 異常ケース：送信者が受信者リストに含まれている場合のエラーテストケース
     *
     * @description 送信者が受信者リストに含まれている場合、適切なドメインエラーが発生することを確認
     */
    it("異常ケース：送信者が受信者リストに含まれている場合、AppreciationDomainErrorが発生すること", async () => {
      // Arrange
      const invalidReceiverIDs = ReceiverIDs.from([
        UserID.from(MOCK_SENDER_ID), // 送信者と同じID
        UserID.from(MOCK_RECEIVER_ID_1)
      ]);

      // Act & Assert
      await expect(
        createAppreciationUseCase.execute(
          senderID,
          invalidReceiverIDs,
          message,
          pointPerReceiver
        )
      ).rejects.toThrowError(
        /AppreciationDomainError\(cause: CreateAppreciationError\(送信者が受信者リストに含まれています/
      );
    });

    /**
     * 異常ケース：総ポイントが制限を超えている場合のエラーテストケース
     *
     * @description 総ポイント（ポイント×受信者数）が120を超える場合、適切なドメインエラーが発生することを確認
     */
    it("異常ケース：総ポイントが制限を超えている場合、AppreciationDomainErrorが発生すること", async () => {
      // Arrange
      const highPointPerReceiver = PointPerReceiver.from(100);
      // 100ポイント × 2人 = 200ポイント（制限120を超える）

      // Act & Assert
      await expect(
        createAppreciationUseCase.execute(
          senderID,
          receiverIDs,
          message,
          highPointPerReceiver
        )
      ).rejects.toThrowError(
        /AppreciationDomainError\(cause: CreateAppreciationError\(総ポイントが制限を超えています/
      );
    });

    /**
     * 異常ケース：週次ポイント制限を超えている場合のエラーテストケース
     *
     * @description 週次ポイント制限を超える場合、適切なドメインサービスエラーが発生することを確認
     */
    it("異常ケース：週次ポイント制限を超えている場合、AppreciationDomainServiceErrorが発生すること", async () => {
      // Arrange
      const weeklyLimitError = ValidateWeeklyLimitError.totalPointExceedsLimit(
        420,
        400
      );
      mockWeeklyPointLimitDomainService.validateWeeklyLimit.mockResolvedValue(
        err(weeklyLimitError)
      );

      // Act & Assert
      await expect(
        createAppreciationUseCase.execute(
          senderID,
          receiverIDs,
          message,
          pointPerReceiver
        )
      ).rejects.toThrowError(
        /AppreciationDomainServiceError\(cause: ValidateWeeklyLimitError\(TotalPointExceedsLimit/
      );
    });

    /**
     * 正常ケース：異なるポイント数での動作確認テストケース
     *
     * @description 異なるポイント数（単一受信者）で正常に動作することを確認
     */
    it("正常ケース：単一受信者への感謝が正常に作成されること", async () => {
      // Arrange
      const singleReceiverIDs = ReceiverIDs.from([
        UserID.from(MOCK_RECEIVER_ID_1)
      ]);
      const highPointPerReceiver = PointPerReceiver.from(50);

      const appreciation = Appreciation.reconstruct(
        AppreciationID.new(),
        senderID,
        singleReceiverIDs,
        message,
        highPointPerReceiver,
        CreatedAt.new()
      );

      const consumedPointLog = ConsumedPointLog.reconstruct(
        ConsumedPointLogID.new(),
        senderID,
        appreciation.appreciationID,
        WeekStartDate.new(),
        ConsumedPoints.from(highPointPerReceiver.value),
        CreatedAt.new()
      );

      // Act
      const result = await createAppreciationUseCase.execute(
        senderID,
        singleReceiverIDs,
        message,
        highPointPerReceiver
      );

      // Assert
      expectOk(result);

      const appreciationRecord = await getTypedSingleRecord(
        schema.appreciations
      );
      assertEqualAppreciationTable(appreciation, appreciationRecord!);

      const actualReceiverRecords = await getTypedMultipleRecords(
        schema.appreciationReceivers
      );
      assertEqualAppreciationReceiversTable(
        appreciation,
        actualReceiverRecords
      );

      const consumedPointLogRecord = await getTypedSingleRecord(
        schema.consumedPointLog
      );
      assertEqualConsumedPointLogTable(
        consumedPointLog,
        consumedPointLogRecord!
      );
    });

    /**
     * 正常ケース：最大受信者数での動作確認テストケース
     *
     * @description 最大受信者数（6人）で正常に動作することを確認
     */
    it("正常ケース：最大受信者数（6人）への感謝が正常に作成されること", async () => {
      // Arrange
      // 追加の6人のユーザーIDを生成してDBに挿入
      const additionalUserIds = [
        UUID.new().value,
        UUID.new().value,
        UUID.new().value,
        UUID.new().value,
        UUID.new().value,
        UUID.new().value
      ];

      // 追加ユーザーをDBに挿入
      for (let i = 0; i < additionalUserIds.length; i++) {
        await insertToDatabase(schema.user, {
          id: additionalUserIds[i],
          discordId: `additional_user_${i}_discord_id`,
          discordUserName: `追加ユーザー${i + 1}`,
          discordAvatar: "avatar_url"
        });
      }

      const maxReceiverIDs = ReceiverIDs.from(
        additionalUserIds.map((id) => UserID.from(id))
      );
      const pointFor6People = PointPerReceiver.from(20); // 20 × 6 = 120（制限内）

      const appreciation = Appreciation.reconstruct(
        AppreciationID.new(),
        senderID,
        maxReceiverIDs,
        message,
        pointFor6People,
        CreatedAt.new()
      );

      const consumedPointLog = ConsumedPointLog.reconstruct(
        ConsumedPointLogID.new(),
        senderID,
        appreciation.appreciationID,
        WeekStartDate.new(),
        ConsumedPoints.from(pointFor6People.value * 6),
        CreatedAt.new()
      );

      // Act
      const result = await createAppreciationUseCase.execute(
        senderID,
        maxReceiverIDs,
        message,
        pointFor6People
      );

      // Assert
      expectOk(result);

      const appreciationRecord = await getTypedSingleRecord(
        schema.appreciations
      );
      assertEqualAppreciationTable(appreciation, appreciationRecord!);

      const actualReceiverRecords = await getTypedMultipleRecords(
        schema.appreciationReceivers
      );
      assertEqualAppreciationReceiversTable(
        appreciation,
        actualReceiverRecords
      );

      const consumedPointLogRecord = await getTypedSingleRecord(
        schema.consumedPointLog
      );
      assertEqualConsumedPointLogTable(
        consumedPointLog,
        consumedPointLogRecord!
      );
    });
  });
});
