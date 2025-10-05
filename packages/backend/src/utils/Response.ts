import type { HttpError } from "@pichikoto/http-contracts";
import type { Context } from "hono";

/**
 * HTTPレスポンスを表すクラス。
 * 改善版：HttpErrorとの統合、型安全性の向上
 */
export class Response {
  constructor(
    public readonly statusCode: number,
    public readonly message: any = undefined
  ) {}

  /**
   * HttpErrorからResponseを作成するファクトリメソッド
   */
  static fromHttpError(error: HttpError): Response {
    return new Response(error.status, {
      error: error.cause,
      errorType: error.errorType
    });
  }

  /**
   * 成功レスポンスを作成するファクトリメソッド
   */
  static ok<T>(data?: T): Response {
    return new Response(200, data);
  }

  /**
   * HonoのContextに対してレスポンスを送信する。
   */
  respond(c: Context): globalThis.Response {
    if (this.message === undefined) {
      return c.text("", this.statusCode as any);
    }

    return c.json(this.message, this.statusCode as any);
  }
}
