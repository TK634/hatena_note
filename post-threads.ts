/**
 * Threads (Meta) への自動投稿
 *
 * 事前準備:
 * 1. Meta Developers でアプリ作成 → Threads API を追加
 * 2. THREADS_ACCESS_TOKEN と THREADS_USER_ID を .env に設定
 * 参考: https://developers.facebook.com/docs/threads
 */
import type { Article } from "./generate.js";

const BASE_URL = "https://graph.threads.net/v1.0";

export async function postToThreads(
  article: Article,
  blogUrl: string,
  hashtags: string[]
): Promise<void> {
  const accessToken = process.env.THREADS_ACCESS_TOKEN;
  const userId = process.env.THREADS_USER_ID;

  if (!accessToken || !userId) {
    console.log("   ⏭ Threads スキップ（THREADS_ACCESS_TOKEN/USER_ID 未設定）");
    return;
  }

  const tags = hashtags.slice(0, 5).map((t) => `#${t}`).join(" ");
  const text = `【新着記事】${article.title}\n\n${tags}\n\n${blogUrl}`;

  // Step1: コンテナ作成
  const containerRes = await fetch(
    `${BASE_URL}/${userId}/threads?` +
      new URLSearchParams({
        media_type: "TEXT",
        text: text.slice(0, 500),
        access_token: accessToken,
      }),
    { method: "POST" }
  );

  if (!containerRes.ok) {
    const err = await containerRes.text();
    throw new Error(`Threads コンテナ作成失敗: ${err}`);
  }

  const { id: containerId } = (await containerRes.json()) as { id: string };

  // Step2: 公開
  const publishRes = await fetch(
    `${BASE_URL}/${userId}/threads_publish?` +
      new URLSearchParams({
        creation_id: containerId,
        access_token: accessToken,
      }),
    { method: "POST" }
  );

  if (!publishRes.ok) {
    const err = await publishRes.text();
    throw new Error(`Threads 公開失敗: ${err}`);
  }

  console.log(`   ✅ Threads に投稿完了`);
}
