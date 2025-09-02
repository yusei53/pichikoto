import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import ws from "ws";
import type { DatabaseConnectionConfig } from "./config";
import * as schema from "./schema";

/**
 * データベース接続戦略のインターフェース
 */
export interface DatabaseConnectionStrategy {
  createConnection(config: DatabaseConnectionConfig): any;
}

/**
 * Neon接続戦略（本番・開発環境用）
 */
export class NeonConnectionStrategy implements DatabaseConnectionStrategy {
  createConnection(
    config: DatabaseConnectionConfig
  ): ReturnType<typeof drizzle> {
    let connectionString = config.databaseUrl;

    // 開発環境の場合はローカルPostgreSQLを使用
    if (config.nodeEnv === "development") {
      connectionString = this.buildLocalConnectionString(config);
      this.configureLocalNeonSettings(config);
    }

    // 接続文字列が設定されていない場合はデフォルトを使用
    if (!connectionString) {
      connectionString = config.defaultConnectionString;
    }

    // WebSocketコンストラクタを設定
    neonConfig.webSocketConstructor = ws;

    const sql = neon(connectionString);
    return drizzle(sql, { schema });
  }

  /**
   * ローカル接続文字列を構築
   */
  private buildLocalConnectionString(config: DatabaseConnectionConfig): string {
    const { host, port, database, username, password } =
      config.localDevelopment;
    return `postgres://${username}:${password}@${host}:${port}/${database}`;
  }

  /**
   * ローカル開発用のNeon設定を構成
   */
  private configureLocalNeonSettings(config: DatabaseConnectionConfig): void {
    const { host, sqlPort } = config.localDevelopment;

    neonConfig.fetchEndpoint = (hostParam) => {
      const [protocol, port] =
        hostParam === host ? ["http", sqlPort] : ["https", 443];
      return `${protocol}://${hostParam}:${port}/sql`;
    };

    const connectionStringUrl = new URL(
      this.buildLocalConnectionString(config)
    );
    neonConfig.useSecureWebSocket = connectionStringUrl.hostname !== host;

    neonConfig.wsProxy = (hostParam) =>
      hostParam === host ? `${hostParam}:${sqlPort}/v2` : `${hostParam}/v2`;
  }
}

/**
 * PostgreSQL直接接続戦略（テスト環境用）
 */
export class PostgresConnectionStrategy implements DatabaseConnectionStrategy {
  createConnection(config: DatabaseConnectionConfig) {
    const connectionString =
      config.testDatabaseUrl || config.defaultConnectionString;
    const sql = postgres(connectionString);
    return drizzlePostgres(sql, { schema });
  }
}
