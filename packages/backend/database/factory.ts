import type { EnvironmentConnectionParams } from "./config";
import { DatabaseConfig } from "./config";
import type { Database } from "./database";
import { Neon, Postgres } from "./database";

/**
 * データベース接続ファクトリー
 * 環境に応じて適切なデータベースを選択し、DB接続をする
 */
export class DatabaseConnectionFactory {
  private static neon = new Neon();
  private static postgres = new Postgres();

  /**
   * 環境に応じたDB接続
   */
  static createConnection(params?: EnvironmentConnectionParams) {
    const db = this.selectDatabase();
    const config = this.buildConfig(params);
    return db.connect(config);
  }

  /**
   * 環境に応じて適切な接続
   */
  private static selectDatabase(): Database {
    if (
      DatabaseConfig.isTestEnvironment() ||
      DatabaseConfig.isDevelopmentEnvironment()
    ) {
      return this.postgres;
    }
    return this.neon;
  }

  /**
   * 設定オブジェクトを構築
   */
  private static buildConfig(params?: EnvironmentConnectionParams) {
    const baseConfig = DatabaseConfig.getDatabaseConfig();

    // パラメータが渡された場合は上書き（Honoコンテキストからの場合）
    if (params) {
      return {
        ...baseConfig,
        databaseUrl: params.DATABASE_URL || baseConfig.databaseUrl,
        nodeEnv: params.NODE_ENV || baseConfig.nodeEnv
      };
    }

    return baseConfig;
  }
}
