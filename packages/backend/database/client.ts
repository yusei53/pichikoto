import type { Context } from "hono";
import { DatabaseConnectionFactory } from "./factory";
import { DatabaseConfig } from "./config";

export interface DbClientInterface {
  init(c: Context): void;
}

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

// テスト環境での接続プール
let testConnection: ReturnType<typeof DatabaseConnectionFactory.createConnection> | null = null;

/**
 * 環境に応じたDB接続を取得する関数
 * テスト環境では接続を共有し、本番環境ではリクエスト毎に新しい接続を作成
 */
export const db = () => {
  if (DatabaseConfig.isTestEnvironment()) {
    // テスト環境では接続を共有
    if (!testConnection) {
      testConnection = DatabaseConnectionFactory.createConnection();
    }
    return testConnection;
  }
  
  // 本番環境ではリクエスト毎に新しい接続を作成
  return DatabaseConnectionFactory.createConnection();
};

/**
 * テスト環境での接続をクリーンアップ
 */
export const cleanupTestConnection = async () => {
  if (testConnection && DatabaseConfig.isTestEnvironment()) {
    // postgres接続をクローズ
    const sql = (testConnection as any).$client;
    if (sql && typeof sql.end === 'function') {
      await sql.end();
    }
    testConnection = null;
  }
};
