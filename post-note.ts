/**
 * note.com への自動投稿（Playwright）
 *
 * 改善点:
 * - ログインセッションをファイルに保存して再利用（毎回ログイン不要）
 * - クリップボード貼り付けで高速・安定した本文入力
 * - セレクタを複数フォールバックで対応（UI変更に強い）
 * - マークダウンをnote向けにクリーニングして投稿
 */
import { chromium, type BrowserContext } from "playwright";
import * as fs from "fs";
import * as path from "path";
import type { Article } from "./generate.js";

const SESSION_FILE = path.resolve(".note-session.json");

function markdownToNoteText(md: string): string {
  return md
    .replace(/^#{1,6}\s+(.+)$/gm, "\n$1\n")       // 見出し → 前後改行
    .replace(/\*\*(.+?)\*\*/g, "$1")               // 太字除去
    .replace(/\*(.+?)\*/g, "$1")                   // 斜体除去
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1（$2）")   // リンク → テキスト
    .replace(/^[-*]\s+/gm, "・")                   // 箇条書き → ・
    .replace(/^\|.+\|$/gm, "")                     // 表は除去（noteは非対応）
    .replace(/^[-|: ]+$/gm, "")                    // 表の区切り行除去
    .replace(/^---$/gm, "")                         // 水平線除去
    .replace(/\n{3,}/g, "\n\n")                    // 連続空行を最大2行に
    .trim();
}

async function loadSession(): Promise<object | null> {
  if (!fs.existsSync(SESSION_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(SESSION_FILE, "utf-8"));
  } catch {
    return null;
  }
}

async function saveSession(context: BrowserContext): Promise<void> {
  const storage = await context.storageState();
  fs.writeFileSync(SESSION_FILE, JSON.stringify(storage));
}

async function isLoggedIn(context: BrowserContext): Promise<boolean> {
  const cookies = await context.cookies("https://note.com");
  return cookies.some((c) => c.name.includes("note_gql_auth") || c.name.includes("_note_session"));
}

async function login(context: BrowserContext): Promise<void> {
  const email = process.env.NOTE_EMAIL;
  const password = process.env.NOTE_PASSWORD;
  if (!email || !password) throw new Error("NOTE_EMAIL / NOTE_PASSWORD が .env に設定されていません");

  const page = await context.newPage();
  try {
    console.log("   🔑 note.com にログイン中...");
    await page.goto("https://note.com/login", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(1500);

    // メール入力（複数セレクタ対応）
    const emailSelectors = ['input[name="email"]', 'input[type="email"]', 'input[placeholder*="メール"]'];
    for (const sel of emailSelectors) {
      if (await page.$(sel)) { await page.fill(sel, email); break; }
    }

    // パスワード入力
    const passSelectors = ['input[name="password"]', 'input[type="password"]', 'input[placeholder*="パスワード"]'];
    for (const sel of passSelectors) {
      if (await page.$(sel)) { await page.fill(sel, password); break; }
    }

    // ログインボタン
    const btnSelectors = ['button[type="submit"]', 'button:has-text("ログイン")', 'input[type="submit"]'];
    for (const sel of btnSelectors) {
      if (await page.$(sel)) { await page.click(sel); break; }
    }

    await page.waitForNavigation({ waitUntil: "networkidle", timeout: 20000 });

    // ログイン確認
    if (page.url().includes("/login")) {
      throw new Error("ログインに失敗しました。NOTE_EMAIL / NOTE_PASSWORD を確認してください");
    }

    await saveSession(context);
    console.log("   ✅ ログイン成功（セッション保存）");
  } finally {
    await page.close();
  }
}

async function pasteContent(page: import("playwright").Page, content: string): Promise<void> {
  // クリップボード経由で貼り付け（keyboard.type より高速・安定）
  await page.evaluate(async (text) => {
    await navigator.clipboard.writeText(text).catch(() => {
      // フォールバック: document.execCommand
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    });
  }, content);

  // Ctrl+V で貼り付け
  await page.keyboard.press("Meta+a");
  await page.keyboard.press("Meta+v");
  await page.waitForTimeout(800);

  // フォールバック: テキストが入っていなければ直接入力（分割して高速化）
  const bodySelectors = [".ProseMirror", '[contenteditable="true"].editor', ".note-editor__content"];
  for (const sel of bodySelectors) {
    const el = await page.$(sel);
    if (!el) continue;
    const innerText = await el.evaluate((e) => (e as HTMLElement).innerText ?? "");
    if (innerText.trim().length > 10) return; // 貼り付け成功
    break;
  }

  // 最終フォールバック: 1000文字ずつ分割してtype
  console.log("   ⚠ クリップボード貼り付け失敗 → 分割入力にフォールバック");
  const chunks = content.match(/.{1,500}/gs) ?? [content];
  for (const chunk of chunks) {
    await page.keyboard.type(chunk, { delay: 0 });
  }
}

export async function postToNote(article: Article): Promise<string> {
  if (!process.env.NOTE_EMAIL || !process.env.NOTE_PASSWORD) {
    console.log("   ⏭ note スキップ（NOTE_EMAIL / NOTE_PASSWORD 未設定）");
    return "";
  }

  const browser = await chromium.launch({ headless: true });
  const savedSession = await loadSession();

  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    ...(savedSession ? { storageState: savedSession as Parameters<typeof browser.newContext>[0]["storageState"] } : {}),
  });

  try {
    // セッションが無効なら再ログイン
    if (!(await isLoggedIn(context))) {
      await login(context);
    }

    const page = await context.newPage();

    // 新規記事ページへ
    console.log("   ✍️  note.com で新規記事作成中...");
    await page.goto("https://note.com/notes/new", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    // ログイン切れチェック
    if (page.url().includes("/login")) {
      await page.close();
      await login(context);
      const p2 = await context.newPage();
      await p2.goto("https://note.com/notes/new", { waitUntil: "domcontentloaded", timeout: 30000 });
      await p2.waitForTimeout(2000);
    }

    // タイトル入力
    const titleSelectors = [
      'textarea[placeholder*="タイトル"]',
      '[data-placeholder*="タイトル"]',
      '.title-input textarea',
      'div[class*="title"] textarea',
    ];
    let titleFilled = false;
    for (const sel of titleSelectors) {
      if (await page.$(sel)) {
        await page.click(sel);
        await page.fill(sel, article.title);
        titleFilled = true;
        break;
      }
    }
    if (!titleFilled) throw new Error("タイトル入力欄が見つかりません");

    // 本文エディタをクリック
    await page.waitForTimeout(800);
    const editorSelectors = [
      ".ProseMirror",
      '[contenteditable="true"]',
      ".note-editor__content",
      '[data-testid="editor-content"]',
    ];
    let editorClicked = false;
    for (const sel of editorSelectors) {
      if (await page.$(sel)) {
        await page.click(sel);
        editorClicked = true;
        break;
      }
    }
    if (!editorClicked) throw new Error("エディタが見つかりません");

    await page.waitForTimeout(500);

    // 本文貼り付け
    const noteText = markdownToNoteText(article.content);
    await pasteContent(page, noteText);

    // タグ入力
    await page.waitForTimeout(500);
    const tagSelectors = [
      'input[placeholder*="タグ"]',
      'input[placeholder*="ハッシュタグ"]',
      'input[data-testid*="tag"]',
    ];
    for (const sel of tagSelectors) {
      const tagInput = await page.$(sel);
      if (!tagInput) continue;
      for (const tag of article.tags.slice(0, 5)) {
        await tagInput.fill(tag);
        await page.keyboard.press("Enter");
        await page.waitForTimeout(300);
      }
      break;
    }

    // 公開ボタン
    console.log("   🚀 note.com に公開中...");
    await page.waitForTimeout(500);

    const publishSelectors = [
      'button:has-text("公開")',
      'button:has-text("投稿")',
      '[data-testid="publish-button"]',
    ];
    let published = false;
    for (const sel of publishSelectors) {
      if (await page.$(sel)) {
        await page.click(sel);
        published = true;
        break;
      }
    }
    if (!published) throw new Error("公開ボタンが見つかりません");

    await page.waitForTimeout(2000);

    // 確認ダイアログ
    const confirmSelectors = [
      'button:has-text("公開する")',
      'button:has-text("確定")',
      'button:has-text("OK")',
    ];
    for (const sel of confirmSelectors) {
      if (await page.$(sel)) {
        await page.click(sel);
        await page.waitForNavigation({ waitUntil: "networkidle", timeout: 20000 }).catch(() => {});
        break;
      }
    }

    await saveSession(context);

    const url = page.url();
    console.log(`   ✅ note.com に投稿完了: ${url}`);
    return url;
  } finally {
    await browser.close();
  }
}
