import { exec } from "child_process";
import postgres from "postgres";
import { promisify } from "util";

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgres://postgres:postgres@db.localtest.me:5432/main";

const execAsync = promisify(exec);

/**
 * テスト環境のデータベースセットアップ
 * テスト実行前に自動でマイグレーションを実行する
 * テスト環境でマイグレーションが成功したかどうかを確認しやすいようにするために、
 * テーブルの存在確認や詳細なログ出力を行っている。
 */
export async function setup() {
  try {
    console.log("📡 Connecting to test database...");

    const sql = postgres(TEST_DATABASE_URL);

    console.log("🔍 Testing database connection...");

    await sql`SELECT 1`;
    console.log("✅ Database connection successful");

    console.log("📝 Running test database migrations...");
    const { stdout, stderr } = await execAsync("npx drizzle-kit migrate", {
      env: {
        ...process.env,
        DATABASE_URL: TEST_DATABASE_URL,
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

    await sql.end();

    console.log("🎉 Test environment setup complete!");
  } catch (error) {
    console.error("❌ Test setup failed:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack trace:", error.stack);
    }

    throw error;
  }
}
