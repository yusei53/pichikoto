import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Appreciation,
  AppreciationID,
  AppreciationMessage,
  AppreciationPoint
} from "../../src/domain/Appreciation";
import {
  AppreciationPointTooHighError,
  AppreciationPointTooLowError,
  DuplicateReceiversError,
  EmptyMessageError,
  NoReceiversError,
  SenderInReceiversError,
  TooLongMessageError,
  TooManyReceiversError
} from "../../src/domain/AppreciationError";
import { UserID } from "../../src/domain/User";
import { CreatedAt } from "../../src/utils/CreatedAt";
import { UUID } from "../../src/utils/UUID";

const MOCK_APPRECIATION_ID = UUID.new().value;
const MOCK_NOW_DATE = new Date("2025-01-01T00:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(MOCK_NOW_DATE);

  vi.spyOn(AppreciationID, "new").mockReturnValue(
    new (class {
      constructor(public readonly value: UUID) {}
    })(UUID.from(MOCK_APPRECIATION_ID))
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
  const appreciationPoint = AppreciationPoint.from(50);

  describe("Appreciationドメインモデルの作成", () => {
    it("Appreciationドメインモデルを作成できること", () => {
      const expected = Appreciation.reconstruct(
        AppreciationID.new(),
        senderID,
        [receiverID1],
        message,
        appreciationPoint,
        CreatedAt.new()
      );

      const actual = Appreciation.create(
        senderID,
        [receiverID1],
        message,
        appreciationPoint
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
        appreciationPoint,
        CreatedAt.new()
      );

      const actual = Appreciation.create(
        senderID,
        receivers,
        message,
        appreciationPoint
      );

      expect(actual).toStrictEqual(expected);
    });
  });

  describe("Appreciationエンティティのバリデーション", () => {
    it("受信者が0人の場合はエラーになること", () => {
      expect(() => {
        Appreciation.create(senderID, [], message, appreciationPoint);
      }).toThrow(NoReceiversError);
    });

    it("受信者が6人を超える場合はエラーになること", () => {
      const tooManyReceivers = [...Array(7)].map(() => UserID.new());

      expect(() => {
        Appreciation.create(
          senderID,
          tooManyReceivers,
          message,
          appreciationPoint
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
          appreciationPoint
        );
      }).toThrow(TooLongMessageError);
    });

    it("受信者に重複がある場合はエラーになること", () => {
      expect(() => {
        Appreciation.create(
          senderID,
          [receiverID1, receiverID1],
          message,
          appreciationPoint
        );
      }).toThrow(DuplicateReceiversError);
    });

    it("送信者が受信者に含まれている場合はエラーになること", () => {
      expect(() => {
        Appreciation.create(
          senderID,
          [senderID, receiverID1],
          message,
          appreciationPoint
        );
      }).toThrow(SenderInReceiversError);
    });

    it("メッセージが空文字の場合はエラーになること", () => {
      expect(() => {
        Appreciation.create(
          senderID,
          [receiverID1],
          AppreciationMessage.from(""),
          appreciationPoint
        );
      }).toThrow(EmptyMessageError);
    });

    it("メッセージが空白のみの場合はエラーになること", () => {
      expect(() => {
        Appreciation.create(
          senderID,
          [receiverID1],
          AppreciationMessage.from("   "),
          appreciationPoint
        );
      }).toThrow(EmptyMessageError);
    });

    it("1未満のポイントの場合はエラーになること", () => {
      expect(() => {
        Appreciation.create(
          senderID,
          [receiverID1],
          message,
          AppreciationPoint.from(0)
        );
      }).toThrow(AppreciationPointTooLowError);
    });

    it("120を超えるポイントの場合はエラーになること", () => {
      expect(() => {
        Appreciation.create(
          senderID,
          [receiverID1],
          message,
          AppreciationPoint.from(121)
        );
      }).toThrow(AppreciationPointTooHighError);
    });
  });
});
