import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "../../database/client";
import { 
  appreciationReceivers as appreciationReceiversSchema,
  appreciations as appreciationsSchema,
  consumedPointLog as consumedPointLogSchema,
  user as userSchema 
} from "../../database/schema";
import { PointLeaderQueryService } from "../../src/query-service/PointLeaderQueryService";
import { 
  createAppreciationTableFixture,
  createAppreciationReceiverTableFixture 
} from "../testing/table_fixture/AppreciationTableFixture";
import { createConsumedPointLogTableFixtureWith } from "../testing/table_fixture/ConsumedPointLogTableFixture";
import { createUserTableFixture } from "../testing/table_fixture/UserTableFixture";

describe("PointLeaderQueryService", () => {
  let pointLeaderQueryService: PointLeaderQueryService;

  beforeAll(async () => {
    pointLeaderQueryService = new PointLeaderQueryService();
  });

  beforeEach(async () => {
    await db().delete(appreciationReceiversSchema);
    await db().delete(consumedPointLogSchema);
    await db().delete(appreciationsSchema);
    await db().delete(userSchema);
  });

  describe("getWeeklyLeaders", () => {
    it("今週のポイント送信・受信上位3人ずつを正しく取得できる", async () => {
      // テストデータの準備
      const user1 = createUserTableFixture();
      user1.discordId = "user1";
      user1.discordUserName = "User1";
      user1.discordAvatar = "avatar1.png";
      
      const user2 = createUserTableFixture();
      user2.discordId = "user2";
      user2.discordUserName = "User2";
      user2.discordAvatar = "avatar2.png";
      
      const user3 = createUserTableFixture();
      user3.discordId = "user3";
      user3.discordUserName = "User3";
      user3.discordAvatar = "avatar3.png";
      
      const user4 = createUserTableFixture();
      user4.discordId = "user4";
      user4.discordUserName = "User4";
      user4.discordAvatar = "avatar4.png";

      // ユーザーを挿入
      await db().insert(userSchema).values([user1, user2, user3, user4]);

      // 今週の開始日を取得
      const now = new Date();
      const dayOfWeek = now.getUTCDay();
      const monday = new Date(now);
      monday.setUTCDate(now.getUTCDate() - ((dayOfWeek + 6) % 7));
      monday.setUTCHours(0, 0, 0, 0);
      const weekStartDate = monday.toISOString().split("T")[0];

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

      await db().insert(appreciationsSchema).values([appreciation1, appreciation2]);

      // 受信者を設定
      const receiver1 = createAppreciationReceiverTableFixture(appreciation1.id, user3.id);
      const receiver2 = createAppreciationReceiverTableFixture(appreciation1.id, user4.id);
      const receiver3 = createAppreciationReceiverTableFixture(appreciation2.id, user3.id);
      
      await db().insert(appreciationReceiversSchema).values([receiver1, receiver2, receiver3]);

      // ポイント消費ログを作成
      const consumedLog1 = createConsumedPointLogTableFixtureWith({
        userId: user1.id,
        appreciationId: appreciation1.id,
        weekStartDate,
        consumedPoints: 20 // 10ポイント × 2人
      });
      
      const consumedLog2 = createConsumedPointLogTableFixtureWith({
        userId: user2.id,
        appreciationId: appreciation2.id,
        weekStartDate,
        consumedPoints: 20 // 20ポイント × 1人
      });

      await db().insert(consumedPointLogSchema).values([consumedLog1, consumedLog2]);

      // テスト実行
      const result = await pointLeaderQueryService.getWeeklyLeaders();

      // 検証
      expect(result.topSenders).toHaveLength(3); // 上位3人のみ
      expect(result.topReceivers).toHaveLength(3);

      // 送信者の確認
      const sendersWithPoints = result.topSenders.filter(sender => sender.totalPoints > 0);
      expect(sendersWithPoints).toHaveLength(2);
      expect(sendersWithPoints.some(sender => sender.id === user1.id && sender.totalPoints === 20)).toBe(true);
      expect(sendersWithPoints.some(sender => sender.id === user2.id && sender.totalPoints === 20)).toBe(true);

      // 受信者の確認
      const receiversWithPoints = result.topReceivers.filter(receiver => receiver.totalPoints > 0);
      expect(receiversWithPoints).toHaveLength(2);
      expect(receiversWithPoints.some(receiver => receiver.id === user3.id && receiver.totalPoints === 30)).toBe(true); // 10 + 20
      expect(receiversWithPoints.some(receiver => receiver.id === user4.id && receiver.totalPoints === 10)).toBe(true);
    });

    it("データが存在しない場合は空の結果を返す", async () => {
      const result = await pointLeaderQueryService.getWeeklyLeaders();
      
      expect(result.topSenders).toHaveLength(0);
      expect(result.topReceivers).toHaveLength(0);
    });
  });
});