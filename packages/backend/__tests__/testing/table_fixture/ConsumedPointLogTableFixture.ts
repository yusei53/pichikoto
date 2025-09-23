import type { consumedPointLog } from "../../../database/schema";
import { UUID } from "../../../src/utils/UUID";

/**
 * ConsumedPointLogのfixture
 */
export const createConsumedPointLogTableFixture = () => {
  return {
    id: UUID.new().value,
    userId: UUID.new().value,
    appreciationId: UUID.new().value,
    weekStartDate: "2025-01-01", // YYYY-MM-DD形式
    consumedPoints: 50,
    createdAt: new Date()
  } satisfies typeof consumedPointLog.$inferInsert;
};

/**
 * 特定の値でConsumedPointLogのfixtureを作成
 */
export const createConsumedPointLogTableFixtureWith = (
  overrides: Partial<typeof consumedPointLog.$inferInsert>
) => {
  return {
    ...createConsumedPointLogTableFixture(),
    ...overrides
  } satisfies typeof consumedPointLog.$inferInsert;
};
