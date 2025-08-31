import { afterEach, describe, expect, it } from "vitest";
import * as schema from "../../../src/infrastructure/database/schema";
import { StateRepository } from "../../../src/infrastructure/repositories/StateRepository";
import { assertEqualOauthStateTable } from "../../testing/table_assert/AssertEqualOauthStateTable";
import { createOauthStateTableFixture } from "../../testing/table_fixture/OauthStateTableFixture";
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
        codeVerifier: stateRecord.codeVerifier ?? null,
        expiresAt: stateRecord.expiresAt
      };

      // act
      await stateRepository.save(
        stateRecord.sessionId,
        stateRecord.state,
        stateRecord.nonce,
        stateRecord.codeVerifier!,
        stateRecord.expiresAt
      );

      // assert
      const actualRecord = (await selectOneFromDatabase(
        schema.oauthState
      )) as typeof schema.oauthState.$inferSelect;
      assertEqualOauthStateTable(expectedState, actualRecord);
    });
  });

  describe("findBy", () => {
    const setupOauthStates = async () => {
      const state1 = createOauthStateTableFixture();
      await insertToDatabase(schema.oauthState, state1);

      return { state1 };
    };

    afterEach(async () => {
      await deleteFromDatabase(schema.oauthState);
    });

    it("存在するsessionIdでOAuth stateを取得できること", async () => {
      // arrange
      const { state1 } = await setupOauthStates();

      // act
      const actual = await stateRepository.findBy(state1.sessionId);

      // assert
      expect(actual).toEqual({
        sessionId: state1.sessionId,
        state: state1.state,
        nonce: state1.nonce,
        codeVerifier: state1.codeVerifier ?? null,
        expiresAt: state1.expiresAt
      });
    });

    it("存在しないsessionIdの場合はnullを返すこと", async () => {
      // arrange
      const nonExistentSessionId = "non-existent-session-id";

      // act
      const actual = await stateRepository.findBy(nonExistentSessionId);

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
      const actual = await stateRepository.findBy(stateRecord.sessionId);
      expect(actual).toBeNull();
    });
  });
});
