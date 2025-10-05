import { type HttpError } from "@pichikoto/http-contracts";
import type { Result } from "neverthrow";
import { Response } from "./Response";

/**
 * レスポンスを生成するためのインターフェース。
 *
 * ## 実装例
 *
 * ```typescript
 * class SomeApplicationErrorResponseCreator extends HttpErrorResponseCreator<SomeApplicationError> {
 *   protected createHttpError(error: SomeApplicationError): HttpError {
 *     return new InternalServerError(error.message);
 *   }
 * }
 * ```
 *
 * ## 使用例
 *
 * ```typescript
 * async function someRoute(c: Context) {
 *   const responseCreator = new SomeApplicationErrorResponseCreator();
 *   const result: Result<SomeData, SomeApplicationError> = await someApplication.doSomething();
 *   return responseCreator.fromResult(result).respond(c);
 * }
 * ```
 */
export interface ResponseCreator<TError> {
  /**
   * エラーをResponseに変換する。
   */
  toResponse(error: TError): Response;

  /**
   * Result<T, TError>をResponseに変換する。
   */
  fromResult<T>(result: Result<T, TError>): Response;
}

/**
 * ResponseCreatorの基底クラス。
 * 共通の実装を提供する。
 */
abstract class BaseResponseCreator<TError extends Error>
  implements ResponseCreator<TError>
{
  abstract toResponse(error: TError): Response;

  fromResult<T>(result: Result<T, TError>): Response {
    if (result.isErr()) {
      console.error(`Respond with error: ${result.error.message}`);
      return this.toResponse(result.error);
    }

    return Response.ok(result.value);
  }
}

/**
 * HttpErrorを活用したResponseCreator基底クラス
 * 数値のハードコーディングを避け、型安全性を向上
 */
export abstract class HttpErrorResponseCreator<
  TError extends Error
> extends BaseResponseCreator<TError> {
  /**
   * アプリケーションエラーをHttpErrorに変換する抽象メソッド
   */
  protected abstract createHttpError(error: TError): HttpError;

  toResponse(error: TError): Response {
    const httpError = this.createHttpError(error);
    return Response.fromHttpError(httpError);
  }
}
