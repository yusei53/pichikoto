import { describe, expect, it, vi } from "vitest";
import {
  Department,
  DiscordID,
  Faculty,
  User,
  UserID
} from "../src/domain/models/User";
import { CreatedAt } from "../src/utils/CreatedAt";

const MOCK_UUID = "00000000-0000-0000-0000-000000";
const MOCK_CREATED_AT = "2025-01-01T00:00:00.000Z";

vi.mock("../src/utils/UUID", () => {
  return {
    UUID: {
      new: vi.fn(() => ({
        value: MOCK_UUID
      }))
    }
  };
});

vi.mock("../src/utils/CreatedAt", () => {
  return {
    CreatedAt: {
      new: vi.fn(() => ({
        value: MOCK_CREATED_AT
      }))
    }
  };
});

describe("UserDomainTest", () => {
  const discordID = DiscordID.from("123456789");
  const discordUserName = "TestUserName";
  const discordDiscriminator = "1234";
  const discordAvatar =
    "https://cdn.discordapp.com/sample-avatar/123456789/000000000000000000.png";
  const faculty = Faculty.from("Test学部");
  const department = Department.from("Tes学科");

  describe("ユーザードメインの作成", () => {
    it("ユーザードメインオブジェクトを作成できること", () => {
      const expected = User.reconstruct(
        UserID.new(),
        discordID,
        discordUserName,
        discordDiscriminator,
        discordAvatar,
        faculty,
        department,
        CreatedAt.new()
      );

      const actual = User.create(
        discordID,
        discordUserName,
        discordDiscriminator,
        discordAvatar,
        faculty,
        department
      );

      expect(actual).toStrictEqual(expected);
    });

    describe("DiscordIDのバリデーション", () => {
      it("数字でないDiscordIDの場合はエラーになること", () => {
        expect(() => {
          User.create(
            DiscordID.from("InvalidStringID"),
            discordUserName,
            discordDiscriminator,
            discordAvatar,
            faculty,
            department
          );
        }).toThrow("Invalid Discord ID");
      });
    });

    describe("学部名のバリデーション", () => {
      it("学部名が空文字の場合はエラーになること", () => {
        expect(() => {
          User.create(
            discordID,
            discordUserName,
            discordDiscriminator,
            discordAvatar,
            Faculty.from(""),
            department
          );
        }).toThrow(
          "Invalid Faculty: length must be between 1 and 30 characters"
        );
      });

      it("学部名が30文字を超える場合はエラーになること", () => {
        expect(() => {
          User.create(
            discordID,
            discordUserName,
            discordDiscriminator,
            discordAvatar,
            Faculty.from("A".repeat(31)),
            department
          );
        }).toThrow(
          "Invalid Faculty: length must be between 1 and 30 characters"
        );
      });
    });

    describe("学科名のバリデーション", () => {
      it("学科名が空文字の場合はエラーになること", () => {
        expect(() => {
          User.create(
            discordID,
            discordUserName,
            discordDiscriminator,
            discordAvatar,
            faculty,
            Department.from("")
          );
        }).toThrow(
          "Invalid Department: length must be between 1 and 30 characters"
        );
      });

      it("学科名が30文字を超える場合はエラーになること", () => {
        expect(() => {
          User.create(
            discordID,
            discordUserName,
            discordDiscriminator,
            discordAvatar,
            faculty,
            Department.from("A".repeat(31))
          );
        }).toThrow(
          "Invalid Department: length must be between 1 and 30 characters"
        );
      });
    });
  });
});
