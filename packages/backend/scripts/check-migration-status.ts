import { neon } from "@neondatabase/serverless";
import { readdirSync } from "fs";
import { join } from "path";

interface MigrationStatus {
  localMigrations: string[];
  appliedMigrations: string[];
  pendingMigrations: string[];
  isInSync: boolean;
}

/**
 * データベースのマイグレーション状況を確認するスクリプト
 * ローカルのマイグレーションファイルと本番環境の適用済みマイグレーションを比較
 */
async function checkMigrationStatus(
  databaseUrl?: string
): Promise<MigrationStatus> {
  try {
    console.log("🔍 Checking migration status...");

    const dbUrl = databaseUrl || process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const migrationsDir = join(__dirname, "../drizzle");
    const localMigrations = readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .map((file) => file.replace(".sql", ""))
      .sort();

    console.log(`📁 Local migrations found: ${localMigrations.length}`);
    localMigrations.forEach((migration) => console.log(`  - ${migration}`));

    const sql = neon(dbUrl);

    let appliedMigrations: string[] = [];
    try {
      const migrations = await sql`
        SELECT hash, created_at 
        FROM __drizzle_migrations 
        ORDER BY created_at
      `;
      appliedMigrations = migrations.map((m) => m.hash);
    } catch {
      console.warn(
        "⚠️  Migration table not found. Database might not be initialized."
      );
      appliedMigrations = [];
    }

    console.log(
      `🗄️  Applied migrations in database: ${appliedMigrations.length}`
    );
    appliedMigrations.forEach((migration) => console.log(`  - ${migration}`));

    const pendingMigrations = localMigrations.filter(
      (local) => !appliedMigrations.includes(local)
    );

    const isInSync =
      pendingMigrations.length === 0 &&
      localMigrations.length === appliedMigrations.length;

    const status: MigrationStatus = {
      localMigrations,
      appliedMigrations,
      pendingMigrations,
      isInSync
    };

    console.log("\n📊 Migration Status Summary:");
    console.log(`  Local migrations: ${localMigrations.length}`);
    console.log(`  Applied migrations: ${appliedMigrations.length}`);
    console.log(`  Pending migrations: ${pendingMigrations.length}`);
    console.log(`  In sync: ${isInSync ? "✅ YES" : "❌ NO"}`);

    if (pendingMigrations.length > 0) {
      console.log("\n⚠️  Pending migrations that need to be applied:");
      pendingMigrations.forEach((migration) => console.log(`  - ${migration}`));
    }

    return status;
  } catch (error) {
    console.error("❌ Failed to check migration status:", error);
    throw error;
  }
}

/**
 * スキーマ同期チェック機能
 * 現在のスキーマ定義と実際のデータベース構造を比較
 */
async function checkSchemaSync(databaseUrl?: string): Promise<void> {
  try {
    console.log("\n🔍 Checking schema synchronization...");

    const dbUrl = databaseUrl || process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const sql = neon(dbUrl);

    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name != '__drizzle_migrations'
      ORDER BY table_name
    `;

    const existingTables = tables.map((t) => t.table_name);

    const schemaTables = ["user", "user_auth", "oauth_state"];

    console.log(`📊 Schema tables: ${schemaTables.length}`);
    schemaTables.forEach((table) => console.log(`  - ${table}`));

    console.log(`🗄️  Database tables: ${existingTables.length}`);
    existingTables.forEach((table) => console.log(`  - ${table}`));

    const missingTables = schemaTables.filter(
      (table) => !existingTables.includes(table)
    );

    const extraTables = existingTables.filter(
      (table) => !schemaTables.includes(table)
    );

    console.log("\n📋 Schema Sync Results:");
    if (missingTables.length === 0 && extraTables.length === 0) {
      console.log("✅ Schema is in sync");
    } else {
      console.log("❌ Schema is NOT in sync");

      if (missingTables.length > 0) {
        console.log("  Missing tables in database:");
        missingTables.forEach((table) => console.log(`    - ${table}`));
      }

      if (extraTables.length > 0) {
        console.log("  Extra tables in database:");
        extraTables.forEach((table) => console.log(`    - ${table}`));
      }
    }
  } catch (error) {
    console.error("❌ Failed to check schema sync:", error);
    throw error;
  }
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    const shouldCheckSchema = args.includes("--schema");
    const targetEnv = args
      .find((arg) => arg.startsWith("--env="))
      ?.split("=")[1];

    let databaseUrl = process.env.DATABASE_URL;

    // 環境指定がある場合
    if (targetEnv) {
      const envVarName = `DATABASE_URL_${targetEnv.toUpperCase()}`;
      databaseUrl = process.env[envVarName] || process.env.DATABASE_URL;
      console.log(`🎯 Checking ${targetEnv} environment`);
    }

    // マイグレーション状況チェック
    const migrationStatus = await checkMigrationStatus(databaseUrl);

    // スキーマ同期チェック（オプション）
    if (shouldCheckSchema) {
      await checkSchemaSync(databaseUrl);
    }

    // 終了コード設定
    if (!migrationStatus.isInSync) {
      console.log("\n❌ Migration status check failed");
      process.exit(1);
    } else {
      console.log("\n✅ Migration status check passed");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Script execution failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { checkMigrationStatus, checkSchemaSync };
