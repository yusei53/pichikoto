import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../database/schema";

/**
 * テスト専用データベース接続クラス
 * 本番環境には一切影響しない独立した実装
 */
export class TestDatabase {
  private static connectionPool: Map<
    string,
    PostgresJsDatabase<typeof schema>
  > = new Map();

  /**
   * テスト専用のデータベース接続を取得
   * 接続プールにより同一接続文字列では接続を再利用
   */
  static connect(): PostgresJsDatabase<typeof schema> {
    const connectionString =
      process.env.TEST_DATABASE_URL ||
      "postgres://postgres:postgres@db.localtest.me:5432/main";

    // 既存の接続があれば再利用
    if (TestDatabase.connectionPool.has(connectionString)) {
      return TestDatabase.connectionPool.get(connectionString)!;
    }

    // 新しい接続を作成（接続プール設定付き）
    const sql = postgres(connectionString, {
      max: 10, // 最大接続数
      idle_timeout: 30, // アイドルタイムアウト（秒）
      connect_timeout: 10 // 接続タイムアウト（秒）
    });

    const db = drizzle(sql, { schema });

    // 接続をプールに保存
    TestDatabase.connectionPool.set(connectionString, db);

    return db;
  }

  /**
   * 特定の接続をクローズ
   */
  static async closeConnection(connectionString?: string): Promise<void> {
    const target =
      connectionString ||
      process.env.TEST_DATABASE_URL ||
      "postgres://postgres:postgres@db.localtest.me:5432/main";

    if (TestDatabase.connectionPool.has(target)) {
      // ここでpostgres接続のクローズを行いたいが、
      // drizzleのラッパーからは直接アクセスできないため、
      // プールからの削除のみ行う
      TestDatabase.connectionPool.delete(target);
    }
  }
}

/**
 * テスト用のDB接続取得関数
 * テスト専用の実装を使用し、本番環境には一切影響しない
 */
export const getTestDb = () => TestDatabase.connect();
