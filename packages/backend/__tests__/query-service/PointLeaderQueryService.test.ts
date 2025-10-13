import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "../../database/client";
import {
  appreciationReceivers as appreciationReceiversSchema,
  appreciations as appreciationsSchema,
  user as userSchema
} from "../../database/schema";
import { PointLeaderQueryService } from "../../src/query-service/PointLeaderQueryService";
import {
  createAppreciationReceiverTableFixture,
  createAppreciationTableFixture
} from "../testing/table_fixture/AppreciationTableFixture";
import { createUserTableFixture } from "../testing/table_fixture/UserTableFixture";

describe("PointLeaderQueryService", () => {
  let pointLeaderQueryService: PointLeaderQueryService;

  beforeAll(async () => {
    pointLeaderQueryService = new PointLeaderQueryService();
  });

  beforeEach(async () => {
    await db().delete(appreciationReceiversSchema);
    await db().delete(appreciationsSchema);
    await db().delete(userSchema);
  });

  describe("getWeeklyLeaders", () => {
    it("今週のポイント送信・受信上位3人ずつを正しく取得できる", async () => {
      // テストデータの準備
      const user1 = createUserTableFixture();
      user1.discordId = "user1";

      const user2 = createUserTableFixture();
      user2.discordId = "user2";

      const user3 = createUserTableFixture();
      user3.discordId = "user3";

      const user4 = createUserTableFixture();
      user4.discordId = "user4";

      // ユーザーを挿入
      await db().insert(userSchema).values([user1, user2, user3, user4]);

      // 今週の開始日を取得
      const now = new Date();
      const dayOfWeek = now.getUTCDay();
      const monday = new Date(now);
      monday.setUTCDate(now.getUTCDate() - ((dayOfWeek + 6) % 7));
      monday.setUTCHours(0, 0, 0, 0);
      const _weekStartDate = monday.toISOString().split("T")[0];

      // 感謝投稿を作成
      const appreciation1 = createAppreciationTableFixture();
      appreciation1.senderId = user1.id;
      appreciation1.message = "ありがとう1";
      appreciation1.pointPerReceiver = 10;
      appreciation1.createdAt = new Date();

      const appreciation2 = createAppreciationTableFixture();
      appreciation2.senderId = user2.id;
      appreciation2.message = "ありがとう2";
      appreciation2.pointPerReceiver = 20;
      appreciation2.createdAt = new Date();

      await db()
        .insert(appreciationsSchema)
        .values([appreciation1, appreciation2]);

      // 受信者を設定
      const receiver1 = createAppreciationReceiverTableFixture(
        appreciation1.id,
        user3.id
      );
      const receiver2 = createAppreciationReceiverTableFixture(
        appreciation1.id,
        user4.id
      );
      const receiver3 = createAppreciationReceiverTableFixture(
        appreciation2.id,
        user3.id
      );

      await db()
        .insert(appreciationReceiversSchema)
        .values([receiver1, receiver2, receiver3]);

      // consumedPointLogは削除されたため、この部分は不要

      // テスト実行
      const result = await pointLeaderQueryService.getWeeklyLeaders();

      // 検証：0ポイントのユーザーは除外され、ポイントがあるユーザーのみ返される
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.topSenders).toHaveLength(2); // ポイントがある送信者のみ
        expect(result.value.topReceivers).toHaveLength(2); // ポイントがある受信者のみ

        // 送信者の確認：全員ポイントを持っている
        expect(
          result.value.topSenders.some(
            (sender) => sender.id === user1.id && sender.totalPoints === 20
          )
        ).toBe(true);
        expect(
          result.value.topSenders.some(
            (sender) => sender.id === user2.id && sender.totalPoints === 20
          )
        ).toBe(true);

        // 受信者の確認：全員ポイントを持っている
        expect(
          result.value.topReceivers.some(
            (receiver) =>
              receiver.id === user3.id && receiver.totalPoints === 30
          )
        ).toBe(true); // 10 + 20
        expect(
          result.value.topReceivers.some(
            (receiver) =>
              receiver.id === user4.id && receiver.totalPoints === 10
          )
        ).toBe(true);
      }
    });

    it("データが存在しない場合は空の結果を返す", async () => {
      const result = await pointLeaderQueryService.getWeeklyLeaders();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.topSenders).toHaveLength(0);
        expect(result.value.topReceivers).toHaveLength(0);
      }
    });

    it("全ユーザーが0ポイントの場合の動作確認", async () => {
      // ユーザーのみ作成（ポイント関連データは作成しない）
      const user1 = createUserTableFixture();
      user1.discordId = "user1";

      const user2 = createUserTableFixture();
      user2.discordId = "user2";

      const user3 = createUserTableFixture();
      user3.discordId = "user3";

      await db().insert(userSchema).values([user1, user2, user3]);

      const result = await pointLeaderQueryService.getWeeklyLeaders();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        console.log(
          "全員0ポイントの場合 - Top senders:",
          JSON.stringify(result.value.topSenders, null, 2)
        );
        console.log(
          "全員0ポイントの場合 - Top receivers:",
          JSON.stringify(result.value.topReceivers, null, 2)
        );

        // 0ポイントのユーザーは除外されるため、空の配列が返される
        expect(result.value.topSenders).toHaveLength(0);
        expect(result.value.topReceivers).toHaveLength(0);
      }
    });

    it("1人だけポイントがある場合の動作確認", async () => {
      // ユーザーを作成
      const user1 = createUserTableFixture();
      user1.discordId = "user1";

      const user2 = createUserTableFixture();
      user2.discordId = "user2";

      const user3 = createUserTableFixture();
      user3.discordId = "user3";

      const user4 = createUserTableFixture();
      user4.discordId = "user4";

      await db().insert(userSchema).values([user1, user2, user3, user4]);

      // 今週の開始日を取得
      const now = new Date();
      const dayOfWeek = now.getUTCDay();
      const monday = new Date(now);
      monday.setUTCDate(now.getUTCDate() - ((dayOfWeek + 6) % 7));
      monday.setUTCHours(0, 0, 0, 0);

      // 1つだけ感謝投稿を作成（user1がuser2にポイント送信）
      const appreciation = createAppreciationTableFixture();
      appreciation.senderId = user1.id;
      appreciation.message = "ありがとう";
      appreciation.pointPerReceiver = 10;
      appreciation.createdAt = new Date();

      await db().insert(appreciationsSchema).values([appreciation]);

      // 受信者を設定
      const receiver = createAppreciationReceiverTableFixture(
        appreciation.id,
        user2.id
      );
      await db().insert(appreciationReceiversSchema).values([receiver]);

      // consumedPointLogは削除されたため、この部分は不要

      // テスト実行
      const result = await pointLeaderQueryService.getWeeklyLeaders();

      // 検証
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        // 送信者：ポイントがある1人のみが返される
        expect(result.value.topSenders).toHaveLength(1);
        expect(result.value.topSenders[0].id).toBe(user1.id);
        expect(result.value.topSenders[0].totalPoints).toBe(10);

        // 受信者：ポイントがある1人のみが返される
        expect(result.value.topReceivers).toHaveLength(1);
        expect(result.value.topReceivers[0].id).toBe(user2.id);
        expect(result.value.topReceivers[0].totalPoints).toBe(10);
      }
    });
  });
});
