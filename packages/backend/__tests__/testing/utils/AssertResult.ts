import type { Result } from "neverthrow";
import { expect } from "vitest";

/**
 * Result型の値がOkの場合に値を返す
 * @param result Result型の値
 * @returns Okの場合の値
 *
 * @example
 * ```typescript
 * const expected = {
 *   id: "123",
 *   name: "John Doe"
 * };
 *
 * const result = await someFunction();
 *
 * const value = expectOk(result);
 * expect(value).toEqual(expected);
 * ```
 */
const expectOk = <T>(result: Result<T, any>): T => {
  expect(result.isOk()).toBe(true);
  return (result as any).value;
};

/**
 * Result型の値がErrの場合にエラーを返す
 * @param result Result型の値
 * @returns Errの場合のエラー
 *
 * @example
 * ```typescript
 * const result = await someFunction();
 *
 * const error = expectErr(result);
 * expect(error).toBeInstanceOf(Error);
 * ```
 */
const expectErr = <T>(result: Result<T, any>): any => {
  expect(result.isErr()).toBe(true);
  return (result as any).error;
};

export { expectErr, expectOk };
