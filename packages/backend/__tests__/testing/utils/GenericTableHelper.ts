import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "../../../database/connection";

/**
 * 汎用的なテーブル挿入ヘルパー
 * @param table 挿入対象のテーブル
 * @param data 挿入するデータ
 */
export const insertToDatabase = async <T extends PgTable>(
  table: T,
  data: InferInsertModel<T>
): Promise<void> => {
  await db.insert(table).values(data);
};

/**
 * 汎用的なテーブル削除ヘルパー
 * @param table 削除対象のテーブル
 */
export const deleteFromDatabase = async <T extends PgTable>(
  table: T
): Promise<void> => {
  await db.delete(table);
};

/**
 * 汎用的なテーブル検索ヘルパー
 * @param table 検索対象のテーブル
 * @returns 検索結果の配列
 */
export const selectFromDatabase = async <T extends PgTable>(
  table: T
): Promise<InferSelectModel<T>[]> => {
  return (await db.select().from(table as PgTable)) as InferSelectModel<T>[];
};

/**
 * 汎用的なテーブル検索ヘルパー（単一レコード）
 * @param table 検索対象のテーブル
 * @returns 検索結果の単一レコード(存在しない場合はnull)
 */
export const selectOneFromDatabase = async <T extends PgTable>(
  table: T
): Promise<InferSelectModel<T> | null> => {
  const results = (await db
    .select()
    .from(table as PgTable)
    .limit(1)) as InferSelectModel<T>[];
  return results[0] || null;
};
