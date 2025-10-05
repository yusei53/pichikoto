/**
 * UseCaseレイヤーで使用する汎用エラークラス
 *
 * ドメインエラーをラップして、コントローラ側で統一的にハンドリングできるようにする
 *
 * @example
 * export class ExampleUseCaseError extends UseCaseError {}
 *
 * export class ExampleNotFoundError extends ExampleUseCaseError {
 * constructor(exampleID: ExampleID) {
 *   super(`example not found: ${exampleID.value.value}`);
 * }
 *
 * export class ExampleDomainError extends ExampleUseCaseError {
 *   constructor(cause: Error) {
 *     super(`${cause}`);
 *   }
 * }
 *
 * @returns
 * if (cause is Error) {
 *   ExampleUseCaseError(cause: ExampleNotFoundError(cause: ExampleID(value: 1234567890)))
 * } else {
 *   ExampleUseCaseError(cause: ExampleDomainError(cause: Error(example domain error)))
 * }
 */
export class UseCaseError extends Error {
  constructor(readonly cause: Error | string) {
    if (typeof cause === "string") {
      const message = `${new.target.name}(cause: ${cause})`;
      super(message);
    } else {
      const message = `${new.target.name}(cause: ${cause.name}(${cause.message}))`;
      super(message);
    }
  }
}

/**
 * ドメインレイヤーで使用する汎用エラークラス
 *
 * 適切なクラス名と統一されたエラーハンドリングを提供
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
