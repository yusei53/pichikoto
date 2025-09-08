import { afterEach, describe, expect, it } from "vitest";
import * as schema from "../../../database/schema";
import { DiscordOAuthFlowService } from "../../../src/application/services/discord-auth/DiscordOAuthFlowService";
import { StateRepository } from "../../../src/infrastructure/repositories/StateRepository";
import {
  createOauthStateTableFixture,
  createOauthStateTableFixtureWithExpired
} from "../../testing/table_fixture/OauthStateTableFixture";
import { expectErr, expectOk } from "../../testing/utils/AssertResult";
import {
  deleteFromDatabase,
  insertToDatabase,
  selectOneFromDatabase
} from "../../testing/utils/GenericTableHelper";

describe("DiscordOAuthFlowService Tests", () => {
  const discordOAuthFlowService = new DiscordOAuthFlowService(
    new StateRepository()
  );

  const setupSingleOauthState = async () => {
    const state1 = createOauthStateTableFixture();
    await insertToDatabase(schema.oauthState, state1);

    return { state1 };
  };

  const setupExpiredOauthState = async () => {
    const expiredState = createOauthStateTableFixtureWithExpired();
    await insertToDatabase(schema.oauthState, expiredState);

    return { expiredState };
  };

  afterEach(async () => {
    await deleteFromDatabase(schema.oauthState);
  });

  describe("verifyStateBySessionID", () => {
    /**
     * 正常ケース：有効なstate検証のテストケース
     *
     * @description 有効なセッションIDとstateパラメータで検証が成功することを確認
     *
     * **Arrange（準備）**
     * - 有効なstateレコードをリポジトリに保存
     * - 将来の有効期限を設定
     *
     * **Act（実行）**
     * - verifyStateBySessionIDメソッドを実行
     *
     * **Assert（検証）**
     * - 成功結果の返却確認
     * - nonce/codeVerifierの正しい値確認
     * - 検証後のレコード削除確認
     */
    it("有効なセッションIDとstateで検証が成功し、正しいnonce/codeVerifierが返されること", async () => {
      // Arrange
      const { state1 } = await setupSingleOauthState();
      const expected = {
        nonce: state1.nonce,
        codeVerifier: state1.codeVerifier
      };

      // Act
      const result = await discordOAuthFlowService.verifyStateBySessionID(
        state1.sessionId,
        state1.state
      );

      // Assert
      const value = expectOk(result);
      expect(value).toEqual(expected);

      const actualRecord = await getOauthStateRecord();
      expect(actualRecord).toBeNull();
    });
  });

  /**
   * エラーケース：存在しないセッションIDのテストケース
   *
   * @description 存在しないセッションIDで適切なエラーが返されることを確認
   */
  it("存在しないセッションIDの場合はStateNotFoundErrorが返されること", async () => {
    // Arrange
    const { state1 } = await setupSingleOauthState();
    const nonExistentSessionId = "non-existent-session-id";

    // Act
    const result = await discordOAuthFlowService.verifyStateBySessionID(
      nonExistentSessionId,
      state1.state
    );

    // Assert
    const error = expectErr(result);
    expect(error.name).toBe("StateNotFoundError");
    expect(error.message).toBe(
      `State record not found for sessionID: ${nonExistentSessionId}`
    );

    const actualRecord = await getOauthStateRecord();
    expect(actualRecord).not.toBeNull();
  });

  /**
   * エラーケース：stateパラメータ不一致のテストケース
   *
   * @description stateパラメータが一致しない場合の適切なエラー処理確認
   */
  it("stateパラメータが一致しない場合はStateMismatchErrorが返され、レコードが削除されること", async () => {
    // Arrange
    const { state1 } = await setupSingleOauthState();
    const wrongState = "wrong-state-value";

    // Act
    const result = await discordOAuthFlowService.verifyStateBySessionID(
      state1.sessionId,
      wrongState
    );

    // Assert
    const error = expectErr(result);
    expect(error.name).toBe("StateMismatchError");
    expect(error.message).toBe("Provided state does not match stored state");

    const actualRecord = await getOauthStateRecord();
    expect(actualRecord).toBeNull();
  });

  /**
   * エラーケース：有効期限切れのテストケース
   *
   * @description 有効期限が切れたstateレコードの適切な処理確認
   */
  it("有効期限が切れている場合はStateExpiredErrorが返され、レコードが削除されること", async () => {
    // Arrange
    const { expiredState } = await setupExpiredOauthState();

    // Act
    const result = await discordOAuthFlowService.verifyStateBySessionID(
      expiredState.sessionId,
      expiredState.state
    );

    // Assert
    const error = expectErr(result);
    expect(error.name).toBe("StateExpiredError");
    expect(error.message).toBe("State has expired");

    const actualRecord = await getOauthStateRecord();
    expect(actualRecord).toBeNull();
  });
});

/**
 * OAuthStateテーブルからレコードを取得するヘルパー関数
 */
const getOauthStateRecord = async (): Promise<
  typeof schema.oauthState.$inferSelect | null
> => {
  return (await selectOneFromDatabase(
    schema.oauthState
  )) as typeof schema.oauthState.$inferSelect;
};
