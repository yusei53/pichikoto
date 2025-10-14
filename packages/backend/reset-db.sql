-- データベースリセット用SQLファイル
-- 既存のテーブルを削除して新しいスキーマで再作成

-- 外部キー制約があるため、順序に注意して削除
DROP TABLE IF EXISTS "appreciation_receivers" CASCADE;
DROP TABLE IF EXISTS "appreciations" CASCADE;
DROP TABLE IF EXISTS "discord_tokens" CASCADE;
DROP TABLE IF EXISTS "oauth_state" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- drizzle_migrationsテーブルも削除（マイグレーション履歴をリセット）
DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE;
