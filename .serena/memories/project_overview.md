# プロジェクト概要

## プロジェクトの目的
pnpm monorepo構成のフルスタックアプリケーション。Discord OAuth認証を使った認証システムを含むWebアプリケーション。

## 技術スタック
- **モノレポ管理**: pnpm workspaces + Turbo
- **バックエンド**: 
  - Hono (Cloudflare Workers)
  - Drizzle ORM + PostgreSQL
  - Inversify (DI container)
  - Clean Architecture/DDD パターン
- **フロントエンド**: 
  - Next.js 15 (App Router)
  - React 19
  - Tailwind CSS + Radix UI
  - Storybook (コンポーネント開発)
- **テスト**: Vitest
- **CI/CD**: Cloudflare Workers deployment

## アーキテクチャ
バックエンドはClean Architecture（DDD）を採用:
- domain/: ビジネスロジック
- application/: ユースケース
- infrastructure/: DB・外部サービス
- presentation/: コントローラー・ルーティング