import type { Result } from "neverthrow";

/**
 * Result型のエラーハンドリングと値の取得を1つの処理にまとめる関数
 *
 * @param result - Result型のオブジェクト
 * @param errorConstructor - エラー時に投げる例外のコンストラクタ
 * @returns 成功時の値
 * @throws エラー時は指定された例外を投げる
 *
 * @example
 * ```typescript
 * const result = await someFunction();
 * const value = handleResult(result, (error) => new CustomError(error));
 * console.log(value);
 * ```
 *
 * @example
 * ```typescript
 * const value = handleResult(await someFunction();, (error) => new CustomError(error));
 * console.log(value);
 * ```
 */
export function handleResult<T, E extends Error, CustomError extends Error>(
  result: Result<T, E>,
  errorConstructor: (cause: E) => CustomError
): T {
  if (result.isErr()) {
    throw errorConstructor(result.error);
  }
  return result.value;
}
