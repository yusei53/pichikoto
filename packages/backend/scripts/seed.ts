#!/usr/bin/env tsx

import { v4 as uuidv4 } from "uuid";
import { db } from "../database/client";
import * as schema from "../database/schema";

/**
 * ローカルDBにseedデータを投入するスクリプト
 */
async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // 開発環境用のデフォルト設定
    if (!process.env.DATABASE_URL && process.env.NODE_ENV === "development") {
      process.env.DATABASE_URL =
        "postgres://postgres:postgres@db.localtest.me:5432/main";
      console.log("🔧 Using default development database URL");
    }

    console.log("📡 Connecting to database...");
    const database = db();
    console.log("✅ Database connection successful");

    // 既存データの削除（開発環境のみ）
    console.log("🧹 Cleaning existing data...");
    await database.delete(schema.appreciationReceivers);
    await database.delete(schema.appreciations);
    await database.delete(schema.oauthState);
    await database.delete(schema.discordTokens);
    await database.delete(schema.user);
    console.log("✅ Existing data cleaned");

    // Seedデータの生成と投入
    console.log("📝 Inserting seed data...");

    // 1. ユーザーデータの投入
    const users = generateUsers(6);
    await database.insert(schema.user).values(users);
    console.log(`✅ Inserted ${users.length} users`);

    // 2. Discord トークンデータの投入
    const discordTokens = generateDiscordTokens(users);
    await database.insert(schema.discordTokens).values(discordTokens);
    console.log(`✅ Inserted ${discordTokens.length} discord tokens`);

    // 3. OAuth ステートデータの投入
    const oauthStates = generateOAuthStates(5);
    await database.insert(schema.oauthState).values(oauthStates);
    console.log(`✅ Inserted ${oauthStates.length} oauth states`);

    // 4. 感謝データの投入
    const appreciations = generateAppreciations(users, 6);
    await database.insert(schema.appreciations).values(appreciations);
    console.log(`✅ Inserted ${appreciations.length} appreciations`);

    // 5. 感謝受信者データの投入
    const appreciationReceivers = generateAppreciationReceivers(
      appreciations,
      users
    );
    await database
      .insert(schema.appreciationReceivers)
      .values(appreciationReceivers);
    console.log(
      `✅ Inserted ${appreciationReceivers.length} appreciation receivers`
    );

    console.log("🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack trace:", error.stack);
    }

    process.exit(1);
  }
}

/**
 * ユーザーデータを生成
 */
function generateUsers(count: number) {
  const users = [];
  const sampleNames = [
    "tanaka_taro",
    "sato_hanako",
    "suzuki_ichiro",
    "takahashi_misaki",
    "watanabe_kenta",
    "yamada_aiko"
  ];
  const sampleGlobalNames = [
    "田中太郎",
    "佐藤花子",
    "鈴木一郎",
    "高橋美咲",
    "渡辺健太",
    null // 最後の1人はnull
  ];
  const sampleAvatars = [
    "https://cdn.discordapp.com/avatars/123456789/avatar1.png",
    "https://cdn.discordapp.com/avatars/234567890/avatar2.png",
    "https://cdn.discordapp.com/avatars/345678901/avatar3.png",
    "https://cdn.discordapp.com/avatars/456789012/avatar4.png",
    "https://cdn.discordapp.com/avatars/567890123/avatar5.png",
    "https://cdn.discordapp.com/avatars/678901234/avatar6.png"
  ];

  for (let i = 0; i < count; i++) {
    users.push({
      discordUserId: `${123456789 + i}`,
      discordUserName: sampleNames[i] || `ユーザー${i + 1}`,
      discordGlobalName:
        sampleGlobalNames[i] || (i === count - 1 ? null : `user_${i + 1}`),
      discordAvatar:
        sampleAvatars[i] ||
        `https://cdn.discordapp.com/avatars/${123456789 + i}/default.png`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // 過去30日以内のランダムな日時
    });
  }

  return users;
}

/**
 * Discord トークンデータを生成
 */
function generateDiscordTokens(users: any[]) {
  return users.map((user) => ({
    discordUserId: user.discordUserId,
    accessToken: `access_token_${Math.random().toString(36).substring(2)}`,
    refreshToken: `refresh_token_${Math.random().toString(36).substring(2)}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後
    scope: "identify email guilds",
    tokenType: "Bearer",
    createdAt: new Date()
  }));
}

/**
 * OAuth ステートデータを生成
 */
function generateOAuthStates(count: number) {
  const states = [];

  for (let i = 0; i < count; i++) {
    states.push({
      sessionId: `session_${Math.random().toString(36).substring(2)}`,
      state: `state_${Math.random().toString(36).substring(2)}`,
      nonce: `nonce_${Math.random().toString(36).substring(2)}`,
      codeVerifier: `code_verifier_${Math.random().toString(36).substring(2)}`,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10分後
      createdAt: new Date()
    });
  }

  return states;
}

/**
 * 感謝データを生成
 */
function generateAppreciations(users: any[], count: number) {
  const appreciations = [];
  const sampleMessages = [
    "いつもお疲れ様です！プロジェクトの進行がスムーズで助かっています。",
    "素晴らしいアイデアをありがとうございました。チーム全体のモチベーションが上がりました。",
    "困った時にいつもサポートしてくれてありがとうございます。",
    "丁寧なレビューをありがとうございました。とても勉強になりました。",
    "チームワークを大切にしてくれてありがとうございます。",
    "新しい技術の共有をありがとうございました。とても参考になりました。"
  ];

  for (let i = 0; i < count; i++) {
    appreciations.push({
      id: uuidv4(),
      senderId: users[Math.floor(Math.random() * users.length)].discordUserId,
      message: sampleMessages[i] || `感謝のメッセージ ${i + 1}`,
      pointPerReceiver: Math.floor(Math.random() * 120) + 1, // 1-120のランダム
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // 過去7日以内
    });
  }

  return appreciations;
}

/**
 * 感謝受信者データを生成
 */
function generateAppreciationReceivers(appreciations: any[], users: any[]) {
  const receivers: Array<{
    id: string;
    appreciationId: string;
    receiverId: string;
    createdAt: Date;
  }> = [];

  appreciations.forEach((appreciation) => {
    // 各感謝に対して1-3人のランダムな受信者を設定
    const receiverCount = Math.floor(Math.random() * 3) + 1;
    const selectedUsers = [...users]
      .filter((user) => user.discordUserId !== appreciation.senderId) // 送信者は除外
      .sort(() => 0.5 - Math.random())
      .slice(0, receiverCount);

    selectedUsers.forEach((user) => {
      receivers.push({
        id: uuidv4(),
        appreciationId: appreciation.id,
        receiverId: user.discordUserId,
        createdAt: new Date()
      });
    });
  });

  return receivers;
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
