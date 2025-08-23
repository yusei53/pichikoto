# デプロイメント設定

## 自動DBマイグレーション設定

このプロジェクトでは、mainブランチにpushされた際に自動的にデータベースマイグレーションが実行されるように設定されています。

### 必要な環境変数

GitHubのRepository Secretsに以下の環境変数を設定してください：

1. **DATABASE_URL**
   - 本番環境のデータベース接続URL
   - 例: `postgres://username:password@host:port/database`

### 設定ファイル

- **GitHub Actions**: `.github/workflows/db-migration.yml`
- **マイグレーションスクリプト**: `packages/backend/scripts/migrate.ts`

### マイグレーションの流れ

1. mainブランチにコードがpushされる
2. GitHub Actionsが自動的に起動
3. 依存関係のインストール
4. バックエンドのビルド
5. データベース接続の確認
6. Drizzle Kitを使用したマイグレーション実行
7. マイグレーション結果の検証

### ローカルでのマイグレーション実行

```bash
# 通常のマイグレーション
pnpm --filter backend db:migrate

# 安全なマイグレーション（接続テスト付き）
pnpm --filter backend db:migrate:safe
```

### トラブルシューティング

#### マイグレーション失敗時の対応

1. GitHub Actionsのログを確認
2. DATABASE_URLの設定を確認
3. マイグレーションファイルの整合性を確認
4. 必要に応じて手動でロールバックを実行

#### 接続エラーの場合

- DATABASE_URLが正しく設定されているか確認
- データベースサーバーが稼働しているか確認
- ネットワークアクセスが許可されているか確認

### セキュリティ

- DATABASE_URLはGitHub Secretsで管理され、ログには出力されません
- マイグレーション前に接続テストが実行されます
- 失敗時は自動的にプロセスが停止します
