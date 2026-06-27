/**
 * はてなブログのRSSフィードから実際の記事URL（/entry/...）を取得し、
 * post-log.json 内でトップページURLのままになっている記事を実URLに補正する。
 *
 * メール投稿では投稿後の個別URLが取れないため、次回実行の冒頭でこれを呼び、
 * 前回までに投稿された記事のURLを後追いで埋める。
 */
import * as fs from "fs";

const RSS_URL = "https://takataka634.hatenablog.com/rss";
const HOMEPAGE = "https://takataka634.hatenablog.com/";

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

export async function resolveArticleUrls(): Promise<number> {
  const logFile = "post-log.json";
  if (!fs.existsSync(logFile)) return 0;

  const logs: LogEntry[] = JSON.parse(fs.readFileSync(logFile, "utf-8"));
  const needsFix = logs.filter((l) => !l.url.includes("/entry/"));
  if (needsFix.length === 0) return 0;

  let map: Map<string, string>;
  try {
    map = await fetchRssTitleUrlMap();
  } catch (e) {
    console.warn(`   ⚠ URL補正スキップ: ${e instanceof Error ? e.message : e}`);
    return 0;
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
    console.log(`   🔗 記事URLを補正: ${fixed}件`);
  }
  return fixed;
}

// 単体実行: npx tsx resolve-urls.ts
if (process.argv[1].endsWith("resolve-urls.ts") || process.argv[1].endsWith("resolve-urls.js")) {
  resolveArticleUrls().then((n) => console.log(`完了: ${n}件補正`)).catch(console.error);
}
