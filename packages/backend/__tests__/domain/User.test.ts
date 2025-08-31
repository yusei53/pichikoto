import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Department,
  DiscordID,
  Faculty,
  User,
  UserID
} from "../../src/domain/User";
import { CreatedAt } from "../../src/utils/CreatedAt";

const MOCK_UUID = "00000000-0000-0000-0000-000000";
const MOCK_NOW_DATE = new Date("2025-01-01T00:00:00.000Z");

vi.mock("../../src/utils/UUID", () => {
  return {
    UUID: {
      new: vi.fn(() => ({
        value: MOCK_UUID
      }))
    }
  };
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(MOCK_NOW_DATE);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("UserDomainTest", () => {
  const discordID = DiscordID.from("123456789");
  const discordUserName = "TestUserName";
  const discordAvatar =
    "https://cdn.discordapp.com/sample-avatar/123456789/000000000000000000.png";
  const faculty = Faculty.from("Test学部");
  const department = Department.from("Tes学科");

  describe("ユーザードメインの作成", () => {
    it("ユーザーを作成できること", () => {
      const expected = User.reconstruct(
        UserID.new(),
        discordID,
        discordUserName,
        discordAvatar,
        faculty,
        department,
        CreatedAt.new()
      );

      const actual = User.create(
        discordID,
        discordUserName,
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
            discordAvatar,
            faculty,
            department
          );
        }).toThrow("Invalid Discord ID: must contain only digits");
      });
    });

    describe("学部名のバリデーション", () => {
      it("学部名が空文字の場合はエラーになること", () => {
        expect(() => {
          User.create(
            discordID,
            discordUserName,
            discordAvatar,
            Faculty.from(""),
            department
          );
        }).toThrow("Faculty cannot be empty");
      });

      it("学部名が30文字を超える場合はエラーになること", () => {
        expect(() => {
          User.create(
            discordID,
            discordUserName,
            discordAvatar,
            Faculty.from("A".repeat(31)),
            department
          );
        }).toThrow("Faculty must be 30 characters or less");
      });
    });

    describe("学科名のバリデーション", () => {
      it("学科名が空文字の場合はエラーになること", () => {
        expect(() => {
          User.create(
            discordID,
            discordUserName,
            discordAvatar,
            faculty,
            Department.from("")
          );
        }).toThrow("Department cannot be empty");
      });

      it("学科名が30文字を超える場合はエラーになること", () => {
        expect(() => {
          User.create(
            discordID,
            discordUserName,
            discordAvatar,
            faculty,
            Department.from("A".repeat(31))
          );
        }).toThrow("Department must be 30 characters or less");
      });
    });
  });
});
