import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as schema from "../../../database/schema";
import {
  AppreciationNotFoundError,
  UnauthorizedUpdateError,
  UpdateAppreciationMessageUseCase,
  type UpdateAppreciationMessageUseCaseInterface
} from "../../../src/application/use-case/appreciation/UpdateAppreciationMessageUseCase";
import {
  Appreciation,
  AppreciationID,
  AppreciationMessage,
  PointPerReceiver,
  ReceiverIDs
} from "../../../src/domain/appreciation/Appreciation";
import { UserID } from "../../../src/domain/user/User";
import { AppreciationRepository } from "../../../src/infrastructure/repositories/AppreciationRepository";
import { CreatedAt } from "../../../src/utils/CreatedAt";
import { UUID } from "../../../src/utils/UUID";
import { expectOk } from "../../testing/utils/AssertResult";
import { getTypedSingleRecord } from "../../testing/utils/DatabaseAssertHelpers";
import {
  deleteFromDatabase,
  insertToDatabase
} from "../../testing/utils/GenericTableHelper";

// モック定数（有効なUUID形式）
const MOCK_SENDER_ID = UUID.new().value;
const MOCK_RECEIVER_ID_1 = UUID.new().value;
const MOCK_RECEIVER_ID_2 = UUID.new().value;
const MOCK_APPRECIATION_ID = UUID.new().value;
const MOCK_OTHER_USER_ID = UUID.new().value;
const MOCK_ORIGINAL_MESSAGE = "元のメッセージです";
const MOCK_NEW_MESSAGE = "更新されたメッセージです";
const MOCK_POINT_PER_RECEIVER = 10;

