/**
 * はてなブログの記事URL（/entry/...）を取得し、post-log.json 内で
 * トップページURLのままになっている記事を実URLに補正する。
 *
 * メール投稿では投稿後の個別URLが取れないため、次回実行の冒頭でこれを呼び、
 * 前回までに投稿された記事のURLを後追いで埋める（内部リンク＝SEOの土台）。
 *
 * 取得方法は2段構え:
 *   1. AtomPub API（HATENA_API_KEY設定時）… 全記事をページ送りで取得。古い記事も漏れなく補正できる。
 *   2. RSS（フォールバック）… 直近ぶんのみ。APIキー未設定や失敗時に使う。
 */
import "dotenv/config";
import * as fs from "fs";
import * as crypto from "crypto";

const BLOG_URL = "https://takataka634.hatenablog.com/";
const RSS_URL = `${BLOG_URL}rss`;

// AtomPub 認証情報（未設定時はブログURLから推定）
const HATENA_ID = process.env.HATENA_ID || new URL(BLOG_URL).hostname.split(".")[0]; // 例: takataka634
const HATENA_BLOG_ID = process.env.HATENA_BLOG_ID || new URL(BLOG_URL).hostname;     // 例: takataka634.hatenablog.com
const HATENA_API_KEY = process.env.HATENA_API_KEY;

interface LogEntry {
  date: string;
  genreId: string;
  title: string;
  url: string;
  tags?: string[];
  ogpImagePath?: string;
}

// タイトル先頭の [ジャンル名] や記号を除去して比較用に正規化
function normalize(title: string): string {
  return title
    .replace(/^\s*\[[^\]]*\]\s*/, "")
    .replace(/\s+/g, "")
    .trim();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

// ===== RSS（フォールバック・直近のみ） =====
async function fetchRssTitleUrlMap(): Promise<Map<string, string>> {
  const res = await fetch(RSS_URL, { headers: { "User-Agent": "auto-income-bot" } });
  if (!res.ok) throw new Error(`RSS取得失敗 (${res.status})`);
  const xml = await res.text();

  const map = new Map<string, string>();
  const items = xml.split(/<item[ >]/).slice(1);
  for (const item of items) {
    const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
    if (titleMatch && linkMatch) {
      const title = normalize(decodeEntities(titleMatch[1].trim()));
      const url = linkMatch[1].trim();
      if (url.includes("/entry/")) map.set(title, url);
    }
  }
  return map;
}

// ===== AtomPub API（全記事・ページ送り） =====
function buildWsseHeader(): string {
  const nonce = crypto.randomBytes(16);
  const created = new Date().toISOString();
  const digest = crypto
    .createHash("sha1")
    .update(Buffer.concat([nonce, Buffer.from(created), Buffer.from(HATENA_API_KEY!)]))
    .digest("base64");
  return (
    `UsernameToken Username="${HATENA_ID}", ` +
    `PasswordDigest="${digest}", ` +
    `Nonce="${nonce.toString("base64")}", ` +
    `Created="${created}"`
  );
}

/** AtomPubの1ページから (title→url) を抽出し、次ページURLを返す */
function parseAtomFeed(xml: string, map: Map<string, string>): string | null {
  const entries = xml.split(/<entry[ >]/).slice(1);
  for (const entry of entries) {
    // 下書き（draft=yes）は公開URLが無いのでスキップ
    if (/<app:draft>\s*yes\s*<\/app:draft>/.test(entry)) continue;
    const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
    // 公開ページ（rel="alternate" type="text/html"）のhrefが実URL
    const linkMatch =
      entry.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/) ||
      entry.match(/<link[^>]*href="([^"]+)"[^>]*rel="alternate"/);
    if (titleMatch && linkMatch) {
      const title = normalize(decodeEntities(titleMatch[1].trim()));
      const url = linkMatch[1].trim();
      if (url.includes("/entry/")) map.set(title, url);
    }
  }
  // 次ページ: <link rel="next" href="..."/>
  const next = xml.match(/<link[^>]*rel="next"[^>]*href="([^"]+)"/);
  return next ? next[1] : null;
}

async function fetchAllEntryUrlsViaApi(): Promise<Map<string, string>> {
  if (!HATENA_API_KEY) throw new Error("HATENA_API_KEY 未設定");
  const map = new Map<string, string>();
  let url: string | null = `https://blog.hatena.ne.jp/${HATENA_ID}/${HATENA_BLOG_ID}/atom/entry`;
  let page = 0;
  const MAX_PAGES = 50; // 保険（1ページ最大〜7件想定でも余裕を持たせる）
  while (url && page < MAX_PAGES) {
    const res: Response = await fetch(url, {
      headers: { "X-WSSE": buildWsseHeader(), "User-Agent": "auto-income-bot" },
    });
    if (!res.ok) throw new Error(`AtomPub取得失敗 (${res.status}) page=${page}`);
    const xml: string = await res.text();
    url = parseAtomFeed(xml, map);
    page++;
  }
  return map;
}

export async function resolveArticleUrls(): Promise<number> {
  const logFile = "post-log.json";
  if (!fs.existsSync(logFile)) return 0;

  const logs: LogEntry[] = JSON.parse(fs.readFileSync(logFile, "utf-8"));
  const needsFix = logs.filter((l) => !l.url.includes("/entry/"));
  if (needsFix.length === 0) return 0;

  // まずAtomPub（全件）、失敗したらRSS（直近）にフォールバック
  let map: Map<string, string>;
  try {
    map = await fetchAllEntryUrlsViaApi();
    console.log(`   🔗 AtomPub APIで全記事URLを取得: ${map.size}件`);
  } catch (e) {
    console.warn(`   ⚠ AtomPub失敗、RSSにフォールバック: ${e instanceof Error ? e.message : e}`);
    try {
      map = await fetchRssTitleUrlMap();
    } catch (e2) {
      console.warn(`   ⚠ URL補正スキップ: ${e2 instanceof Error ? e2.message : e2}`);
      return 0;
    }
  }

  let fixed = 0;
  for (const entry of logs) {
    if (entry.url.includes("/entry/")) continue;
    const real = map.get(normalize(entry.title));
    if (real) {
      entry.url = real;
      fixed++;
    }
  }

  if (fixed > 0) {
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    console.log(`   🔗 記事URLを補正: ${fixed}件（残り未補正: ${needsFix.length - fixed}件）`);
  } else {
    console.log(`   🔗 補正対象 ${needsFix.length}件だが、一致する記事URLが見つからず`);
  }
  return fixed;
}

// 単体実行: npx tsx resolve-urls.ts
if (process.argv[1] && (process.argv[1].endsWith("resolve-urls.ts") || process.argv[1].endsWith("resolve-urls.js"))) {
  resolveArticleUrls().then((n) => console.log(`完了: ${n}件補正`)).catch(console.error);
}
