import { chromium } from "playwright";
import type { Article } from "./generate.js";

const NOTE_EMAIL = process.env.NOTE_EMAIL!;
const NOTE_PASSWORD = process.env.NOTE_PASSWORD!;

export async function postToNote(article: Article): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    // ログイン
    console.log("📝 note.comにログイン中...");
    await page.goto("https://note.com/login", { waitUntil: "networkidle" });
    await page.fill('input[name="email"]', NOTE_EMAIL);
    await page.fill('input[name="password"]', NOTE_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: "networkidle", timeout: 15000 });

    // 新規記事作成ページへ
    console.log("✍️  新規記事を作成中...");
    await page.goto("https://note.com/notes/new", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    // タイトル入力
    const titleSelector = 'textarea[placeholder*="タイトル"], [data-placeholder*="タイトル"], .title-input';
    await page.waitForSelector(titleSelector, { timeout: 10000 });
    await page.click(titleSelector);
    await page.fill(titleSelector, article.title);

    // 本文入力（noteのエディタはProseMirror系）
    await page.waitForTimeout(1000);
    const bodySelector = '.ProseMirror, [contenteditable="true"], .editor-body';
    await page.click(bodySelector);
    await page.waitForTimeout(500);

    // マークダウンをプレーンテキストとして入力
    const plainContent = article.content
      .replace(/#{1,6}\s/g, "")      // 見出し記号除去
      .replace(/\*\*(.*?)\*\*/g, "$1") // 太字除去
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1: $2"); // リンクをテキストに

    await page.keyboard.type(plainContent, { delay: 10 });

    // ハッシュタグ設定（タグ入力欄がある場合）
    try {
      const tagInput = await page.$('input[placeholder*="タグ"], input[placeholder*="ハッシュタグ"]');
      if (tagInput) {
        for (const tag of article.tags.slice(0, 5)) {
          await tagInput.fill(tag);
          await page.keyboard.press("Enter");
          await page.waitForTimeout(300);
        }
      }
    } catch {
      console.log("タグ入力欄が見つかりませんでした（スキップ）");
    }

    // 公開ボタンをクリック
    console.log("🚀 記事を公開中...");
    const publishBtn = await page.$('button:has-text("公開"), button:has-text("投稿")');
    if (!publishBtn) {
      throw new Error("公開ボタンが見つかりません");
    }
    await publishBtn.click();
    await page.waitForTimeout(2000);

    // 公開確認ダイアログがある場合
    const confirmBtn = await page.$('button:has-text("公開する"), button:has-text("確定")');
    if (confirmBtn) {
      await confirmBtn.click();
      await page.waitForNavigation({ waitUntil: "networkidle", timeout: 15000 });
    }

    const url = page.url();
    console.log(`✅ 投稿完了: ${url}`);
    return url;
  } finally {
    await browser.close();
  }
}
