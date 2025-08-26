import { eq, lt } from "drizzle-orm";
import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/config/types";
import type { DbClientInterface } from "../../infrastructure/database/connection";
import { oauthState as oauthStateSchema } from "../../infrastructure/database/schema";

export interface StateRepositoryInterface {
  save(
    sessionId: string,
    state: string,
    nonce: string,
    expiresAt: Date
  ): Promise<void>;
  getBySessionId(
    sessionId: string
  ): Promise<{
    sessionId: string;
    state: string;
    nonce: string;
    expiresAt: Date;
  } | null>;
  delete(sessionId: string): Promise<void>;
  cleanup(): Promise<void>;
}

@injectable()
export class StateRepository implements StateRepositoryInterface {
  constructor(
    @inject(TYPES.DbClient)
    private readonly dbClient: DbClientInterface
  ) {}

  async save(
    sessionId: string,
    state: string,
    nonce: string,
    expiresAt: Date
  ): Promise<void> {
    const db = this.dbClient.getDb();
    await db.insert(oauthStateSchema).values({
      sessionId,
      state,
      nonce,
      expiresAt
    });
  }

  async getBySessionId(
    sessionId: string
  ): Promise<{
    sessionId: string;
    state: string;
    nonce: string;
    expiresAt: Date;
  } | null> {
    const db = this.dbClient.getDb();

    const stateRecords = await db
      .select()
      .from(oauthStateSchema)
      .where(eq(oauthStateSchema.sessionId, sessionId))
      .limit(1);

    const stateRecord = stateRecords[0];
    if (!stateRecord) {
      return null;
    }

    return {
      sessionId: stateRecord.sessionId,
      state: stateRecord.state,
      nonce: stateRecord.nonce,
      expiresAt: stateRecord.expiresAt
    };
  }

  async delete(sessionId: string): Promise<void> {
    const db = this.dbClient.getDb();
    await db
      .delete(oauthStateSchema)
      .where(eq(oauthStateSchema.sessionId, sessionId));
  }

  async cleanup(): Promise<void> {
    const db = this.dbClient.getDb();
    await db
      .delete(oauthStateSchema)
      .where(lt(oauthStateSchema.expiresAt, new Date()));
  }
}
