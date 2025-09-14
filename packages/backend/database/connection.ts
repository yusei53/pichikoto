import type { Context } from "hono";
import { injectable } from "inversify";
import { DatabaseConnectionFactory } from "./connection-factory";

export interface DbClientInterface {
  init(c: Context): void;
  getDb(): ReturnType<typeof DatabaseConnectionFactory.createConnection>;
}

@injectable()
export class DbClient implements DbClientInterface {
  private db: ReturnType<
    typeof DatabaseConnectionFactory.createConnection
  > | null = null;
  private context: Context | null = null;

  public init(c: Context): void {
    this.context = c;
    if (!this.db) {
      this.db = connectToDatabase(c);
    }
  }

  getDb(): ReturnType<typeof DatabaseConnectionFactory.createConnection> {
    if (!this.db || !this.context) {
      throw new Error("DbClient not initialized. Call init() first.");
    }
    return this.db;
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
 * 環境に応じたグローバルDB接続インスタンス
 */
export const db = DatabaseConnectionFactory.createConnection();

export type DbType = typeof db;
