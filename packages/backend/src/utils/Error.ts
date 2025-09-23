/**
 * UseCaseレイヤーで使用する汎用エラークラス
 *
 * ドメインエラーをラップして、コントローラ側で統一的にハンドリングできるようにする
 */
export class UseCaseError extends Error {
  constructor(readonly cause: Error) {
    const message = `${new.target.name}(cause: ${cause.name}(${cause.message}))`;
    super(message);
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
