import type { EnvironmentConnectionParams } from "./config";
import { DatabaseConfig } from "./config";
import type { DatabaseConnection } from "./connection-database";
import { NeonConnection, PostgresConnection } from "./connection-database";

/**
 * データベース接続ファクトリー
 * 環境に応じて適切な接続戦略を選択し、DB接続を作成する
 */
export class DatabaseConnectionFactory {
  private static neonConnection = new NeonConnection();
  private static postgresConnection = new PostgresConnection();

  /**
   * 環境に応じたDB接続を作成
   */
  static createConnection(params?: EnvironmentConnectionParams) {
    const strategy = this.selectConnection();
    const config = this.buildConfig(params);
    return strategy.createConnection(config);
  }

  /**
   * 環境に応じて適切な接続戦略を選択
   */
  private static selectConnection(): DatabaseConnection {
    if (
      DatabaseConfig.isTestEnvironment() ||
      DatabaseConfig.isDevelopmentEnvironment()
    ) {
      return this.postgresConnection;
    }
    return this.neonConnection;
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

  /**
   * テスト用の接続を強制的に作成
   */
  static createTestConnection() {
    const config = DatabaseConfig.getDatabaseConfig();
    return this.postgresConnection.createConnection(config);
  }

  /**
   * Neon接続を強制的に作成
   */
  static createNeonConnection(params?: EnvironmentConnectionParams) {
    const config = this.buildConfig(params);
    return this.neonConnection.createConnection(config);
  }
}
