import type {
  appreciationReceivers,
  appreciations
} from "../../../database/schema";
import { DiscordUserID } from "../../../src/domain/user/User";
import { UUID } from "../../../src/utils/UUID";

/**
 * appreciationsテーブルのfixture
 */
export const createAppreciationTableFixture = () => {
  return {
    id: UUID.new().value,
    senderId: DiscordUserID.new().value,
    message: "テスト用の感謝メッセージです。いつもありがとうございます！",
    pointPerReceiver: 10,
    createdAt: new Date()
  } satisfies typeof appreciations.$inferInsert;
};

/**
 * appreciation_receiversテーブルのfixture
 */
export const createAppreciationReceiverTableFixture = (
  appreciationId: string,
  receiverId: string
) => {
  return {
    id: UUID.new().value,
    appreciationId,
    receiverId,
    createdAt: new Date()
  } satisfies typeof appreciationReceivers.$inferInsert;
};

/**
 * 複数のreceiverを持つfixture
 */
export const createMultipleAppreciationReceiversFixture = (
  appreciationId: string,
  receiverIds: string[]
) => {
  return receiverIds.map((receiverId) =>
    createAppreciationReceiverTableFixture(appreciationId, receiverId)
  );
};
