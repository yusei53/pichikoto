#!/usr/bin/env tsx

import { exec } from "child_process";
import postgres from "postgres";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * テスト環境のデータベースセットアップ
 * テスト実行前に自動でマイグレーションを実行する
 */
export async function setup() {
  try {
    console.log("🧪 Setting up test environment...");

    // テスト環境用のDB接続設定
    const testDatabaseUrl =
      process.env.TEST_DATABASE_URL ||
      process.env.DATABASE_URL ||
      "postgres://postgres:postgres@db.localtest.me:5432/main";

    console.log("📡 Connecting to test database...");

    // テスト用DB接続を作成（テストでは常に直接PostgreSQL接続を使用）
    const sql = postgres(testDatabaseUrl);

    // 接続テスト
    console.log("🔍 Testing database connection...");
    await sql`SELECT 1`;
    console.log("✅ Database connection successful");

    // マイグレーション実行
    console.log("📝 Running test database migrations...");
    const { stdout, stderr } = await execAsync("npx drizzle-kit migrate", {
      env: {
        ...process.env,
        DATABASE_URL: testDatabaseUrl,
        NODE_ENV: "test"
      },
      cwd: process.cwd()
    });

    if (stderr) {
      console.warn("⚠️ Migration warnings:", stderr);
    }
    if (stdout) {
      console.log("📋 Migration output:", stdout);
    }

    console.log("✅ Test database setup completed successfully");

    // テーブルの存在確認
    console.log("🔍 Verifying tables...");
    try {
      const result = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      console.log(
        "📊 Available tables:",
        result.map((r) => r.table_name).join(", ")
      );
    } catch (error) {
      console.warn("⚠️ Could not verify tables:", error);
    }

    // 接続をクリーンアップ
    await sql.end();

    console.log("🎉 Test environment setup complete!");
  } catch (error) {
    console.error("❌ Test setup failed:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack trace:", error.stack);
    }

    throw error; // テストセットアップが失敗した場合はテスト実行を停止
  }
}

/**
 * テスト終了時のクリーンアップ
 */
export async function teardown() {
  console.log("🧹 Test environment teardown completed");
}
