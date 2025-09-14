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
export interface DatabaseConnection {
  createConnection(config: DatabaseConnectionConfig): any;
}

/**
 * NeonDBへ接続（本番用）
 */
export class NeonConnection implements DatabaseConnection {
  createConnection(
    config: DatabaseConnectionConfig
  ): ReturnType<typeof drizzle> {
    // 本番環境ではDATABASE_URLまたはデフォルト接続文字列を使用
    const connectionString =
      config.databaseUrl || config.defaultConnectionString;

    // WebSocketコンストラクタを設定
    neonConfig.webSocketConstructor = ws;

    const sql = neon(connectionString);
    return drizzle(sql, { schema });
  }
}

/**
 * PostgreSQL直接接続戦略（テスト・ローカル開発環境用）
 */
export class PostgresConnection implements DatabaseConnection {
  createConnection(config: DatabaseConnectionConfig) {
    const connectionString =
      config.testDatabaseUrl ||
      config.databaseUrl ||
      config.defaultConnectionString;

    const sql = postgres(connectionString);
    return drizzlePostgres(sql, { schema });
  }
}
