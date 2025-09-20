import type { oauthState } from "../../../database/schema";
import { UUID } from "@pichikoto/core/utils";

/**
 * 一意性を保証するランダムな文字列を生成するヘルパー関数
 * UUIDを使用してユニーク制約違反を防ぐ
 */
const generateUniqueRandomString = (prefix: string): string => {
  return `${prefix}-${UUID.new().value}`;
};

/**
 * 基本的なOAuth stateのfixture
 * sessionIdとstateは毎回ランダムに生成される
 */
export const createOauthStateTableFixture = () => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1時間後

  return {
    sessionId: UUID.new().value,
    state: generateUniqueRandomString("oauth-state"),
    nonce: generateUniqueRandomString("nonce"),
    codeVerifier: generateUniqueRandomString("code-verifier"),
    expiresAt,
    createdAt: now
  } satisfies typeof oauthState.$inferInsert;
};

export const createOauthStateTableFixtureWithExpired = () => {
  const now = new Date();
  const expiresAt = new Date(Date.now() - 60 * 60 * 1000); // 1時間前（期限切れ）

  return {
    sessionId: UUID.new().value,
    state: generateUniqueRandomString("oauth-state"),
    nonce: generateUniqueRandomString("nonce"),
    codeVerifier: generateUniqueRandomString("code-verifier"),
    expiresAt,
    createdAt: now
  } satisfies typeof oauthState.$inferInsert;
};
