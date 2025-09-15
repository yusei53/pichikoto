import type { Context } from "hono";
import { injectable } from "inversify";
import { DatabaseConnectionFactory } from "./factory";

export interface DbClientInterface {
  init(c: Context): void;
}

@injectable()
export class DbClient implements DbClientInterface {
  private db: ReturnType<
    typeof DatabaseConnectionFactory.createConnection
  > | null = null;

  public init(c: Context): void {
    if (!this.db) {
      this.db = connectToDatabase(c);
    }
  }
}

/**
 * Honoコンテキストからデータベース接続を作成
 */
const connectToDatabase = (c: Context) => {
  return DatabaseConnectionFactory.createConnection({
    DATABASE_URL: c.env.DATABASE_URL,
    NODE_ENV: c.env.NODE_ENV
  });
};

/**
 * 環境に応じたDB接続を取得する関数
 * リクエスト毎に新しい接続を作成してCloudflare Workersの制約を回避
 */
export const db = () => DatabaseConnectionFactory.createConnection();