describe("UpdateAppreciationMessageUseCase Tests", () => {
  // 実際のリポジトリ（テスト用データベースに接続）
  const appreciationRepository = new AppreciationRepository();

  const updateAppreciationMessageUseCase: UpdateAppreciationMessageUseCaseInterface =
    new UpdateAppreciationMessageUseCase(appreciationRepository);

  // 共通のテストデータ
  let senderID: UserID;
  let receiverIDs: ReceiverIDs;
  let appreciationID: AppreciationID;
  let originalMessage: AppreciationMessage;
  let newMessage: AppreciationMessage;
  let pointPerReceiver: PointPerReceiver;
  let otherUserID: UserID;
  let testAppreciation: Appreciation;

  beforeEach(async () => {
    // データベースのクリア（外部キー制約の順序に注意）
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

    await insertToDatabase(schema.user, {
      id: MOCK_OTHER_USER_ID,
      discordId: "other_user_discord_id",
      discordUserName: "他のユーザー",
      discordAvatar: "avatar_url"
    });

    // テストデータの準備
    senderID = UserID.from(MOCK_SENDER_ID);
    receiverIDs = ReceiverIDs.from([
      UserID.from(MOCK_RECEIVER_ID_1),
      UserID.from(MOCK_RECEIVER_ID_2)
    ]);
    appreciationID = AppreciationID.from(MOCK_APPRECIATION_ID);
    originalMessage = AppreciationMessage.from(MOCK_ORIGINAL_MESSAGE);
    newMessage = AppreciationMessage.from(MOCK_NEW_MESSAGE);
    pointPerReceiver = PointPerReceiver.from(MOCK_POINT_PER_RECEIVER);
    otherUserID = UserID.from(MOCK_OTHER_USER_ID);

    // テスト用の感謝データを作成
    testAppreciation = Appreciation.reconstruct(
      appreciationID,
      senderID,
      receiverIDs,
      originalMessage,
      pointPerReceiver,
      CreatedAt.new()
    );

    // 感謝データをデータベースに保存
    await insertToDatabase(schema.appreciations, {
      id: MOCK_APPRECIATION_ID,
      senderId: MOCK_SENDER_ID,
      message: MOCK_ORIGINAL_MESSAGE,
      pointPerReceiver: MOCK_POINT_PER_RECEIVER,
      createdAt: testAppreciation.createdAt.value
    });

    // 受信者データをデータベースに保存
    await insertToDatabase(schema.appreciationReceivers, {
      id: UUID.new().value,
      appreciationId: MOCK_APPRECIATION_ID,
      receiverId: MOCK_RECEIVER_ID_1
    });

    await insertToDatabase(schema.appreciationReceivers, {
      id: UUID.new().value,
      appreciationId: MOCK_APPRECIATION_ID,
      receiverId: MOCK_RECEIVER_ID_2
    });
  });

  afterEach(async () => {
    // データベースのクリア（外部キー制約の順序に注意）
    await deleteFromDatabase(schema.appreciationReceivers);
    await deleteFromDatabase(schema.appreciations);
    await deleteFromDatabase(schema.user);
  });

  describe("execute", () => {
    /**
     * 正常ケース：感謝メッセージの更新が正常に行われることのテストケース
     *
     * @description 有効な感謝ID、送信者ID、新しいメッセージで感謝メッセージが正常に更新されることを確認
     *
     * Arrange
     * - 既存の感謝データをデータベースに保存
     * - 有効な感謝ID、送信者ID、新しいメッセージを準備
     *
     * Act
     * - UpdateAppreciationMessageUseCaseのexecuteメソッド実行
     *
     * Assert
     * - 正常完了（void）の確認
     * - データベースのメッセージが更新されていることを確認
     */
    it("正常ケース：感謝メッセージの更新が正常に行われること", async () => {
      // Act
      const result = await updateAppreciationMessageUseCase.execute(
        appreciationID,
        senderID,
        newMessage
      );

      // Assert
      expectOk(result);

      // データベースから更新された感謝を取得して確認
      const updatedAppreciationRecord = await getTypedSingleRecord(
        schema.appreciations
      );
      expect(updatedAppreciationRecord).not.toBeNull();
      expect(updatedAppreciationRecord!.message).toBe(MOCK_NEW_MESSAGE);
      expect(updatedAppreciationRecord!.id).toBe(MOCK_APPRECIATION_ID);
      expect(updatedAppreciationRecord!.senderId).toBe(MOCK_SENDER_ID);
    });

    /**
     * 異常ケース：存在しない感謝IDでの更新エラーテストケース
     *
     * @description 存在しない感謝IDを指定した場合、AppreciationNotFoundErrorが発生することを確認
     */
    it("異常ケース：存在しない感謝IDを指定した場合、AppreciationNotFoundErrorが発生すること", async () => {
      // Arrange
      const nonExistentAppreciationID = AppreciationID.from(UUID.new().value);

      // Act & Assert
      const result = await updateAppreciationMessageUseCase.execute(
        nonExistentAppreciationID,
        senderID,
        newMessage
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(AppreciationNotFoundError);
        expect(result.error.message).toContain(
          `Appreciation not found: AppreciationID(value: ${nonExistentAppreciationID.value.value})`
        );
      }
    });

    /**
     * 異常ケース：送信者以外のユーザーが更新を試行するエラーテストケース
     *
     * @description 感謝の送信者以外のユーザーが更新を試行した場合、UnauthorizedUpdateErrorが発生することを確認
     */
    it("異常ケース：送信者以外のユーザーが更新を試行した場合、UnauthorizedUpdateErrorが発生すること", async () => {
      // Act & Assert
      const result = await updateAppreciationMessageUseCase.execute(
        appreciationID,
        otherUserID,
        newMessage
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(UnauthorizedUpdateError);
        expect(result.error.message).toContain(
          `User ${otherUserID.value.value} is not authorized to update appreciation ${appreciationID.value.value}`
        );
      }
    });

    /**
     * 正常ケース：同じメッセージでの更新が正常に行われることのテストケース
     *
     * @description 既存のメッセージと同じ内容で更新した場合でも正常に処理されることを確認
     */
    it("正常ケース：同じメッセージでの更新が正常に行われること", async () => {
      // Act
      const result = await updateAppreciationMessageUseCase.execute(
        appreciationID,
        senderID,
        originalMessage
      );

      // Assert
      expectOk(result);

      // データベースから感謝を取得して確認
      const appreciationRecord = await getTypedSingleRecord(
        schema.appreciations
      );
      expect(appreciationRecord).not.toBeNull();
      expect(appreciationRecord!.message).toBe(MOCK_ORIGINAL_MESSAGE);
    });

    /**
     * 正常ケース：最大文字数のメッセージでの更新テストケース
     *
     * @description 最大文字数（200文字）のメッセージで更新が正常に行われることを確認
     */
    it("正常ケース：最大文字数のメッセージでの更新が正常に行われること", async () => {
      // Arrange
      const maxLengthMessage = AppreciationMessage.from("あ".repeat(200));

      // Act
      const result = await updateAppreciationMessageUseCase.execute(
        appreciationID,
        senderID,
        maxLengthMessage
      );

      // Assert
      expectOk(result);

      // データベースから更新された感謝を取得して確認
      const updatedAppreciationRecord = await getTypedSingleRecord(
        schema.appreciations
      );
      expect(updatedAppreciationRecord).not.toBeNull();
      expect(updatedAppreciationRecord!.message).toBe("あ".repeat(200));
    });
  });
});
