import { beforeEach, describe, expect, it } from "vitest";
import * as schema from "../../database/schema";
import { AppreciationsQueryService } from "../../src/query-service/AppreciationsQueryService";
import {
  createAppreciationTableFixture,
  createMultipleAppreciationReceiversFixture
} from "../testing/table_fixture/AppreciationTableFixture";
import { createUserTableFixture } from "../testing/table_fixture/UserTableFixture";
import {
  deleteFromDatabase,
  insertToDatabase
} from "../testing/utils/GenericTableHelper";

describe("AppreciationsQueryService", () => {
  const queryService = new AppreciationsQueryService();

  beforeEach(async () => {
    await deleteFromDatabase(schema.appreciationReceivers);
    await deleteFromDatabase(schema.appreciations);
    await deleteFromDatabase(schema.user);
  });

  it("全ての感謝投稿を送信者・受信者のアバター情報と共に取得できる", async () => {
    // Arrange
    const senderUser = {
      ...createUserTableFixture(),
      discordUserName: "sender_user",
      discordAvatar: "sender_avatar_url"
    };
    await insertToDatabase(schema.user, senderUser);

    const receiverUser1 = {
      ...createUserTableFixture(),
      discordUserName: "receiver1_user",
      discordAvatar: "receiver1_avatar_url"
    };
    await insertToDatabase(schema.user, receiverUser1);

    const receiverUser2 = {
      ...createUserTableFixture(),
      discordUserName: "receiver2_user",
      discordAvatar: "receiver2_avatar_url"
    };
    await insertToDatabase(schema.user, receiverUser2);

    const appreciationRecord = createAppreciationTableFixture();
    appreciationRecord.senderId = senderUser.id;
    appreciationRecord.message = "ありがとうございます！";
    appreciationRecord.pointPerReceiver = 10;
    await insertToDatabase(schema.appreciations, appreciationRecord);

    const receiverRecords = createMultipleAppreciationReceiversFixture(
      appreciationRecord.id,
      [receiverUser1.id, receiverUser2.id]
    );
    for (const receiverRecord of receiverRecords) {
      await insertToDatabase(schema.appreciationReceivers, receiverRecord);
    }

    // Act
    const result = await queryService.getAll();

    // Assert
    expect(result.appreciations).toHaveLength(1);

    const appreciation = result.appreciations[0];
    expect(appreciation.sender.discordUserName).toBe("sender_user");
    expect(appreciation.sender.discordAvatar).toBe("sender_avatar_url");
    expect(appreciation.receivers).toHaveLength(2);

    // 受信者の順序は保証されないため、配列から該当するものを探す
    const receiver1 = appreciation.receivers.find(
      (r) => r.discordUserName === "receiver1_user"
    );
    const receiver2 = appreciation.receivers.find(
      (r) => r.discordUserName === "receiver2_user"
    );

    expect(receiver1).toBeDefined();
    expect(receiver1!.discordAvatar).toBe("receiver1_avatar_url");
    expect(receiver2).toBeDefined();
    expect(receiver2!.discordAvatar).toBe("receiver2_avatar_url");

    expect(appreciation.message).toBe("ありがとうございます！");
    expect(appreciation.pointPerReceiver).toBe(10);
    expect(appreciation.createdAt).toBeDefined();
    expect(typeof appreciation.createdAt).toBe("string");
  });

  it("感謝投稿が存在しない場合は空の配列を返す", async () => {
    // Act
    const result = await queryService.getAll();

    // Assert
    expect(result.appreciations).toHaveLength(0);
  });

  it("複数の感謝投稿を作成日時の降順で取得できる", async () => {
    // Arrange
    const senderUser = {
      ...createUserTableFixture(),
      discordUserName: "sender_user",
      discordAvatar: "sender_avatar_url"
    };
    await insertToDatabase(schema.user, senderUser);

    const receiverUser = {
      ...createUserTableFixture(),
      discordUserName: "receiver_user",
      discordAvatar: "receiver_avatar_url"
    };
    await insertToDatabase(schema.user, receiverUser);

    // 古い投稿
    const oldAppreciationRecord = createAppreciationTableFixture();
    oldAppreciationRecord.senderId = senderUser.id;
    oldAppreciationRecord.message = "古い投稿";
    oldAppreciationRecord.pointPerReceiver = 5;
    oldAppreciationRecord.createdAt = new Date("2024-01-01T00:00:00Z");
    await insertToDatabase(schema.appreciations, oldAppreciationRecord);

    const oldReceiverRecord = createMultipleAppreciationReceiversFixture(
      oldAppreciationRecord.id,
      [receiverUser.id]
    )[0];
    await insertToDatabase(schema.appreciationReceivers, oldReceiverRecord);

    // 新しい投稿
    const newAppreciationRecord = createAppreciationTableFixture();
    newAppreciationRecord.senderId = senderUser.id;
    newAppreciationRecord.message = "新しい投稿";
    newAppreciationRecord.pointPerReceiver = 15;
    newAppreciationRecord.createdAt = new Date("2024-01-02T00:00:00Z");
    await insertToDatabase(schema.appreciations, newAppreciationRecord);

    const newReceiverRecord = createMultipleAppreciationReceiversFixture(
      newAppreciationRecord.id,
      [receiverUser.id]
    )[0];
    await insertToDatabase(schema.appreciationReceivers, newReceiverRecord);

    // Act
    const result = await queryService.getAll();

    // Assert
    expect(result.appreciations).toHaveLength(2);
    // 新しい投稿が最初に来る（降順）
    expect(result.appreciations[0].message).toBe("新しい投稿");
    expect(result.appreciations[1].message).toBe("古い投稿");
  });

  it("単一の受信者を持つ感謝投稿を正しく取得できる", async () => {
    // Arrange
    const senderUser = {
      ...createUserTableFixture(),
      discordUserName: "sender_user"
    };
    await insertToDatabase(schema.user, senderUser);

    const receiverUser = {
      ...createUserTableFixture(),
      discordUserName: "receiver_user"
    };
    await insertToDatabase(schema.user, receiverUser);

    const appreciationRecord = createAppreciationTableFixture();
    appreciationRecord.senderId = senderUser.id;
    appreciationRecord.message = "単一受信者テスト";
    appreciationRecord.pointPerReceiver = 25;
    await insertToDatabase(schema.appreciations, appreciationRecord);

    const receiverRecord = createMultipleAppreciationReceiversFixture(
      appreciationRecord.id,
      [receiverUser.id]
    )[0];
    await insertToDatabase(schema.appreciationReceivers, receiverRecord);

    // Act
    const result = await queryService.getAll();

    // Assert
    expect(result.appreciations).toHaveLength(1);
    const appreciation = result.appreciations[0];
    expect(appreciation.receivers).toHaveLength(1);
    expect(appreciation.receivers[0].discordUserName).toBe("receiver_user");
    expect(appreciation.message).toBe("単一受信者テスト");
    expect(appreciation.pointPerReceiver).toBe(25);
  });

  it("複数の送信者による感謝投稿を正しく取得できる", async () => {
    // Arrange
    const senderUser1 = {
      ...createUserTableFixture(),
      discordUserName: "sender1_user"
    };
    await insertToDatabase(schema.user, senderUser1);

    const senderUser2 = {
      ...createUserTableFixture(),
      discordUserName: "sender2_user"
    };
    await insertToDatabase(schema.user, senderUser2);

    const receiverUser = {
      ...createUserTableFixture(),
      discordUserName: "receiver_user"
    };
    await insertToDatabase(schema.user, receiverUser);

    // 送信者1からの感謝
    const appreciation1Record = createAppreciationTableFixture();
    appreciation1Record.senderId = senderUser1.id;
    appreciation1Record.message = "送信者1からの感謝";
    await insertToDatabase(schema.appreciations, appreciation1Record);

    const receiver1Record = createMultipleAppreciationReceiversFixture(
      appreciation1Record.id,
      [receiverUser.id]
    )[0];
    await insertToDatabase(schema.appreciationReceivers, receiver1Record);

    // 送信者2からの感謝
    const appreciation2Record = createAppreciationTableFixture();
    appreciation2Record.senderId = senderUser2.id;
    appreciation2Record.message = "送信者2からの感謝";
    await insertToDatabase(schema.appreciations, appreciation2Record);

    const receiver2Record = createMultipleAppreciationReceiversFixture(
      appreciation2Record.id,
      [receiverUser.id]
    )[0];
    await insertToDatabase(schema.appreciationReceivers, receiver2Record);

    // Act
    const result = await queryService.getAll();

    // Assert
    expect(result.appreciations).toHaveLength(2);

    const senderNames = result.appreciations.map(
      (a) => a.sender.discordUserName
    );
    expect(senderNames).toContain("sender1_user");
    expect(senderNames).toContain("sender2_user");

    const messages = result.appreciations.map((a) => a.message);
    expect(messages).toContain("送信者1からの感謝");
    expect(messages).toContain("送信者2からの感謝");
  });
});
