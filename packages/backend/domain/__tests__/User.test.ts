import { describe, expect, it } from "vitest";
import type { A } from "../User";
import { Department, DiscordID, Faculty, User } from "../User";

describe("UserDomainTest", () => {
  const aa: A = {
    a: "a",
    b: 1
  };
  const discordID = new DiscordID("123456789");
  const discordUserName = "TestUserName";
  const discordDiscriminator = "1234";
  const discordAvatar =
    "https://cdn.discordapp.com/sample-avatar/123456789/000000000000000000.png";
  const faculty = new Faculty("Test学部");
  const department = new Department("Tes学科");

  describe("ユーザードメインの作成", () => {
    it("ユーザーを作成できること", () => {
      const actual = User.create(
        discordID,
        discordUserName,
        discordDiscriminator,
        discordAvatar,
        faculty,
        department
      );

      const expected = User.reconstruct(
        actual.userID,
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
            new DiscordID("InvalidStringID"),
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
            new Faculty(""),
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
            new Faculty("A".repeat(31)),
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
            new Department("")
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
            new Department("A".repeat(31))
          );
        }).toThrow(
          "Invalid Department: length must be between 1 and 30 characters"
        );
      });
    });
  });
});
