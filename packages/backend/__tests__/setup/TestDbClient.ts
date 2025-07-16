import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import ws from "ws";
import type { DbClientInterface } from "../../src/infrastructure/database/connection";
import * as schema from "../../src/infrastructure/database/schema";

// テスト用のDBクライアント
export class TestDbClient implements DbClientInterface {
  private db: ReturnType<typeof drizzle<typeof schema>>;

  constructor() {
    // テスト用のDB接続設定
    const connectionString =
      process.env.TEST_DATABASE_URL ||
      "postgres://postgres:postgres@db.localtest.me:5432/main";

    // ローカル開発環境（db.localtest.me）の場合のみNeon設定を適用
    if (connectionString.includes("db.localtest.me")) {
      neonConfig.fetchEndpoint = (host) => {
        const [protocol, port] =
          host === "db.localtest.me" ? ["http", 4444] : ["https", 443];
        return `${protocol}://${host}:${port}/sql`;
      };
      neonConfig.useSecureWebSocket = false;
      neonConfig.wsProxy = (host) =>
        host === "db.localtest.me" ? `${host}:4444/v2` : `${host}/v2`;
      neonConfig.webSocketConstructor = ws;
    }

    const sql = neon(connectionString);
    this.db = drizzle(sql, { schema });
  }

  init(): void {
    // テスト用では何もしない
  }

  getDb() {
    return this.db;
  }
}
