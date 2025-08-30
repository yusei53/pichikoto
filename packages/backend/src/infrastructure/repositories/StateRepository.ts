import { eq, lt } from "drizzle-orm";
import { injectable } from "inversify";
import { oauthState as oauthStateSchema } from "../../infrastructure/database/schema";
import { db } from "../database/connection";

export interface StateRepositoryInterface {
  save(
    sessionId: string,
    state: string,
    nonce: string,
    expiresAt: Date
  ): Promise<void>;
  getBySessionId(sessionId: string): Promise<{
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
  async save(
    sessionId: string,
    state: string,
    nonce: string,
    expiresAt: Date
  ): Promise<void> {
    await db.insert(oauthStateSchema).values({
      sessionId,
      state,
      nonce,
      expiresAt
    });
  }

  async getBySessionId(sessionId: string): Promise<{
    sessionId: string;
    state: string;
    nonce: string;
    expiresAt: Date;
  } | null> {
    const stateRecord = await db.query.oauthState.findFirst({
      where: eq(oauthStateSchema.sessionId, sessionId)
    });

    if (!stateRecord) return null;

    return {
      sessionId: stateRecord.sessionId,
      state: stateRecord.state,
      nonce: stateRecord.nonce,
      expiresAt: stateRecord.expiresAt
    };
  }

  async delete(sessionId: string): Promise<void> {
    await db
      .delete(oauthStateSchema)
      .where(eq(oauthStateSchema.sessionId, sessionId));
  }

  async cleanup(): Promise<void> {
    await db
      .delete(oauthStateSchema)
      .where(lt(oauthStateSchema.expiresAt, new Date()));
  }
}
