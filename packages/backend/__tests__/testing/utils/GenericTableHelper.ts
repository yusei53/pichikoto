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

/**
 * 汎用的なテーブル検索ヘルパー
 * @param table 検索対象のテーブル
 * @returns 検索結果の配列
 */
export const selectFromDatabase = async <T extends PgTable>(
  table: T
): Promise<(typeof table.$inferSelect)[]> => {
  const dbClient = new TestDbClient();
  const db = dbClient.getDb();
  return await db.select().from(table);
};

/**
 * 汎用的なテーブル検索ヘルパー（単一レコード）
 * @param table 検索対象のテーブル
 * @returns 検索結果の単一レコード
 */
export const selectOneFromDatabase = async <T extends PgTable>(
  table: T
): Promise<typeof table.$inferSelect> => {
  const dbClient = new TestDbClient();
  const db = dbClient.getDb();
  const results = await db.select().from(table).limit(1);
  return results[0];
};
