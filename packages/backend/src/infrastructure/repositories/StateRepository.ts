import { eq } from "drizzle-orm";
import { injectable } from "inversify";
import { db } from "../../../database/connection";
import { oauthState as oauthStateSchema } from "../../../database/schema";

export interface StateRepositoryInterface {
  save(
    sessionId: string,
    state: string,
    nonce: string,
    codeVerifier: string,
    expiresAt: Date
  ): Promise<void>;
  findBy(sessionId: string): Promise<{
    sessionId: string;
    state: string;
    nonce: string;
    codeVerifier: string;
    expiresAt: Date;
  } | null>;
  delete(sessionId: string): Promise<void>;
}

@injectable()
export class StateRepository implements StateRepositoryInterface {
  async save(
    sessionId: string,
    state: string,
    nonce: string,
    codeVerifier: string,
    expiresAt: Date
  ): Promise<void> {
    await db.insert(oauthStateSchema).values({
      sessionId,
      state,
      nonce,
      codeVerifier,
      expiresAt
    });
  }

  async findBy(sessionId: string): Promise<{
    sessionId: string;
    state: string;
    nonce: string;
    codeVerifier: string;
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
      codeVerifier: stateRecord.codeVerifier,
      expiresAt: stateRecord.expiresAt
    };
  }

  async delete(sessionId: string): Promise<void> {
    await db
      .delete(oauthStateSchema)
      .where(eq(oauthStateSchema.sessionId, sessionId));
  }
}
