import { expect } from "vitest";
import type * as schema from "../../../src/infrastructure/database/schema";

/**
 * データベースのoauth_stateテーブルと期待される値が等しいことをアサート
 * @param expectedState 期待されるOAuth stateオブジェクト
 * @param actualRecord selectOneFromDatabaseから返される単一レコード
 */
export const assertEqualOauthStateTable = (
  expectedState: {
    sessionId: string;
    state: string;
    nonce: string;
    expiresAt: Date;
  },
  actualRecord: typeof schema.oauthState.$inferSelect
): void => {
  const expectedRecord = {
    sessionId: expectedState.sessionId,
    state: expectedState.state,
    nonce: expectedState.nonce,
    expiresAt: expectedState.expiresAt,
    createdAt: actualRecord.createdAt // createdAtは自動生成されるので実際の値を使用
  };

  expect(actualRecord).toEqual(expectedRecord);
};