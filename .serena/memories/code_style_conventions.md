# コードスタイル・規約

## 言語・フレームワーク規約
- TypeScript（厳格な型付け）
- ESLint + Prettier設定済み
- class-based実装（interfaceは使用しない）
- 依存性注入パターン（Inversify使用）

## バックエンド規約
- Clean Architecture/DDDパターン厳守
- コンストラクタインジェクション
- クラスベース実装（interfaceなし）
- テスト容易性を考慮した設計
- ディレクトリ構成:
  - domain/: models, services, events, repositories
  - application/: usecases, dtos, services
  - infrastructure/: orm, config, events
  - presentation/: controllers, routes, middleware

## フロントエンド規約
- Next.js App Router使用
- feature-based組織化
- Radix UI + Tailwind CSS
- Storybook駆動開発

## データベース
- Drizzle ORMを使用
- PostgreSQL
- マイグレーション管理あり

## 一般規則
- 日本語でコメント・ドキュメント作成
- セキュリティベストプラクティス遵守
- 機密情報のログ・コミット禁止