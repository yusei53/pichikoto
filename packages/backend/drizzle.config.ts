import { defineConfig } from "drizzle-kit";

// NOTE: ローカル開発環境またはCI/CD環境でのマイグレーション実行を制御
const isCIEnvironment =
  process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

const getDatabaseUrl = () => {
  if (isCIEnvironment && process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  } else if (!isCIEnvironment) {
    return "postgres://postgres:postgres@db.localtest.me:5432/main";
  } else {
    throw new Error("CI環境ではDATABASE_URL環境変数が必要です");
  }
};

export default defineConfig({
  schema: "./src/infrastructure/database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl()
  }
});
