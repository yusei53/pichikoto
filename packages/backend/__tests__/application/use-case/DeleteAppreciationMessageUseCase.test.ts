import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as schema from "../../../database/schema";
import {
  AppreciationNotFoundError,
  DeleteAppreciationMessageUseCase,
  type DeleteAppreciationMessageUseCaseInterface,
  UnauthorizedDeleteError
} from "../../../src/application/use-case/appreciation/DeleteAppreciationMessageUseCase";
import {
  AppreciationID,
  AppreciationMessage,
  PointPerReceiver
} from "../../../src/domain/appreciation/Appreciation";
import { UserID } from "../../../src/domain/user/User";
import { AppreciationRepository } from "../../../src/infrastructure/repositories/AppreciationRepository";
import { CreatedAt } from "../../../src/utils/CreatedAt";
import { UUID } from "../../../src/utils/UUID";
import { expectOk } from "../../testing/utils/AssertResult";
import { getTypedMultipleRecords } from "../../testing/utils/DatabaseAssertHelpers";
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
const MOCK_MESSAGE = "テストメッセージです";
const MOCK_POINT_PER_RECEIVER = 10;

describe("DeleteAppreciationMessageUseCase Tests", () => {
  // 実際のリポジトリ（テスト用データベースに接続）
  const appreciationRepository = new AppreciationRepository();

  const deleteAppreciationMessageUseCase: DeleteAppreciationMessageUseCaseInterface =
    new DeleteAppreciationMessageUseCase(appreciationRepository);

  // 共通のテストデータ
  let senderID: UserID;
  let appreciationID: AppreciationID;
  let message: AppreciationMessage;
  let pointPerReceiver: PointPerReceiver;
  let createdAt: CreatedAt;

  beforeEach(async () => {
    // テストデータの初期化
    senderID = UserID.from(MOCK_SENDER_ID);
    appreciationID = AppreciationID.from(MOCK_APPRECIATION_ID);
    message = AppreciationMessage.from(MOCK_MESSAGE);
    pointPerReceiver = PointPerReceiver.from(MOCK_POINT_PER_RECEIVER);
    createdAt = CreatedAt.new();

    // テスト用のユーザーデータを挿入
    await insertToDatabase(schema.user, {
      id: senderID.value.value,
      discordId: "123456789",
      discordUserName: "テスト送信者",
      discordAvatar: "avatar_url"
    });

    await insertToDatabase(schema.user, {
      id: MOCK_RECEIVER_ID_1,
      discordId: "987654321",
      discordUserName: "テスト受信者1",
      discordAvatar: "avatar_url1"
    });

    await insertToDatabase(schema.user, {
      id: MOCK_RECEIVER_ID_2,
      discordId: "111222333",
      discordUserName: "テスト受信者2",
      discordAvatar: "avatar_url2"
    });

    await insertToDatabase(schema.user, {
      id: MOCK_OTHER_USER_ID,
      discordId: "444555666",
      discordUserName: "他のユーザー",
      discordAvatar: "avatar_url3"
    });
  });

  afterEach(async () => {
    // テストデータのクリーンアップ
    await deleteFromDatabase(schema.appreciationReceivers);
    await deleteFromDatabase(schema.appreciations);
    await deleteFromDatabase(schema.user);
  });

  describe("正常系", () => {
    it("送信者が自分の感謝メッセージを削除できる", async () => {
      // テスト用の感謝データを挿入
      await insertToDatabase(schema.appreciations, {
        id: appreciationID.value.value,
        senderId: senderID.value.value,
        message: message.value,
        pointPerReceiver: pointPerReceiver.value,
        createdAt: new Date(createdAt.value)
      });

      await insertToDatabase(schema.appreciationReceivers, {
        id: UUID.new().value,
        appreciationId: appreciationID.value.value,
        receiverId: MOCK_RECEIVER_ID_1,
        createdAt: new Date(createdAt.value)
      });

      await insertToDatabase(schema.appreciationReceivers, {
        id: UUID.new().value,
        appreciationId: appreciationID.value.value,
        receiverId: MOCK_RECEIVER_ID_2,
        createdAt: new Date(createdAt.value)
      });

      // 削除実行
      const result = await deleteAppreciationMessageUseCase.execute(
        appreciationID,
        senderID
      );

      // 結果確認
      expectOk(result);

      // データベースから削除されていることを確認
      const deletedAppreciation =
        await appreciationRepository.findBy(appreciationID);
      expect(deletedAppreciation).toBeNull();
    });
  });

  describe("異常系", () => {
    it("存在しない感謝IDで削除しようとした場合、AppreciationNotFoundErrorが返される", async () => {
      const nonExistentAppreciationID = AppreciationID.from(UUID.new().value);

      const result = await deleteAppreciationMessageUseCase.execute(
        nonExistentAppreciationID,
        senderID
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(AppreciationNotFoundError);
        expect(result.error.message).toContain(
          `Appreciation not found: AppreciationID(value: ${nonExistentAppreciationID.value.value})`
        );
      }
    });

    it("他のユーザーの感謝メッセージを削除しようとした場合、UnauthorizedDeleteErrorが返される", async () => {
      // 他のユーザーが送信した感謝データを挿入
      await insertToDatabase(schema.appreciations, {
        id: appreciationID.value.value,
        senderId: MOCK_OTHER_USER_ID, // 他のユーザーが送信者
        message: message.value,
        pointPerReceiver: pointPerReceiver.value,
        createdAt: new Date(createdAt.value)
      });

      await insertToDatabase(schema.appreciationReceivers, {
        id: UUID.new().value,
        appreciationId: appreciationID.value.value,
        receiverId: MOCK_RECEIVER_ID_1,
        createdAt: new Date(createdAt.value)
      });

      // 送信者ではないユーザーが削除を試行
      const result = await deleteAppreciationMessageUseCase.execute(
        appreciationID,
        senderID // 送信者ではないユーザー
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(UnauthorizedDeleteError);
        expect(result.error.message).toContain(
          `User ${senderID.value.value} is not authorized to delete appreciation ${appreciationID.value.value}`
        );
      }

      // データが削除されていないことを確認
      const appreciation = await appreciationRepository.findBy(appreciationID);
      expect(appreciation).not.toBeNull();
    });
  });

  describe("データベース整合性", () => {
    it("感謝レコード削除時にappreciationReceiversも自動削除される", async () => {
      // テスト用の感謝データを挿入
      await insertToDatabase(schema.appreciations, {
        id: appreciationID.value.value,
        senderId: senderID.value.value,
        message: message.value,
        pointPerReceiver: pointPerReceiver.value,
        createdAt: new Date(createdAt.value)
      });

      const receiverRecord1 = {
        id: UUID.new().value,
        appreciationId: appreciationID.value.value,
        receiverId: MOCK_RECEIVER_ID_1,
        createdAt: new Date(createdAt.value)
      };

      const receiverRecord2 = {
        id: UUID.new().value,
        appreciationId: appreciationID.value.value,
        receiverId: MOCK_RECEIVER_ID_2,
        createdAt: new Date(createdAt.value)
      };

      await insertToDatabase(schema.appreciationReceivers, receiverRecord1);
      await insertToDatabase(schema.appreciationReceivers, receiverRecord2);

      // 削除実行
      const result = await deleteAppreciationMessageUseCase.execute(
        appreciationID,
        senderID
      );

      // 結果確認
      expectOk(result);

      // appreciationReceiversも削除されていることを確認
      const remainingReceivers = await getTypedMultipleRecords(
        schema.appreciationReceivers
      );
      const filteredReceivers = remainingReceivers.filter(
        (receiver) => receiver.appreciationId === appreciationID.value.value
      );
      expect(filteredReceivers).toHaveLength(0);
    });
  });
});
