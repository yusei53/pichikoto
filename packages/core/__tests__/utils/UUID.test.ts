import { validate as UUIDValidate } from "uuid";
import { describe, expect, it } from "vitest";
import { UUID } from "../../src/utils";

describe("UUID", () => {
  describe("UUID.new()", () => {
    it("新しいUUIDを生成できること", () => {
      const uuid = UUID.new();

      expect(uuid).toBeInstanceOf(UUID);
      expect(typeof uuid.value).toBe("string");
      expect(UUIDValidate(uuid.value)).toBe(true);
    });

    it("毎回異なるUUIDが生成されること", () => {
      const uuid1 = UUID.new();
      const uuid2 = UUID.new();

      expect(uuid1.value).not.toBe(uuid2.value);
    });
  });

  describe("UUID.from()", () => {
    describe("正常系", () => {
      it("有効なUUID文字列からUUIDオブジェクトを作成できること", () => {
        const validUUID = "550e8400-e29b-41d4-a716-446655440000";
        const uuid = UUID.from(validUUID);

        expect(uuid).toBeInstanceOf(UUID);
        expect(uuid.value).toBe(validUUID);
      });
    });

    describe("異常系", () => {
      it("無効な形式の文字列の場合はエラーを投げること", () => {
        const invalidUUID = "invalid-uuid-string";

        expect(() => UUID.from(invalidUUID)).toThrow("Invalid UUID");
      });

      it("ハイフンが不足している文字列の場合はエラーを投げること", () => {
        const noHyphensUUID = "550e8400e29b41d4a716446655440000";

        expect(() => UUID.from(noHyphensUUID)).toThrow("Invalid UUID");
      });

      it("長さが不正な文字列の場合はエラーを投げること", () => {
        const shortUUID = "550e8400-e29b-41d4-a716";

        expect(() => UUID.from(shortUUID)).toThrow("Invalid UUID");
      });

      it("空文字の場合はエラーを投げること", () => {
        expect(() => UUID.from("")).toThrow("Invalid UUID");
      });
    });
  });
});
