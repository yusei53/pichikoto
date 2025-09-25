import { afterEach, describe, expect, it } from "vitest";
import * as schema from "../../../database/schema";
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
  assertMultipleRecords,
  assertSingleRecord
} from "../../testing/utils/DatabaseAssertHelpers";
import {
  deleteFromDatabase,
  insertToDatabase
} from "../../testing/utils/GenericTableHelper";

describe("AppreciationRepository Tests", () => {
  const appreciationRepository = new AppreciationRepository();

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
        UserID.from(senderUser.id),
        ReceiverIDs.from([UserID.from(receiverUser.id)]),
        AppreciationMessage.from("いつもお疲れ様です！"),
        PointPerReceiver.from(15),
        CreatedAt.from(new Date())
      );

      // act
      await appreciationRepository.store(appreciation);

      // assert
      await assertSingleRecord(
        schema.appreciations,
        assertEqualAppreciationTable,
        appreciation
      );

      await assertMultipleRecords(
        schema.appreciationReceivers,
        assertEqualAppreciationReceiversTable,
        appreciation
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
        UserID.from(senderUser.id),
        ReceiverIDs.from([
          UserID.from(receiverUser1.id),
          UserID.from(receiverUser2.id),
          UserID.from(receiverUser3.id)
        ]),
        AppreciationMessage.from("みなさんいつもありがとうございます！"),
        PointPerReceiver.from(20),
        CreatedAt.from(new Date())
      );

      // act
      await appreciationRepository.store(appreciation);

      // assert
      await assertSingleRecord(
        schema.appreciations,
        assertEqualAppreciationTable,
        appreciation
      );

      await assertMultipleRecords(
        schema.appreciationReceivers,
        (expected, actual) => {
          expect(actual).toHaveLength(3);
          assertEqualAppreciationReceiversTable(expected, actual);
        },
        appreciation
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
      appreciationRecord.senderId = senderUser.id;
      await insertToDatabase(schema.appreciations, appreciationRecord);

      // 受信者データを作成
      const receiverRecords = createMultipleAppreciationReceiversFixture(
        appreciationRecord.id,
        [receiverUser1.id, receiverUser2.id]
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
        UserID.from(senderUser.id),
        ReceiverIDs.from(receiverUsers.map((user) => UserID.from(user.id))),
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
});
