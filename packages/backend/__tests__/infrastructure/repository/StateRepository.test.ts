import { afterEach, describe, expect, it } from "vitest";
import * as schema from "../../../src/infrastructure/database/schema";
import { StateRepository } from "../../../src/infrastructure/repositories/StateRepository";
import { assertEqualOauthStateTable } from "../../testing/table_assert/AssertEqualOauthStateTable";
import {
  createOauthStateTableFixture,
  createOauthStateTableFixtureWithCustomSessionId,
  createExpiredOauthStateTableFixture
} from "../../testing/table_fixture/OauthStateTableFixture";
import {
  deleteFromDatabase,
  insertToDatabase,
  selectOneFromDatabase
} from "../../testing/utils/GenericTableHelper";

describe("StateRepository Tests", () => {
  const stateRepository = new StateRepository();

  describe("save", () => {
    afterEach(async () => {
      await deleteFromDatabase(schema.oauthState);
    });

    it("OAuth stateを保存できること", async () => {
      // arrange
      const stateRecord = createOauthStateTableFixture();
      const expectedState = {
        sessionId: stateRecord.sessionId,
        state: stateRecord.state,
        nonce: stateRecord.nonce,
        expiresAt: stateRecord.expiresAt
      };

      // act
      await stateRepository.save(
        stateRecord.sessionId,
        stateRecord.state,
        stateRecord.nonce,
        stateRecord.expiresAt
      );

      // assert
      const actualRecord = (await selectOneFromDatabase(
        schema.oauthState
      )) as typeof schema.oauthState.$inferSelect;
      assertEqualOauthStateTable(expectedState, actualRecord);
    });
  });

  describe("getBySessionId", () => {
    const setupOauthStates = async () => {
      const state1 = createOauthStateTableFixture();
      await insertToDatabase(schema.oauthState, state1);

      const state2 = createOauthStateTableFixtureWithCustomSessionId("session-2");
      await insertToDatabase(schema.oauthState, state2);

      return { state1, state2 };
    };

    afterEach(async () => {
      await deleteFromDatabase(schema.oauthState);
    });

    it("存在するsessionIdでOAuth stateを取得できること", async () => {
      // arrange
      const { state1 } = await setupOauthStates();

      // act
      const actual = await stateRepository.getBySessionId(state1.sessionId);

      // assert
      expect(actual).not.toBeNull();
      expect(actual).toEqual({
        sessionId: state1.sessionId,
        state: state1.state,
        nonce: state1.nonce,
        expiresAt: state1.expiresAt
      });
    });

    it("存在しないsessionIdの場合はnullを返すこと", async () => {
      // arrange
      const nonExistentSessionId = "non-existent-session-id";

      // act
      const actual = await stateRepository.getBySessionId(nonExistentSessionId);

      // assert
      expect(actual).toBeNull();
    });
  });

  describe("delete", () => {
    afterEach(async () => {
      await deleteFromDatabase(schema.oauthState);
    });

    it("指定されたsessionIdのOAuth stateを削除できること", async () => {
      // arrange
      const stateRecord = createOauthStateTableFixture();
      await insertToDatabase(schema.oauthState, stateRecord);

      // act
      await stateRepository.delete(stateRecord.sessionId);

      // assert
      const actual = await stateRepository.getBySessionId(stateRecord.sessionId);
      expect(actual).toBeNull();
    });

    it("存在しないsessionIdを削除しようとしてもエラーにならないこと", async () => {
      // arrange
      const nonExistentSessionId = "non-existent-session-id";

      // act & assert
      await expect(
        stateRepository.delete(nonExistentSessionId)
      ).resolves.not.toThrow();
    });
  });
});