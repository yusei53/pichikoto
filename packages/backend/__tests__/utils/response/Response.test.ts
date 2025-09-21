import { UnauthorizedError } from "@pichikoto/http-contracts";
import { describe, expect, it, vi } from "vitest";
import { BytesMessage, Response } from "../../../src/utils/response/Response";

// Honoのコンテキストをモック
const mockContext = {
  text: vi.fn(),
  json: vi.fn()
};

describe("Response", () => {
  it("messageがundefinedの場合は空のテキストレスポンスを返す", () => {
    const response = new Response(200);

    response.respond(mockContext as any);

    expect(mockContext.text).toHaveBeenCalledWith("", 200);
  });

  it("messageがBytesMessageの場合はバイナリレスポンスを返す", () => {
    const body = new ArrayBuffer(8);
    const bytesMessage = new BytesMessage(body, "application/pdf");
    const response = new Response(200, bytesMessage);

    const result = response.respond(mockContext as any);

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(200);
  });

  it("messageが通常のオブジェクトの場合はJSONレスポンスを返す", () => {
    const message = { success: true };
    const response = new Response(200, message);

    response.respond(mockContext as any);

    expect(mockContext.json).toHaveBeenCalledWith(message, 200);
  });
});

describe("BytesMessage", () => {
  it("バイナリデータとコンテンツタイプを正しく保持する", () => {
    const body = new ArrayBuffer(8);
    const contentType = "image/png";

    const bytesMessage = new BytesMessage(body, contentType);

    expect(bytesMessage.body).toBe(body);
    expect(bytesMessage.contentType).toBe(contentType);
  });
});

describe("Response factory methods", () => {
  describe("fromHttpError", () => {
    it("HttpErrorから適切なレスポンスを生成する", () => {
      const httpError = new UnauthorizedError({ detail: "JWT is invalid" });

      const response = Response.fromHttpError(httpError);

      expect(response.statusCode).toBe(401);
      expect(response.message).toEqual({
        error: "Unauthorized",
        details: { detail: "JWT is invalid" }
      });
    });
  });

  describe("ok", () => {
    it("成功レスポンスを生成する", () => {
      const data = { id: 1, name: "test" };

      const response = Response.ok(data);

      expect(response.statusCode).toBe(200);
      expect(response.message).toEqual(data);
    });

    it("データなしの成功レスポンスを生成する", () => {
      const response = Response.ok();

      expect(response.statusCode).toBe(200);
      expect(response.message).toBeUndefined();
    });
  });
});
