import type { Context } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DiscordNotificationService } from "../../../src/application/services/discord-notification/DiscordNotificationService";
import {
  Appreciation,
  AppreciationID,
  AppreciationMessage,
  PointPerReceiver,
  ReceiverIDs
} from "../../../src/domain/appreciation/Appreciation";
import { DiscordUserID } from "../../../src/domain/user/User";
import { CreatedAt } from "../../../src/utils/CreatedAt";
import { UUID } from "../../../src/utils/UUID";

// fetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("DiscordNotificationService", () => {
  let service: DiscordNotificationService;
  let mockContext: Context;
  let mockAppreciation: Appreciation;

  beforeEach(() => {
    service = new DiscordNotificationService();

    // モックコンテキストの設定
    mockContext = {
      env: {
        DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/test",
        FRONTEND_BASE_URL: "https://frontend.example.com"
      }
    } as Context;

    // テストデータの作成
    const senderID = DiscordUserID.from("123456789012345678");
    const receiverID1 = DiscordUserID.from("234567890123456789");
    const receiverID2 = DiscordUserID.from("345678901234567890");

    const receiverIDs = ReceiverIDs.from([receiverID1, receiverID2]);
    const message = AppreciationMessage.from("ありがとうございました！");
    const pointPerReceiver = PointPerReceiver.from(44);

    mockAppreciation = Appreciation.reconstruct(
      AppreciationID.from(UUID.new().value),
      senderID,
      receiverIDs,
      message,
      pointPerReceiver,
      CreatedAt.new()
    );

    // fetchモックのリセット
    mockFetch.mockReset();
  });

  describe("sendAppreciationNotification", () => {
    it("正常にDiscord通知を送信できる", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      });

      // Act
      const result = await service.sendAppreciationNotification(
        mockContext,
        mockAppreciation
      );

      // Assert
      expect(result.isOk()).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe("https://discord.com/api/webhooks/test");
      expect(callArgs[1].method).toBe("POST");
      expect(callArgs[1].headers["Content-Type"]).toBe("application/json");

      const requestBody = JSON.parse(callArgs[1].body);
      expect(requestBody.content).toContain(
        "<@123456789012345678> が、<@234567890123456789> <@345678901234567890> に44ポイントとメッセージを送りました！"
      );
      expect(requestBody.content).toContain("**「ありがとうございました！」**");
      expect(requestBody.content).toContain("[こちら](");
      expect(requestBody.content).toContain(
        ")からも読むことができます。"
      );
    });

    it("DISCORD_WEBHOOK_URLが設定されていない場合はエラーを返す", async () => {
      // Arrange
      const contextWithoutWebhook = {
        env: {
          FRONTEND_BASE_URL: "https://frontend.example.com"
        }
      } as Context;

      // Act
      const result = await service.sendAppreciationNotification(
        contextWithoutWebhook,
        mockAppreciation
      );

      // Assert
      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().message).toContain(
        "DISCORD_WEBHOOK_URL is not configured"
      );
    });

    it("Webhook送信が失敗した場合はエラーを返す", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Bad Request"
      });

      // Act
      const result = await service.sendAppreciationNotification(
        mockContext,
        mockAppreciation
      );

      // Assert
      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().message).toContain(
        "Failed to send webhook: 400"
      );
    });

    it("ネットワークエラーが発生した場合はエラーを返す", async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      // Act
      const result = await service.sendAppreciationNotification(
        mockContext,
        mockAppreciation
      );

      // Assert
      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr().message).toContain(
        "Network error occurred while sending webhook"
      );
    });

    it("正しいフォーマットでメッセージが作成される", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      });

      // Act
      await service.sendAppreciationNotification(mockContext, mockAppreciation);

      // Assert
      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      const expectedMessage = [
        "<@123456789012345678> が、<@234567890123456789> <@345678901234567890> に44ポイントとメッセージを送りました！",
        "",
        "**「ありがとうございました！」**",
        "",
        `[こちら](https://frontend.example.com/appreciation/${mockAppreciation.appreciationID.value.value})からも読むことができます。`
      ].join("\n");

      expect(requestBody.content).toBe(expectedMessage);
    });

    it("DiscordユーザーIDを使用してメンションが作成される", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      });

      // Act
      await service.sendAppreciationNotification(mockContext, mockAppreciation);

      // Assert
      const callArgs = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      expect(requestBody.content).toContain(
        "<@123456789012345678> が、<@234567890123456789> <@345678901234567890> に"
      );
    });
  });
});
