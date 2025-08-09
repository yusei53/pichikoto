import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { Context } from "hono";
import { injectable } from "inversify";
import ws from "ws";
import * as schema from "./schema";

export interface DbClientInterface {
  init(c: Context): void;
  getDb(): ReturnType<typeof connectToDatabase>;
}

@injectable()
export class DbClient implements DbClientInterface {
  private db: ReturnType<typeof connectToDatabase> | null = null;
  private context: Context | null = null;

  public init(c: Context): void {
    this.context = c;
    if (!this.db) {
      this.db = connectToDatabase(c);
    }
  }

  getDb(): ReturnType<typeof connectToDatabase> {
    if (!this.db || !this.context) {
      throw new Error("DbClient not initialized. Call init() first.");
    }
    return this.db;
  }
}

// ref: https://neon.com/guides/local-development-with-neon
export const connectToDatabase = (c: Context) => {
  let connectionString = c.env.DATABASE_URL!;

  // Configuring Neon for local development
  if (c.env.NODE_ENV === "development") {
    connectionString = "postgres://postgres:postgres@db.localtest.me:5432/main";
    neonConfig.fetchEndpoint = (host) => {
      const [protocol, port] =
        host === "db.localtest.me" ? ["http", 4444] : ["https", 443];
      return `${protocol}://${host}:${port}/sql`;
    };
    const connectionStringUrl = new URL(connectionString);
    neonConfig.useSecureWebSocket =
      connectionStringUrl.hostname !== "db.localtest.me";
    neonConfig.wsProxy = (host) =>
      host === "db.localtest.me" ? `${host}:4444/v2` : `${host}/v2`;
  }
  neonConfig.webSocketConstructor = ws;
  const sql = neon(connectionString);

  const db = drizzle(sql, { schema });
  return db;
};
