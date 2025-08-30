import type { oauthState } from "../../../src/infrastructure/database/schema";

/**
 * テスト用のOAuth state情報
 */
export const COMMON_OAUTH_STATE_INFO = {
  SESSION_ID: "test-session-id-12345",
  STATE: "test-oauth-state-67890",
  NONCE: "test-nonce-abcdef"
} as const;

/**
 * 基本的なOAuth stateのfixture
 */
export const createOauthStateTableFixture = () => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1時間後

  return {
    sessionId: COMMON_OAUTH_STATE_INFO.SESSION_ID,
    state: COMMON_OAUTH_STATE_INFO.STATE,
    nonce: COMMON_OAUTH_STATE_INFO.NONCE,
    expiresAt,
    createdAt: now
  } satisfies typeof oauthState.$inferInsert;
};

/**
 * カスタムセッションIDを持つOAuth stateのfixture
 */
export const createOauthStateTableFixtureWithCustomSessionId = (sessionId: string) => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1時間後

  return {
    sessionId,
    state: `custom-state-${sessionId}`,
    nonce: `custom-nonce-${sessionId}`,
    expiresAt,
    createdAt: now
  } satisfies typeof oauthState.$inferInsert;
};

/**
 * 期限切れのOAuth stateのfixture
 */
export const createExpiredOauthStateTableFixture = () => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() - 60 * 60 * 1000); // 1時間前（期限切れ）

  return {
    sessionId: "expired-session-id",
    state: "expired-oauth-state",
    nonce: "expired-nonce",
    expiresAt,
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2時間前に作成
  } satisfies typeof oauthState.$inferInsert;
};