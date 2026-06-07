/**
 * Instagram への自動投稿（Meta Graph API 経由）
 *
 * 事前準備:
 * 1. Meta Developers でアプリ作成 → Instagram Basic Display API / Graph API 追加
 * 2. Instagram プロアカウントと Facebook ページを連携
 * 3. INSTAGRAM_ACCESS_TOKEN と INSTAGRAM_ACCOUNT_ID を .env に設定
 *
 * 注意: Instagramへの画像投稿にはOGP画像のURLが必要（公開済みURLのみ可）
 * → はてなブログに投稿した記事のOGP URLを使うか、Cloudinaryにアップロードする
 */
import type { Article } from "./generate.js";

const BASE_URL = "https://graph.facebook.com/v19.0";

export async function postToInstagram(
  article: Article,
  imageUrl: string,
  hashtags: string[]
): Promise<void> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;

  if (!accessToken || !accountId) {
    console.log("   ⏭ Instagram スキップ（INSTAGRAM_ACCESS_TOKEN/ACCOUNT_ID 未設定）");
    return;
  }

  const tags = hashtags.slice(0, 10).map((t) => `#${t}`).join(" ");
  const caption = `${article.title}\n\n${tags}\n\nプロフィールのリンクから記事を読む👆`;

  // Step1: メディアコンテナ作成
  const containerRes = await fetch(`${BASE_URL}/${accountId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: imageUrl,
      caption: caption.slice(0, 2200),
      access_token: accessToken,
    }),
  });

  if (!containerRes.ok) {
    const err = await containerRes.text();
    throw new Error(`Instagram コンテナ作成失敗: ${err}`);
  }

  const { id: creationId } = (await containerRes.json()) as { id: string };

  // Step2: 公開（少し待機してから）
  await new Promise((r) => setTimeout(r, 3000));

  const publishRes = await fetch(`${BASE_URL}/${accountId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: creationId,
      access_token: accessToken,
    }),
  });

  if (!publishRes.ok) {
    const err = await publishRes.text();
    throw new Error(`Instagram 公開失敗: ${err}`);
  }

  console.log(`   ✅ Instagram に投稿完了`);
}
