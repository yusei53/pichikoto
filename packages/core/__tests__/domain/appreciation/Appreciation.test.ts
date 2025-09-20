import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Appreciation,
  AppreciationID,
  AppreciationMessage,
  PointPerReceiver,
  DuplicateReceiversError,
  EmptyMessageError,
  NoReceiversError,
  PointPerReceiverTooHighError,
  PointPerReceiverTooLowError,
  SenderInReceiversError,
  TooLongMessageError,
  TooManyReceiversError,
  TotalPointExceedsLimitError
} from "../../../src/domain/appreciation";
import { UserID } from "../../../src/domain/user";
import { CreatedAt } from "../../../src/utils";

const MOCK_APPRECIATION_ID = "00000000-0000-0000-0000-000000000000";
const MOCK_NOW_DATE = new Date("2025-01-01T00:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(MOCK_NOW_DATE);

  vi.spyOn(AppreciationID, "new").mockReturnValue(
    AppreciationID.from(MOCK_APPRECIATION_ID)
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("AppreciationDomainTest", () => {
  const senderID = UserID.new();
  const receiverID1 = UserID.new();
  const receiverID2 = UserID.new();
  const receiverID3 = UserID.new();
  const message = AppreciationMessage.from("いつもお疲れ様です！");
  const pointPerReceiver = PointPerReceiver.from(30);

  describe("Appreciationドメインモデルの作成", () => {
    it("Appreciationドメインモデルを作成できること", () => {
      const expected = Appreciation.reconstruct(
        AppreciationID.new(),
        senderID,
        [receiverID1],
        message,
        pointPerReceiver,
        CreatedAt.new()
      );

      const actual = Appreciation.create(
        senderID,
        [receiverID1],
        message,
        pointPerReceiver
      );

      expect(actual).toStrictEqual(expected);
    });

    it("複数の受信者でAppreciationドメインモデルを作成できること", () => {
      const receivers = [receiverID1, receiverID2, receiverID3];
      const expected = Appreciation.reconstruct(
        AppreciationID.new(),
        senderID,
        receivers,
        message,
        pointPerReceiver,
        CreatedAt.new()
      );

      const actual = Appreciation.create(
        senderID,
        receivers,
        message,
        pointPerReceiver
      );

      expect(actual).toStrictEqual(expected);
    });
  });

  describe("Appreciationエンティティのバリデーション", () => {
    it("受信者が0人の場合はエラーになること", () => {
      expect(() => {
        Appreciation.create(senderID, [], message, pointPerReceiver);
      }).toThrow(NoReceiversError);
    });

    it("受信者が6人を超える場合はエラーになること", () => {
      const tooManyReceivers = [...Array(7)].map(() => UserID.new());

      expect(() => {
        Appreciation.create(
          senderID,
          tooManyReceivers,
          message,
          pointPerReceiver
        );
      }).toThrow(TooManyReceiversError);
    });

    it("メッセージが200文字を超える場合はエラーになること", () => {
      const tooLongMessage = "a".repeat(201);
      expect(() => {
        Appreciation.create(
          senderID,
          [receiverID1],
          AppreciationMessage.from(tooLongMessage),
          pointPerReceiver
        );
      }).toThrow(TooLongMessageError);
    });

    it("受信者に重複がある場合はエラーになること", () => {
      expect(() => {
        Appreciation.create(
          senderID,
          [receiverID1, receiverID1],
          message,
          pointPerReceiver
        );
      }).toThrow(DuplicateReceiversError);
    });

    it("送信者が受信者に含まれている場合はエラーになること", () => {
      expect(() => {
        Appreciation.create(
          senderID,
          [senderID, receiverID1],
          message,
          pointPerReceiver
        );
      }).toThrow(SenderInReceiversError);
    });

    it("メッセージが空文字の場合はエラーになること", () => {
      expect(() => {
        Appreciation.create(
          senderID,
          [receiverID1],
          AppreciationMessage.from(""),
          pointPerReceiver
        );
      }).toThrow(EmptyMessageError);
    });

    it("メッセージが空白のみの場合はエラーになること", () => {
      expect(() => {
        Appreciation.create(
          senderID,
          [receiverID1],
          AppreciationMessage.from("   "),
          pointPerReceiver
        );
      }).toThrow(EmptyMessageError);
    });

    it("1未満のポイントの場合はエラーになること", () => {
      expect(() => {
        Appreciation.create(
          senderID,
          [receiverID1],
          message,
          PointPerReceiver.from(0)
        );
      }).toThrow(PointPerReceiverTooLowError);
    });

    it("120を超えるポイントの場合はエラーになること", () => {
      expect(() => {
        Appreciation.create(
          senderID,
          [receiverID1],
          message,
          PointPerReceiver.from(121)
        );
      }).toThrow(PointPerReceiverTooHighError);
    });

    it("総ポイント（ポイント×受信者数）が120を超える場合はエラーになること", () => {
      const receivers = [receiverID1, receiverID2, receiverID3]; // 3人の受信者
      const pointPerReceiver = PointPerReceiver.from(50); // 50ポイント × 3人 = 150ポイント > 120

      expect(() => {
        Appreciation.create(senderID, receivers, message, pointPerReceiver);
      }).toThrow(TotalPointExceedsLimitError);
    });
  });
});
