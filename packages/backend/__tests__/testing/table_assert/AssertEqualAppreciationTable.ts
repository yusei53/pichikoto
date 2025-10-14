import { expect } from "vitest";
import type * as schema from "../../../database/schema";
import type { Appreciation } from "../../../src/domain/appreciation/Appreciation";

/**
 * データベースのappreciationsテーブルと引数で渡されたAppreciationドメインオブジェクトが等しいことをアサート
 * @param expectedAppreciation 期待されるAppreciationドメインオブジェクト
 * @param actualRecord selectOneFromDatabaseから返される単一レコード
 */
export const assertEqualAppreciationTable = (
  expectedAppreciation: Appreciation,
  actualRecord: typeof schema.appreciations.$inferSelect
): void => {
  const expectedRecord = {
    id: expectedAppreciation.appreciationID.value.value,
    senderId: expectedAppreciation.senderID.value,
    message: expectedAppreciation.message.value,
    pointPerReceiver: expectedAppreciation.pointPerReceiver.value,
    createdAt: actualRecord.createdAt // 日時は挿入時に生成されるため、実際の値を使用
  };

  expect(actualRecord).toEqual(expectedRecord);
};

/**
 * データベースのappreciation_receiversテーブルと期待される受信者IDリストが等しいことをアサート
 * @param expectedAppreciation 期待されるAppreciationドメインオブジェクト
 * @param actualRecords selectFromDatabaseから返されるレコード配列
 */
export const assertEqualAppreciationReceiversTable = (
  expectedAppreciation: Appreciation,
  actualRecords: (typeof schema.appreciationReceivers.$inferSelect)[]
): void => {
  // 受信者IDのリストを抽出
  const expectedReceiverIds = expectedAppreciation.receiverIDs.value.map(
    (receiverId) => receiverId.value
  );
  const actualReceiverIds = actualRecords.map((record) => record.receiverId);

  // 順序関係なく配列の内容を比較
  expect(actualReceiverIds.sort()).toEqual(expectedReceiverIds.sort());

  // 各レコードが正しいappreciationIdを持っていることを確認
  actualRecords.forEach((record) => {
    expect(record.appreciationId).toBe(
      expectedAppreciation.appreciationID.value.value
    );
  });
};
