/**
 * データベース接続に関する設定を管理するクラス
 */
export class DatabaseConfig {
  /**
   * 環境変数を安全に取得
   */
  private static getEnvVar(key: string): string | undefined {
    if (typeof process !== "undefined" && process.env) {
      return process.env[key];
    }
    return undefined;
  }

  /**
   * テスト環境かどうかを判定
   */
  static isTestEnvironment(): boolean {
    const nodeEnv = this.getEnvVar("NODE_ENV");
    const vitestEnv = this.getEnvVar("VITEST");
    return (
      nodeEnv === "test" ||
      vitestEnv === "true" ||
      (typeof global !== "undefined" && (global as any).__vitest__)
    );
  }

  /**
   * 開発環境かどうかを判定
   */
  static isDevelopmentEnvironment(): boolean {
    return this.getEnvVar("NODE_ENV") === "development";
  }

  /**
   * データベース設定を取得
   */
  static getDatabaseConfig(): DatabaseConnectionConfig {
    return {
      databaseUrl: this.getEnvVar("DATABASE_URL") || "",
      testDatabaseUrl: this.getEnvVar("TEST_DATABASE_URL") || "",
      nodeEnv: this.getEnvVar("NODE_ENV") || "development",
      defaultConnectionString:
        "postgres://postgres:postgres@db.localtest.me:5432/main",
      localDevelopment: {
        host: "db.localtest.me",
        port: 5432,
        database: "main",
        username: "postgres",
        password: "postgres"
      }
    };
  }
}

/**
 * データベース接続設定の型定義
 */
export interface DatabaseConnectionConfig {
  databaseUrl: string;
  testDatabaseUrl: string;
  nodeEnv: string;
  defaultConnectionString: string;
  localDevelopment: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  };
}

/**
 * 環境別の接続パラメータ
 */
export interface EnvironmentConnectionParams {
  DATABASE_URL: string;
  NODE_ENV: string;
}
