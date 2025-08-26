#!/usr/bin/env tsx

import { neon } from "@neondatabase/serverless";
import { exec } from "child_process";
import { drizzle } from "drizzle-orm/neon-http";
import { promisify } from "util";
import * as schema from "../src/infrastructure/database/schema";

const execAsync = promisify(exec);

/**
 * データベースマイグレーションを実行するスクリプト
 * CI/CD環境での安全なマイグレーション実行を目的とする
 */
async function runMigration() {
  try {
    console.log("🚀 Starting database migration...");

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    console.log("📡 Connecting to database...");

    // データベース接続のテスト
    const sql = neon(databaseUrl);
    drizzle(sql, { schema });

    // 接続テスト
    await sql`SELECT 1`;
    console.log("✅ Database connection successful");

    // マイグレーション実行
    console.log("📝 Running migrations...");
    const { stdout, stderr } = await execAsync("npx drizzle-kit migrate", {
      env: { ...process.env, DATABASE_URL: databaseUrl }
    });

    if (stderr) {
      console.warn("Migration warnings:", stderr);
    }
    if (stdout) {
      console.log("Migration output:", stdout);
    }

    console.log("✅ Migration completed successfully");

    // マイグレーション後の検証（必要に応じて追加）
    console.log("🔍 Verifying migration...");
    // 例: テーブルの存在確認など

    console.log("🎉 All migration tasks completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack trace:", error.stack);
    }

    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  runMigration();
}

export { runMigration };
