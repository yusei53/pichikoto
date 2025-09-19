# タスク完了時のチェックリスト

## 必須チェック項目
1. **lint実行** - エラーがないことを確認
   ```bash
   pnpm lint
   ```

2. **format実行** - コードフォーマットを統一
   ```bash
   pnpm format
   ```

3. **テスト実行** - 該当する場合
   ```bash
   pnpm test              # バックエンド
   pnpm test-storybook    # フロントエンド
   ```

4. **型チェック** - TypeScriptエラーがないことを確認

## 重要な禁止事項
- **絶対にbuildコマンドを実行しない**
  - pnpm build
  - npm run build 
  - tsc
  - 理由: JSファイル生成でgit差分が見づらくなるため

## データベース関連
- スキーマ変更時: `pnpm db:generate` → `pnpm db:migrate`
- 開発中確認: `pnpm db:studio`

## デプロイ関連
- ユーザーに確認を求めてからのみ実行
- バックエンド: `pnpm deploy`（packages/backend）

## コミット前
- lintエラー解消
- セキュリティチェック（機密情報漏洩防止）