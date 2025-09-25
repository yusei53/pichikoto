import type { InferSelectModel } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { selectFromDatabase, selectOneFromDatabase } from "./GenericTableHelper";

/**
 * データベースから単一レコードを型安全に取得する
 * @param table 検索対象のテーブル
 * @returns 型付きの単一レコード（存在しない場合はnull）
 */
export const getTypedSingleRecord = async <T extends PgTable>(
  table: T
): Promise<InferSelectModel<T> | null> => {
  return (await selectOneFromDatabase(table)) as InferSelectModel<T> | null;
};

/**
 * データベースから複数レコードを型安全に取得する
 * @param table 検索対象のテーブル
 * @returns 型付きのレコード配列
 */
export const getTypedMultipleRecords = async <T extends PgTable>(
  table: T
): Promise<InferSelectModel<T>[]> => {
  return (await selectFromDatabase(table)) as InferSelectModel<T>[];
};