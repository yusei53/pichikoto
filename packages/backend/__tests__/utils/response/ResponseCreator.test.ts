import { InternalServerError } from "@pichikoto/http-contracts";
import { err, ok } from "neverthrow";
import { describe, expect, it } from "vitest";
import {
  BaseResponseCreator,
  HttpErrorResponseCreator,
  Response
} from "../../../src/utils/response";

// テスト用のエラー型
class TestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TestError";
  }
}

// テスト用のResponseCreator実装
class TestResponseCreator extends BaseResponseCreator<TestError> {
  toResponse(error: TestError): Response {
    return new Response(400, {
      errorType: "TEST_ERROR",
      detail: error.message
    });
  }
}

// HttpErrorResponseCreator用のテスト実装
class TestHttpErrorResponseCreator extends HttpErrorResponseCreator<TestError> {
  protected createHttpError(error: TestError): InternalServerError {
    return new InternalServerError({
      errorType: "TEST_ERROR",
      detail: error.message
    });
  }
}

describe("BaseResponseCreator", () => {
  const responseCreator = new TestResponseCreator();

  describe("fromResult", () => {
    it("成功のResultの場合は200ステータスでデータを返す", () => {
      const successData = { id: 1, name: "test" };
      const result = ok(successData);

      const response = responseCreator.fromResult(result);

      expect(response.statusCode).toBe(200);
      expect(response.message).toEqual(successData);
    });

    it("エラーのResultの場合はtoResponseメソッドを呼び出す", () => {
      const error = new TestError("Something went wrong");
      const result = err(error);

      const response = responseCreator.fromResult(result);

      expect(response.statusCode).toBe(400);
      expect(response.message).toEqual({
        errorType: "TEST_ERROR",
        detail: "Something went wrong"
      });
    });
  });

  describe("toResponse", () => {
    it("エラーを適切なレスポンスに変換する", () => {
      const error = new TestError("Test error message");

      const response = responseCreator.toResponse(error);

      expect(response.statusCode).toBe(400);
      expect(response.message).toEqual({
        errorType: "TEST_ERROR",
        detail: "Test error message"
      });
    });
  });
});

describe("HttpErrorResponseCreator", () => {
  const responseCreator = new TestHttpErrorResponseCreator();

  describe("toResponse", () => {
    it("HttpErrorを使用して500ステータスのレスポンスを生成する", () => {
      const error = new TestError("Test error message");

      const response = responseCreator.toResponse(error);

      expect(response.statusCode).toBe(500);
      expect(response.message).toEqual({
        error: "Internal Server Error",
        details: {
          errorType: "TEST_ERROR",
          detail: "Test error message"
        }
      });
    });
  });

  describe("fromResult", () => {
    it("エラーのResultの場合はHttpErrorベースのレスポンスを返す", () => {
      const error = new TestError("Something went wrong");
      const result = err(error);

      const response = responseCreator.fromResult(result);

      expect(response.statusCode).toBe(500);
      expect(response.message).toEqual({
        error: "Internal Server Error",
        details: {
          errorType: "TEST_ERROR",
          detail: "Something went wrong"
        }
      });
    });
  });
});
