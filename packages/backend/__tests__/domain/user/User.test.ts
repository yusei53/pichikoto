import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { DiscordUserID, User } from "../../../src/domain/user/User";
import { UUID } from "../../../src/utils/UUID";

const MOCK_USER_ID = UUID.new().value;

beforeEach(() => {
  vi.spyOn(DiscordUserID, "new").mockReturnValue(
    new (class {
      constructor(public readonly value: string) {}
    })(MOCK_USER_ID)
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("UserDomainTest", () => {
  const discordID = DiscordUserID.new();
  const discordUserName = "TestUserName";
  const discordAvatar =
    "https://cdn.discordapp.com/sample-avatar/123456789/000000000000000000.png";

  describe("ユーザードメインの作成", () => {
    it("ユーザーを作成できること", () => {
      const expected = User.reconstruct(
        discordID,
        discordUserName,
        discordAvatar
      );

      const actual = User.create(discordID, discordUserName, discordAvatar);

      expect(actual).toStrictEqual(expected);
    });

    describe("DiscordIDのバリデーション", () => {
      it("数字でないDiscordIDの場合はZodErrorがスローされること", () => {
        const fn = () => DiscordUserID.from("InvalidStringID");

        expect(fn).toThrow(ZodError);
        expect(fn).toThrow("Discord ID must contain only digits");
      });
    });
  });
});
