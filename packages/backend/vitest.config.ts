import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/__tests__/**/*.test.ts"],
    // リポジトリテストのみ順次実行、他は並列実行
    poolMatchGlobs: [
      // リポジトリテストは順次実行
      ["**/__tests__/infrastructure/repository/**/*.test.ts", "forks"],
      // その他のテストは並列実行
      ["**/__tests__/**/*.test.ts", "threads"]
    ],
    poolOptions: {
      forks: {
        singleFork: true // リポジトリテスト：単一プロセスで順次実行
      },
      threads: {
        singleThread: false // その他のテスト：並列実行
      }
    },
    coverage: {
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["**/node_modules/**", "**/dist/**"]
    }
  }
});
