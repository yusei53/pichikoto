import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as schema from "../../../database/schema";
import {
  Appreciation,
  AppreciationID,
  AppreciationMessage,
  PointPerReceiver,
  ReceiverIDs
} from "../../../src/domain/appreciation/Appreciation";
import { DiscordUserID } from "../../../src/domain/user/User";
import { AppreciationRepository } from "../../../src/infrastructure/repositories/AppreciationRepository";
import { CreatedAt } from "../../../src/utils/CreatedAt";
import { UUID } from "../../../src/utils/UUID";
import {
  assertEqualAppreciationReceiversTable,
  assertEqualAppreciationTable
} from "../../testing/table_assert/AssertEqualAppreciationTable";
import {
  createAppreciationTableFixture,
  createMultipleAppreciationReceiversFixture
} from "../../testing/table_fixture/AppreciationTableFixture";
import { createUserTableFixture } from "../../testing/table_fixture/UserTableFixture";
import {
  getTypedMultipleRecords,
  getTypedSingleRecord
} from "../../testing/utils/DatabaseAssertHelpers";
import {
  deleteFromDatabase,
  insertToDatabase
} from "../../testing/utils/GenericTableHelper";

describe("AppreciationRepository Tests", () => {
  const appreciationRepository = new AppreciationRepository();

  // 各テスト前にデータベースをクリーンアップ
  beforeEach(async () => {
    await deleteFromDatabase(schema.appreciationReceivers);
    await deleteFromDatabase(schema.appreciations);
    await deleteFromDatabase(schema.user);
  });

  describe("store", () => {
    afterEach(async () => {
      await deleteFromDatabase(schema.appreciationReceivers);
      await deleteFromDatabase(schema.appreciations);
      await deleteFromDatabase(schema.user);
    });

    it("感謝を保存できること（単一受信者）", async () => {
      // arrange
      const senderUser = createUserTableFixture();
      const receiverUser = createUserTableFixture();
      await insertToDatabase(schema.user, senderUser);
      await insertToDatabase(schema.user, receiverUser);

      const appreciation = Appreciation.reconstruct(
        AppreciationID.from(UUID.new().value),
        DiscordUserID.from(senderUser.discordUserId),
        ReceiverIDs.from([DiscordUserID.from(receiverUser.discordUserId)]),
        AppreciationMessage.from("いつもお疲れ様です！"),
        PointPerReceiver.from(15),
        CreatedAt.from(new Date())
      );

      // act
      await appreciationRepository.store(appreciation);

      // assert
      const actualAppreciationRecord = await getTypedSingleRecord(
        schema.appreciations
      );
      assertEqualAppreciationTable(appreciation, actualAppreciationRecord!);

      const actualReceiverRecords = await getTypedMultipleRecords(
        schema.appreciationReceivers
      );
      assertEqualAppreciationReceiversTable(
        appreciation,
        actualReceiverRecords
      );
    });

    it("感謝を保存できること（複数受信者）", async () => {
      // arrange
      const senderUser = createUserTableFixture();
      const receiverUser1 = createUserTableFixture();
      const receiverUser2 = createUserTableFixture();
      const receiverUser3 = createUserTableFixture();

      await insertToDatabase(schema.user, senderUser);
      await insertToDatabase(schema.user, receiverUser1);
      await insertToDatabase(schema.user, receiverUser2);
      await insertToDatabase(schema.user, receiverUser3);

      const appreciation = Appreciation.reconstruct(
        AppreciationID.from(UUID.new().value),
        DiscordUserID.from(senderUser.discordUserId),
        ReceiverIDs.from([
          DiscordUserID.from(receiverUser1.discordUserId),
          DiscordUserID.from(receiverUser2.discordUserId),
          DiscordUserID.from(receiverUser3.discordUserId)
        ]),
        AppreciationMessage.from("みなさんいつもありがとうございます！"),
        PointPerReceiver.from(20),
        CreatedAt.from(new Date())
      );

      // act
      await appreciationRepository.store(appreciation);

      // assert
      const actualAppreciationRecord = await getTypedSingleRecord(
        schema.appreciations
      );
      assertEqualAppreciationTable(appreciation, actualAppreciationRecord!);

      const actualReceiverRecords = await getTypedMultipleRecords(
        schema.appreciationReceivers
      );
      expect(actualReceiverRecords).toHaveLength(3);
      assertEqualAppreciationReceiversTable(
        appreciation,
        actualReceiverRecords
      );
    });
  });

  describe("findBy", () => {
    const setupAppreciation = async () => {
      // ユーザーを作成
      const senderUser = createUserTableFixture();
      const receiverUser1 = createUserTableFixture();
      const receiverUser2 = createUserTableFixture();

      await insertToDatabase(schema.user, senderUser);
      await insertToDatabase(schema.user, receiverUser1);
      await insertToDatabase(schema.user, receiverUser2);

      // 感謝データを作成
      const appreciationRecord = createAppreciationTableFixture();
      appreciationRecord.senderId = senderUser.discordUserId;
      await insertToDatabase(schema.appreciations, appreciationRecord);

      // 受信者データを作成
      const receiverRecords = createMultipleAppreciationReceiversFixture(
        appreciationRecord.id,
        [receiverUser1.discordUserId, receiverUser2.discordUserId]
      );
      for (const receiverRecord of receiverRecords) {
        await insertToDatabase(schema.appreciationReceivers, receiverRecord);
      }

      return {
        appreciationRecord,
        senderUser,
        receiverUsers: [receiverUser1, receiverUser2]
      };
    };

    afterEach(async () => {
      await deleteFromDatabase(schema.appreciationReceivers);
      await deleteFromDatabase(schema.appreciations);
      await deleteFromDatabase(schema.user);
    });

    it("存在する感謝を取得できること", async () => {
      // arrange
      const { appreciationRecord, senderUser, receiverUsers } =
        await setupAppreciation();

      const expectedAppreciation = Appreciation.reconstruct(
        AppreciationID.from(appreciationRecord.id),
        DiscordUserID.from(senderUser.discordUserId),
        ReceiverIDs.from(
          receiverUsers.map((user) => DiscordUserID.from(user.discordUserId))
        ),
        AppreciationMessage.from(appreciationRecord.message),
        PointPerReceiver.from(appreciationRecord.pointPerReceiver),
        CreatedAt.from(appreciationRecord.createdAt)
      );

      // act
      const actual = await appreciationRepository.findBy(
        AppreciationID.from(appreciationRecord.id)
      );

      // assert
      expect(actual).toEqual(expectedAppreciation);
    });

    it("存在しない感謝の場合はnullを返すこと", async () => {
      // arrange
      const nonExistentAppreciationID = AppreciationID.from(UUID.new().value);

      // act
      const actual = await appreciationRepository.findBy(
        nonExistentAppreciationID
      );

      // assert
      expect(actual).toBeNull();
    });
  });

  describe("delete", () => {
    const setupAppreciation = async () => {
      // ユーザーを作成
      const senderUser = createUserTableFixture();
      const receiverUser1 = createUserTableFixture();
      const receiverUser2 = createUserTableFixture();

      await insertToDatabase(schema.user, senderUser);
      await insertToDatabase(schema.user, receiverUser1);
      await insertToDatabase(schema.user, receiverUser2);

      // 感謝データを作成
      const appreciationRecord = createAppreciationTableFixture();
      appreciationRecord.senderId = senderUser.discordUserId;
      await insertToDatabase(schema.appreciations, appreciationRecord);

      // 受信者データを作成
      const receiverRecords = createMultipleAppreciationReceiversFixture(
        appreciationRecord.id,
        [receiverUser1.discordUserId, receiverUser2.discordUserId]
      );
      for (const receiverRecord of receiverRecords) {
        await insertToDatabase(schema.appreciationReceivers, receiverRecord);
      }

      return {
        appreciationRecord,
        senderUser,
        receiverUsers: [receiverUser1, receiverUser2]
      };
    };

    afterEach(async () => {
      await deleteFromDatabase(schema.appreciationReceivers);
      await deleteFromDatabase(schema.appreciations);
      await deleteFromDatabase(schema.user);
    });

    it("感謝を削除できること（appreciationReceiversも自動削除される）", async () => {
      // arrange
      const { appreciationRecord } = await setupAppreciation();

      // 削除前にデータが存在することを確認
      const appreciationBeforeDelete = await appreciationRepository.findBy(
        AppreciationID.from(appreciationRecord.id)
      );
      expect(appreciationBeforeDelete).not.toBeNull();

      const receiversBeforeDelete = await getTypedMultipleRecords(
        schema.appreciationReceivers
      );
      const relatedReceivers = receiversBeforeDelete.filter(
        (receiver) => receiver.appreciationId === appreciationRecord.id
      );
      expect(relatedReceivers).toHaveLength(2);

      // act
      await appreciationRepository.delete(
        AppreciationID.from(appreciationRecord.id)
      );

      // assert
      // 感謝が削除されていることを確認
      const appreciationAfterDelete = await getTypedSingleRecord(
        schema.appreciations
      );
      expect(appreciationAfterDelete).toBeNull();

      // appreciationReceiversも自動削除されていることを確認
      const receiversAfterDelete = await getTypedMultipleRecords(
        schema.appreciationReceivers
      );
      expect(receiversAfterDelete).toHaveLength(0);
    });

    it("存在しない感謝IDで削除してもエラーが発生しないこと", async () => {
      // arrange
      const nonExistentAppreciationID = AppreciationID.from(UUID.new().value);

      // act & assert
      // 存在しないIDでもエラーが発生しないことを確認
      await expect(
        appreciationRepository.delete(nonExistentAppreciationID)
      ).resolves.not.toThrow();
    });

    it("複数の感謝がある場合、指定した感謝のみが削除されること", async () => {
      // arrange
      const { appreciationRecord } = await setupAppreciation();

      // 別の感謝を作成
      const senderUser2 = createUserTableFixture();
      const receiverUser3 = createUserTableFixture();
      await insertToDatabase(schema.user, senderUser2);
      await insertToDatabase(schema.user, receiverUser3);

      const anotherAppreciationRecord = createAppreciationTableFixture();
      anotherAppreciationRecord.senderId = senderUser2.discordUserId;
      await insertToDatabase(schema.appreciations, anotherAppreciationRecord);

      const anotherReceiverRecord = createMultipleAppreciationReceiversFixture(
        anotherAppreciationRecord.id,
        [receiverUser3.discordUserId]
      )[0];
      await insertToDatabase(
        schema.appreciationReceivers,
        anotherReceiverRecord
      );

      // act
      await appreciationRepository.delete(
        AppreciationID.from(appreciationRecord.id)
      );

      // assert
      // 指定した感謝が削除されていることを確認
      const deletedAppreciation = await appreciationRepository.findBy(
        AppreciationID.from(appreciationRecord.id)
      );
      expect(deletedAppreciation).toBeNull();

      const remainingReceivers = await getTypedMultipleRecords(
        schema.appreciationReceivers
      );

      const deletedReceivers = remainingReceivers.filter(
        (receiver) => receiver.appreciationId === appreciationRecord.id
      );
      expect(deletedReceivers).toHaveLength(0);

      // 別の感謝は残っていることを確認
      const remainingAppreciation = await appreciationRepository.findBy(
        AppreciationID.from(anotherAppreciationRecord.id)
      );
      expect(remainingAppreciation).not.toBeNull();

      const remainingRelatedReceivers = remainingReceivers.filter(
        (receiver) => receiver.appreciationId === anotherAppreciationRecord.id
      );
      expect(remainingRelatedReceivers).toHaveLength(1);
    });
  });

  describe("calculateWeeklyPointConsumption", () => {
    const setupUsersAndAppreciations = async () => {
      // ユーザーを作成
      const senderUser = createUserTableFixture();
      const otherSenderUser = createUserTableFixture();
      const receiverUser1 = createUserTableFixture();
      const receiverUser2 = createUserTableFixture();
      const receiverUser3 = createUserTableFixture();

      await insertToDatabase(schema.user, senderUser);
      await insertToDatabase(schema.user, otherSenderUser);
      await insertToDatabase(schema.user, receiverUser1);
      await insertToDatabase(schema.user, receiverUser2);
      await insertToDatabase(schema.user, receiverUser3);

      return {
        senderUser,
        otherSenderUser,
        receiverUsers: [receiverUser1, receiverUser2, receiverUser3]
      };
    };

    afterEach(async () => {
      await deleteFromDatabase(schema.appreciationReceivers);
      await deleteFromDatabase(schema.appreciations);
      await deleteFromDatabase(schema.user);
    });

    it("指定期間内にポイント消費がない場合は0を返すこと", async () => {
      // arrange
      const { senderUser } = await setupUsersAndAppreciations();
      const weekStartDate = "2024-01-01T00:00:00.000Z";
      const weekEndDate = "2024-01-07T23:59:59.999Z";

      // act
      const result =
        await appreciationRepository.calculateWeeklyPointConsumption(
          DiscordUserID.from(senderUser.discordUserId),
          weekStartDate,
          weekEndDate
        );

      // assert
      expect(result).toBe(0);
    });

    it("指定期間内に単一の感謝がある場合、正しいポイント消費量を返すこと", async () => {
      // arrange
      const { senderUser, receiverUsers } = await setupUsersAndAppreciations();
      const weekStartDate = "2024-01-01T00:00:00.000Z";
      const weekEndDate = "2024-01-07T23:59:59.999Z";

      // 期間内の感謝を作成（単一受信者、10ポイント）
      const appreciationRecord = createAppreciationTableFixture();
      appreciationRecord.senderId = senderUser.discordUserId;
      appreciationRecord.pointPerReceiver = 10;
      appreciationRecord.createdAt = new Date("2024-01-03T12:00:00.000Z");
      await insertToDatabase(schema.appreciations, appreciationRecord);

      const receiverRecord = createMultipleAppreciationReceiversFixture(
        appreciationRecord.id,
        [receiverUsers[0].discordUserId]
      )[0];
      await insertToDatabase(schema.appreciationReceivers, receiverRecord);

      // act
      const result =
        await appreciationRepository.calculateWeeklyPointConsumption(
          DiscordUserID.from(senderUser.discordUserId),
          weekStartDate,
          weekEndDate
        );

      // assert
      expect(result).toBe(10);
    });

    it("指定期間内に複数の感謝がある場合、正しいポイント消費量を返すこと", async () => {
      // arrange
      const { senderUser, receiverUsers } = await setupUsersAndAppreciations();
      const weekStartDate = "2024-01-01T00:00:00.000Z";
      const weekEndDate = "2024-01-07T23:59:59.999Z";

      // 1つ目の感謝（2受信者、各15ポイント = 30ポイント）
      const appreciation1 = createAppreciationTableFixture();
      appreciation1.senderId = senderUser.discordUserId;
      appreciation1.pointPerReceiver = 15;
      appreciation1.createdAt = new Date("2024-01-02T10:00:00.000Z");
      await insertToDatabase(schema.appreciations, appreciation1);

      const receivers1 = createMultipleAppreciationReceiversFixture(
        appreciation1.id,
        [receiverUsers[0].discordUserId, receiverUsers[1].discordUserId]
      );
      for (const receiver of receivers1) {
        await insertToDatabase(schema.appreciationReceivers, receiver);
      }

      // 2つ目の感謝（1受信者、20ポイント）
      const appreciation2 = createAppreciationTableFixture();
      appreciation2.senderId = senderUser.discordUserId;
      appreciation2.pointPerReceiver = 20;
      appreciation2.createdAt = new Date("2024-01-05T14:00:00.000Z");
      await insertToDatabase(schema.appreciations, appreciation2);

      const receivers2 = createMultipleAppreciationReceiversFixture(
        appreciation2.id,
        [receiverUsers[2].discordUserId]
      );
      for (const receiver of receivers2) {
        await insertToDatabase(schema.appreciationReceivers, receiver);
      }

      // act
      const result =
        await appreciationRepository.calculateWeeklyPointConsumption(
          DiscordUserID.from(senderUser.discordUserId),
          weekStartDate,
          weekEndDate
        );

      // assert
      expect(result).toBe(50); // 30 + 20 = 50
    });

    it("指定期間外の感謝は計算に含まれないこと", async () => {
      // arrange
      const { senderUser, receiverUsers } = await setupUsersAndAppreciations();
      const weekStartDate = "2024-01-01T00:00:00.000Z";
      const weekEndDate = "2024-01-07T23:59:59.999Z";

      // 期間内の感謝
      const appreciationInRange = createAppreciationTableFixture();
      appreciationInRange.senderId = senderUser.discordUserId;
      appreciationInRange.pointPerReceiver = 10;
      appreciationInRange.createdAt = new Date("2024-01-03T12:00:00.000Z");
      await insertToDatabase(schema.appreciations, appreciationInRange);

      const receiverInRange = createMultipleAppreciationReceiversFixture(
        appreciationInRange.id,
        [receiverUsers[0].discordUserId]
      )[0];
      await insertToDatabase(schema.appreciationReceivers, receiverInRange);

      // 期間前の感謝
      const appreciationBefore = createAppreciationTableFixture();
      appreciationBefore.senderId = senderUser.discordUserId;
      appreciationBefore.pointPerReceiver = 25;
      appreciationBefore.createdAt = new Date("2023-12-31T23:59:59.999Z");
      await insertToDatabase(schema.appreciations, appreciationBefore);

      const receiverBefore = createMultipleAppreciationReceiversFixture(
        appreciationBefore.id,
        [receiverUsers[1].discordUserId]
      )[0];
      await insertToDatabase(schema.appreciationReceivers, receiverBefore);

      // 期間後の感謝
      const appreciationAfter = createAppreciationTableFixture();
      appreciationAfter.senderId = senderUser.discordUserId;
      appreciationAfter.pointPerReceiver = 30;
      appreciationAfter.createdAt = new Date("2024-01-08T00:00:00.000Z");
      await insertToDatabase(schema.appreciations, appreciationAfter);

      const receiverAfter = createMultipleAppreciationReceiversFixture(
        appreciationAfter.id,
        [receiverUsers[2].discordUserId]
      )[0];
      await insertToDatabase(schema.appreciationReceivers, receiverAfter);

      // act
      const result =
        await appreciationRepository.calculateWeeklyPointConsumption(
          DiscordUserID.from(senderUser.discordUserId),
          weekStartDate,
          weekEndDate
        );

      // assert
      expect(result).toBe(10); // 期間内の感謝のみ
    });

    it("他のユーザーの感謝は計算に含まれないこと", async () => {
      // arrange
      const { senderUser, otherSenderUser, receiverUsers } =
        await setupUsersAndAppreciations();
      const weekStartDate = "2024-01-01T00:00:00.000Z";
      const weekEndDate = "2024-01-07T23:59:59.999Z";

      // 対象ユーザーの感謝
      const targetUserAppreciation = createAppreciationTableFixture();
      targetUserAppreciation.senderId = senderUser.discordUserId;
      targetUserAppreciation.pointPerReceiver = 15;
      targetUserAppreciation.createdAt = new Date("2024-01-03T12:00:00.000Z");
      await insertToDatabase(schema.appreciations, targetUserAppreciation);

      const targetUserReceiver = createMultipleAppreciationReceiversFixture(
        targetUserAppreciation.id,
        [receiverUsers[0].discordUserId]
      )[0];
      await insertToDatabase(schema.appreciationReceivers, targetUserReceiver);

      // 他のユーザーの感謝
      const otherUserAppreciation = createAppreciationTableFixture();
      otherUserAppreciation.senderId = otherSenderUser.discordUserId;
      otherUserAppreciation.pointPerReceiver = 50;
      otherUserAppreciation.createdAt = new Date("2024-01-04T12:00:00.000Z");
      await insertToDatabase(schema.appreciations, otherUserAppreciation);

      const otherUserReceiver = createMultipleAppreciationReceiversFixture(
        otherUserAppreciation.id,
        [receiverUsers[1].discordUserId, receiverUsers[2].discordUserId]
      );
      for (const receiver of otherUserReceiver) {
        await insertToDatabase(schema.appreciationReceivers, receiver);
      }

      // act
      const result =
        await appreciationRepository.calculateWeeklyPointConsumption(
          DiscordUserID.from(senderUser.discordUserId),
          weekStartDate,
          weekEndDate
        );

      // assert
      expect(result).toBe(15); // 対象ユーザーの感謝のみ
    });

    it("期間の境界値で正しく動作すること", async () => {
      // arrange
      const { senderUser, receiverUsers } = await setupUsersAndAppreciations();
      const weekStartDate = "2024-01-01T00:00:00.000Z";
      const weekEndDate = "2024-01-07T23:59:59.999Z";

      // 期間開始時刻ちょうどの感謝
      const appreciationAtStart = createAppreciationTableFixture();
      appreciationAtStart.senderId = senderUser.discordUserId;
      appreciationAtStart.pointPerReceiver = 10;
      appreciationAtStart.createdAt = new Date("2024-01-01T00:00:00.000Z");
      await insertToDatabase(schema.appreciations, appreciationAtStart);

      const receiverAtStart = createMultipleAppreciationReceiversFixture(
        appreciationAtStart.id,
        [receiverUsers[0].discordUserId]
      )[0];
      await insertToDatabase(schema.appreciationReceivers, receiverAtStart);

      // 期間終了時刻ちょうどの感謝
      const appreciationAtEnd = createAppreciationTableFixture();
      appreciationAtEnd.senderId = senderUser.discordUserId;
      appreciationAtEnd.pointPerReceiver = 20;
      appreciationAtEnd.createdAt = new Date("2024-01-07T23:59:59.999Z");
      await insertToDatabase(schema.appreciations, appreciationAtEnd);

      const receiverAtEnd = createMultipleAppreciationReceiversFixture(
        appreciationAtEnd.id,
        [receiverUsers[1].discordUserId]
      )[0];
      await insertToDatabase(schema.appreciationReceivers, receiverAtEnd);

      // act
      const result =
        await appreciationRepository.calculateWeeklyPointConsumption(
          DiscordUserID.from(senderUser.discordUserId),
          weekStartDate,
          weekEndDate
        );

      // assert
      expect(result).toBe(30); // 10 + 20 = 30
    });
  });
});
