import { Container } from "inversify";
import { TYPES } from "../../src/infrastructure/config/types";
import type { DbClientInterface } from "../../src/infrastructure/database/connection";

/**
 * テスト用DIコンテナを生成する共通関数
 * @param dbClient テスト用DBクライアント
 * @param additionalBinders 追加バインド処理（必要に応じて）
 */
export function createTestContainer(
  dbClient: DbClientInterface,
  additionalBinders?: (container: Container) => void
): Container {
  const container = new Container();
  container.bind<DbClientInterface>(TYPES.DbClient).toConstantValue(dbClient);
  if (additionalBinders) {
    additionalBinders(container);
  }
  return container;
}
