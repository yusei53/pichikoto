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

export const connectToDatabase = (c: Context) => {
  return createDatabaseConnection({
    DATABASE_URL: c.env.DATABASE_URL,
    NODE_ENV: c.env.NODE_ENV
  });
};

// ref: https://neon.com/guides/local-development-with-neon
const createDatabaseConnection = (envVars: {
  DATABASE_URL: string;
  NODE_ENV: string;
}) => {
  let connectionString = envVars.DATABASE_URL;

  if (envVars.NODE_ENV === "development") {
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

  if (!connectionString) {
    connectionString = "postgres://postgres:postgres@db.localtest.me:5432/main";
  }

  const sql = neon(connectionString);
  return drizzle(sql, { schema });
};

const getEnvVar = (key: string): string | undefined => {
  if (typeof process !== "undefined" && process.env) {
    return process.env[key];
  }
  return undefined;
};

export const db = createDatabaseConnection({
  DATABASE_URL: getEnvVar("DATABASE_URL") || "",
  NODE_ENV: getEnvVar("NODE_ENV") || "development"
});

export type DbType = typeof db;
