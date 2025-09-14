import { neon, neonConfig } from "@neondatabase/serverless";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle } from "drizzle-orm/neon-http";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import ws from "ws";
import type { DatabaseConnectionConfig } from "./config";
import * as schema from "./schema";

/**
 * データベース接続のベース型
 * ローカル・テストではPostgreSQLを使用し、本番環境ではNeonDBを使用する
 */
export type DatabaseInstance =
  | NeonHttpDatabase<typeof schema>
  | PostgresJsDatabase<typeof schema>;

/**
 * データベース接続のインターフェース
 */
export interface Database {
  connect(config: DatabaseConnectionConfig): DatabaseInstance;
}

/**
 * NeonDBへ接続（本番用）
 */
export class Neon implements Database {
  connect(config: DatabaseConnectionConfig): NeonHttpDatabase<typeof schema> {
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
export class Postgres implements Database {
  connect(config: DatabaseConnectionConfig): PostgresJsDatabase<typeof schema> {
    const connectionString =
      config.testDatabaseUrl ||
      config.databaseUrl ||
      config.defaultConnectionString;

    const sql = postgres(connectionString);
    return drizzlePostgres(sql, { schema });
  }
}
