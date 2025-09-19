import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/__tests__/**/*.test.ts"],
    globalSetup: ["./__tests__/setup/test-setup.ts"],
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    coverage: {
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["**/node_modules/**", "**/dist/**"]
    }
  }
});
