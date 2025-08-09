import type { PgTable } from "drizzle-orm/pg-core";
import { TestDbClient } from "../setup/TestDbClient";

/**
 * 汎用的なテーブル挿入ヘルパー
 * @param table 挿入対象のテーブル
 * @param data 挿入するデータ
 */
export const insertToDatabase = async <T extends PgTable>(
  table: T,
  data: typeof table.$inferInsert
): Promise<void> => {
  const dbClient = new TestDbClient();
  const db = dbClient.getDb();
  await db.insert(table).values(data);
};

/**
 * 汎用的なテーブル削除ヘルパー
 * @param table 削除対象のテーブル
 */
export const deleteFromDatabase = async (table: PgTable): Promise<void> => {
  const dbClient = new TestDbClient();
  const db = dbClient.getDb();
  await db.delete(table);
};
