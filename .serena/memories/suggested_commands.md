# 開発用推奨コマンド

## ルートレベル（Turbo orchestration）
```bash
pnpm dev              # 全開発サーバー起動
pnpm build            # 全パッケージビルド（禁止されている場合あり）
pnpm lint             # 全パッケージリント
pnpm format           # lint:fix + prettier実行
pnpm test-storybook   # Storybookテスト
```

## バックエンド（packages/backend）
```bash
pnpm dev              # Wrangler dev server起動
pnpm test             # Vitestテスト実行
pnpm test:watch       # テストウォッチモード
pnpm test:coverage    # カバレッジ付きテスト
pnpm lint             # ESLint
pnpm lint:fix         # ESLint自動修正
pnpm db:generate      # Drizzleスキーマ生成
pnpm db:migrate       # DBマイグレーション
pnpm db:studio        # Drizzle Studio起動
pnpm deploy           # Cloudflareデプロイ
```

## フロントエンド（packages/frontend）
```bash
pnpm dev              # Next.js dev server (Turbopack)
pnpm lint             # Next.js ESLint
pnpm lint:fix         # Next.js ESLint自動修正
pnpm storybook        # Storybook dev server
pnpm build-storybook  # Storybookビルド
pnpm test-storybook   # Storybookテスト
```

## 重要な注意事項
- **IMPORTANT: buildコマンド（pnpm build、npm run build、tsc）は絶対に実行禁止**
- パッケージマネージャーはpnpmを使用
- コミット前にlintを実行する