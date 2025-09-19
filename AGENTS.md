# Repository Guidelines

本ドキュメントおよび本リポジトリでのやり取りは、必ず日本語で行ってください。

## プロジェクト構成 / モジュール
- ルート: pnpm ワークスペース + Turborepo。
- `packages/backend`: Cloudflare Workers (Hono + TypeScript)／Drizzle ORM。
  - `src/`: 実装, `__tests__/`: テスト, `drizzle/`: スキーマ/マイグレーション, `scripts/`: ユーティリティ。
- `packages/frontend`: UI（本件では起動不要）。
- `.devcontainer/`: ルートの Dev Container（backend + Postgres）。
- 主要設定: `turbo.json`, `pnpm-workspace.yaml`, `packages/backend/wrangler.jsonc`。

## 開発・ビルド・テスト
- 全体開発: `pnpm dev`（Turbo）。バックエンドのみ: `pnpm --filter backend dev`（8787）。
- ビルド: `pnpm --filter backend build`（tsc）。
- テスト: `pnpm --filter backend test`／カバレッジ: `pnpm --filter backend test:coverage`。
- Lint/整形: `pnpm --filter backend lint`／`lint:fix`、ルート整形: `pnpm format`。
- DB (Drizzle): `db:generate` → `db:migrate` → `db:studio`。
- デプロイ: `pnpm --filter backend deploy`。

## コーディング規約 / 命名
- 言語: TypeScript。ESLint + Prettier を使用。
- インデント等は Prettier 準拠。PR 前に `pnpm format` を実行。
- 命名: ファイル/ディレクトリは kebab-case、変数 camelCase、型/インターフェース PascalCase、定数 UPPER_SNAKE。

## テスト指針
- フレームワーク: Vitest。`packages/backend/__tests__` もしくは隣接配置。
- 命名: 単体 `*.test.ts`、統合 `*.spec.ts`（任意）。
- 重要領域（ルート/サービス/スキーマ）の網羅性を重視。

## コミット / PR ガイド
- コミットは命令形で簡潔に（例: `backend: add auth route`）。
- PR は目的/変更点/テスト方法を明記。関連 Issue をリンク。UI 変更はスクショ、DB 変更はマイグレーション有無を記載。

## セキュリティ / 設定
- 秘密情報はコミット禁止。`packages/backend/.dev.vars` とローカル `.env` を使用。
- Dev Container で Postgres を同梱。`DATABASE_URL` は注入されます。開発前にマイグレーションを実行。
- 型生成: `pnpm --filter backend cf-typegen` または `typegen`。

## Dev Container / ローカルDB
- ルートで Dev Container を開く。サービス: `app` + `postgres`。
- ポート: 8787 (Wrangler), 5555 (Drizzle Studio), 5432 (Postgres)。
- コンテナ内でバックエンド起動: `pnpm --filter backend dev`。
