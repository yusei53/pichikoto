import type { oauthState } from "../../../database/schema";

/**
 * テスト用のOAuth state情報
 */
export const COMMON_OAUTH_STATE_INFO = {
  SESSION_ID: "test-session-id-12345",
  STATE: "test-oauth-state-67890",
  NONCE: "test-nonce-abcdef",
  CODE_VERIFIER: "test-code-verifier-xyz"
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
    codeVerifier: COMMON_OAUTH_STATE_INFO.CODE_VERIFIER,
    expiresAt,
    createdAt: now
  } satisfies typeof oauthState.$inferInsert;
};
