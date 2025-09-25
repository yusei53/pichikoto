import type { InferSelectModel } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { selectFromDatabase, selectOneFromDatabase } from "./GenericTableHelper";

/**
 * データベースから単一レコードを取得し、型安全にアサート用ヘルパー関数に渡す
 * @param table 検索対象のテーブル
 * @param assertFn アサート関数
 * @param expectedValue 期待される値
 */
export const assertSingleRecord = async <
  T extends PgTable,
  TExpected
>(
  table: T,
  assertFn: (expected: TExpected, actual: InferSelectModel<T>) => void,
  expectedValue: TExpected
): Promise<void> => {
  const record = await selectOneFromDatabase(table);
  if (!record) {
    throw new Error(`No record found in table ${table}`);
  }
  assertFn(expectedValue, record as InferSelectModel<T>);
};

/**
 * データベースから複数レコードを取得し、型安全にアサート用ヘルパー関数に渡す
 * @param table 検索対象のテーブル
 * @param assertFn アサート関数
 * @param expectedValue 期待される値
 */
export const assertMultipleRecords = async <
  T extends PgTable,
  TExpected
>(
  table: T,
  assertFn: (expected: TExpected, actual: InferSelectModel<T>[]) => void,
  expectedValue: TExpected
): Promise<void> => {
  const records = await selectFromDatabase(table);
  assertFn(expectedValue, records as InferSelectModel<T>[]);
};

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