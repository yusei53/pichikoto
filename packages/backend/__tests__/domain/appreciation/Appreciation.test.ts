import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import {
  Appreciation,
  AppreciationID,
  AppreciationMessage,
  NewTotalConsumptionPoints,
  PointPerReceiver,
  ReceiverIDs
} from "../../../src/domain/appreciation/Appreciation";
import { CreateAppreciationError } from "../../../src/domain/appreciation/AppreciationError";
import { UserID } from "../../../src/domain/user/User";
import { CreatedAt } from "../../../src/utils/CreatedAt";
import { UUID } from "../../../src/utils/UUID";
import { expectErr, expectOk } from "../../testing/utils/AssertResult";

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
  const pointPerReceiver = PointPerReceiver.from(30);

  describe("Appreciationドメインモデルの作成", () => {
    it("Appreciationドメインモデルを作成できること", () => {
      const receiverIDs = ReceiverIDs.from([receiverID1]);
      const expected = Appreciation.reconstruct(
        AppreciationID.new(),
        senderID,
        receiverIDs,
        message,
        pointPerReceiver,
        CreatedAt.new()
      );

      const result = Appreciation.create(
        senderID,
        receiverIDs,
        message,
        pointPerReceiver
      );

      const actual = expectOk(result);
      expect(actual).toStrictEqual(expected);
    });

    it("複数の受信者でAppreciationドメインモデルを作成できること", () => {
      const receivers = [receiverID1, receiverID2, receiverID3];
      const receiverIDs = ReceiverIDs.from(receivers);
      const expected = Appreciation.reconstruct(
        AppreciationID.new(),
        senderID,
        receiverIDs,
        message,
        pointPerReceiver,
        CreatedAt.new()
      );

      const result = Appreciation.create(
        senderID,
        receiverIDs,
        message,
        pointPerReceiver
      );

      const actual = expectOk(result);
      expect(actual).toStrictEqual(expected);
    });
  });

  describe("Appreciationエンティティのバリデーション", () => {
    it("受信者が0人の場合はZodErrorがスローされること", () => {
      const fn = () => ReceiverIDs.from([]);

      expect(fn).toThrow(ZodError);
      expect(fn).toThrow("受信者は1人以上である必要があります");
    });

    it("受信者が6人を超える場合はZodErrorがスローされること", () => {
      const tooManyReceivers = [...Array(7)].map(() => UserID.new());
      const fn = () => ReceiverIDs.from(tooManyReceivers);

      expect(fn).toThrow(ZodError);
      expect(fn).toThrow(`受信者は${6}人以下である必要があります`);
    });

    it("メッセージが200文字を超える場合はZodErrorがスローされること", () => {
      const tooLongMessage = "a".repeat(201);
      const fn = () => AppreciationMessage.from(tooLongMessage);

      expect(fn).toThrow(ZodError);
      expect(fn).toThrow("メッセージは200文字以下である必要があります");
    });

    it("受信者に重複がある場合はZodErrorがスローされること", () => {
      const fn = () => ReceiverIDs.from([receiverID1, receiverID1]);

      expect(fn).toThrow(ZodError);
      expect(fn).toThrow("受信者リストに重複があります");
    });

    it("送信者が受信者に含まれている場合はエラーになること", () => {
      const receiverIDs = ReceiverIDs.from([senderID, receiverID1]);
      const result = Appreciation.create(
        senderID,
        receiverIDs,
        message,
        pointPerReceiver
      );

      const actual = expectErr(result);
      expect(actual).toBeInstanceOf(CreateAppreciationError);
    });

    it("メッセージが空文字の場合はZodErrorがスローされること", () => {
      const fn = () => AppreciationMessage.from("");

      expect(fn).toThrow(ZodError);
      expect(fn).toThrow("メッセージは1文字以上である必要があります");
    });

    it("メッセージが空白のみの場合はZodErrorがスローされること", () => {
      const fn = () => AppreciationMessage.from("   ");

      expect(fn).toThrow(ZodError);
      expect(fn).toThrow("メッセージは空文字であってはいけません");
    });

    it("1未満のポイントの場合はZodErrorがスローされること", () => {
      const fn = () => PointPerReceiver.from(0);

      expect(fn).toThrow(ZodError);
      expect(fn).toThrow("ポイントは1以上である必要があります");
    });

    it("120を超えるポイントの場合はZodErrorがスローされること", () => {
      const fn = () => PointPerReceiver.from(121);

      expect(fn).toThrow(ZodError);
      expect(fn).toThrow("ポイントは120以下である必要があります");
    });

    it("総ポイント（ポイント×受信者数）が120を超える場合はエラーになること", () => {
      const receivers = [receiverID1, receiverID2, receiverID3]; // 3人の受信者
      const receiverIDs = ReceiverIDs.from(receivers);
      const pointPerReceiver = PointPerReceiver.from(50); // 50ポイント × 3人 = 150ポイント > 120

      const result = Appreciation.create(
        senderID,
        receiverIDs,
        message,
        pointPerReceiver
      );

      const actual = expectErr(result);
      expect(actual).toBeInstanceOf(CreateAppreciationError);
    });
  });

  describe("週次制限関連のテスト", () => {
    describe("getTotalConsumedPoints", () => {
      it("総消費ポイント数を正しく計算できること", () => {
        const receiverIDs = ReceiverIDs.from([receiverID1, receiverID2]);
        const pointPerReceiver = PointPerReceiver.from(30);
        const appreciation = Appreciation.reconstruct(
          AppreciationID.new(),
          senderID,
          receiverIDs,
          message,
          pointPerReceiver,
          CreatedAt.new()
        );

        const result = appreciation.getTotalConsumedPoints();

        expect(result.value).toBe(60); // 30 × 2 = 60
      });
    });
  });

  describe("値オブジェクトのテスト", () => {
    describe("NewTotalConsumptionPoints", () => {
      it("有効な値で作成できること", () => {
        const points = NewTotalConsumptionPoints.from(50);
        expect(points.value).toBe(50);
      });

      it("0の場合はZodErrorがスローされること", () => {
        const fn = () => NewTotalConsumptionPoints.from(0);
        expect(fn).toThrow(ZodError);
        expect(fn).toThrow("新規消費ポイントは1以上である必要があります");
      });

      it("120を超える値の場合はZodErrorがスローされること", () => {
        const fn = () => NewTotalConsumptionPoints.from(121);
        expect(fn).toThrow(ZodError);
        expect(fn).toThrow("新規消費ポイントは120以下である必要があります");
      });
    });
  });
});
