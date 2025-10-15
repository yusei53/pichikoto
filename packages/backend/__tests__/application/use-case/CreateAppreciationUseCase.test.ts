import type { Context } from "hono";
import { err, ok } from "neverthrow";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as schema from "../../../database/schema";
import type { DiscordNotificationServiceInterface } from "../../../src/application/services/discord-notification/DiscordNotificationService";
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
import { DiscordUserID } from "../../../src/domain/user/User";
import { AppreciationRepository } from "../../../src/infrastructure/repositories/AppreciationRepository";
import { CreatedAt } from "../../../src/utils/CreatedAt";
import { UUID } from "../../../src/utils/UUID";
import {
  assertEqualAppreciationReceiversTable,
  assertEqualAppreciationTable
} from "../../testing/table_assert/AssertEqualAppreciationTable";
import { expectOk } from "../../testing/utils/AssertResult";
import {
  getTypedMultipleRecords,
  getTypedSingleRecord
} from "../../testing/utils/DatabaseAssertHelpers";
import {
  deleteFromDatabase,
  insertToDatabase
} from "../../testing/utils/GenericTableHelper";

// モック定数（有効なDiscord ID形式）
const MOCK_SENDER_ID = "123456789012345678";
const MOCK_RECEIVER_ID_1 = "234567890123456789";
const MOCK_RECEIVER_ID_2 = "345678901234567890";
const MOCK_MESSAGE = "いつもお疲れ様です！";
const MOCK_POINT_PER_RECEIVER = 10;

describe("CreateAppreciationUseCase Tests", () => {
  // 実際のリポジトリ（テスト用データベースに接続）
  const appreciationRepository = new AppreciationRepository();

  // モックサービス
  const mockWeeklyPointLimitDomainService = {
    validateWeeklyLimit: vi.fn()
  };

  const mockDiscordNotificationService = {
    sendAppreciationNotification: vi.fn()
  };

  // モックコンテキスト
  const mockContext = {
    env: {
      DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/test",
      FRONTEND_BASE_URL: "https://frontend.example.com"
    }
  } as Context;

  const createAppreciationUseCase: CreateAppreciationUseCaseInterface =
    new CreateAppreciationUseCase(
      appreciationRepository,
      mockWeeklyPointLimitDomainService as WeeklyPointLimitDomainServiceInterface,
      mockDiscordNotificationService as DiscordNotificationServiceInterface
    );

  // 共通のテストデータ
  let senderID: DiscordUserID;
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

    // データベースのクリア（外部キー制約の順序に注意）
    await deleteFromDatabase(schema.appreciationReceivers);
    await deleteFromDatabase(schema.appreciations);
    await deleteFromDatabase(schema.user);

    // テスト用ユーザーデータの作成
    await insertToDatabase(schema.user, {
      discordUserId: MOCK_SENDER_ID,
      discordUserName: "送信者テストユーザー",
      discordAvatar: "avatar_url"
    });

    await insertToDatabase(schema.user, {
      discordUserId: MOCK_RECEIVER_ID_1,
      discordUserName: "受信者1テストユーザー",
      discordAvatar: "avatar_url"
    });

    await insertToDatabase(schema.user, {
      discordUserId: MOCK_RECEIVER_ID_2,
      discordUserName: "受信者2テストユーザー",
      discordAvatar: "avatar_url"
    });

    // テストデータの準備
    senderID = DiscordUserID.from(MOCK_SENDER_ID);
    receiverIDs = ReceiverIDs.from([
      DiscordUserID.from(MOCK_RECEIVER_ID_1),
      DiscordUserID.from(MOCK_RECEIVER_ID_2)
    ]);
    message = AppreciationMessage.from(MOCK_MESSAGE);
    pointPerReceiver = PointPerReceiver.from(MOCK_POINT_PER_RECEIVER);

    // デフォルトのモック動作設定
    mockWeeklyPointLimitDomainService.validateWeeklyLimit.mockResolvedValue(
      ok()
    );
    mockDiscordNotificationService.sendAppreciationNotification.mockResolvedValue(
      ok()
    );
  });

  afterEach(async () => {
    vi.clearAllMocks();

    // データベースのクリア（外部キー制約の順序に注意）
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

      // Act
      const result = await createAppreciationUseCase.execute(
        mockContext,
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
    });

    /**
     * 異常ケース：送信者が受信者リストに含まれている場合のエラーテストケース
     *
     * @description 送信者が受信者リストに含まれている場合、適切なドメインエラーが発生することを確認
     */
    it("異常ケース：送信者が受信者リストに含まれている場合、AppreciationDomainErrorが発生すること", async () => {
      // Arrange
      const invalidReceiverIDs = ReceiverIDs.from([
        DiscordUserID.from(MOCK_SENDER_ID), // 送信者と同じID
        DiscordUserID.from(MOCK_RECEIVER_ID_1)
      ]);

      // Act & Assert
      await expect(
        createAppreciationUseCase.execute(
          mockContext,
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
          mockContext,
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
          mockContext,
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
        DiscordUserID.from(MOCK_RECEIVER_ID_1)
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

      // Act
      const result = await createAppreciationUseCase.execute(
        mockContext,
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
        "456789012345678901",
        "567890123456789012",
        "678901234567890123",
        "789012345678901234",
        "890123456789012345",
        "901234567890123456"
      ];

      // 追加ユーザーをDBに挿入
      for (let i = 0; i < additionalUserIds.length; i++) {
        await insertToDatabase(schema.user, {
          discordUserId: additionalUserIds[i],
          discordUserName: `追加ユーザー${i + 1}`,
          discordAvatar: "avatar_url"
        });
      }

      const maxReceiverIDs = ReceiverIDs.from(
        additionalUserIds.map((id) => DiscordUserID.from(id))
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

      // Act
      const result = await createAppreciationUseCase.execute(
        mockContext,
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
    });
  });
});
