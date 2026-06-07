/**
 * Google Trends RSS から今日のトレンドキーワードを取得し、
 * ジャンルに関連するものをトピックとして記事生成に使う
 *
 * 使い方: npx tsx trend-topics.ts [genreId]
 * → 通常の generateArticle() の customTopic 引数として渡す
 */
import { GENRES, type Genre } from "./genres.js";

interface TrendItem {
  title: string;
  approxTraffic: string;
}

// Google Trends Japan RSS（公開エンドポイント）
const TRENDS_RSS_URL = "https://trends.google.co.jp/trends/trendingsearches/daily/rss?geo=JP";

async function fetchTrendingTopics(): Promise<TrendItem[]> {
  try {
    const res = await fetch(TRENDS_RSS_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; auto-income-bot/1.0)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();

    const items: TrendItem[] = [];
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

    for (const match of itemMatches) {
      const content = match[1];
      const title = content.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ?? "";
      const traffic = content.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/)?.[1] ?? "0";
      if (title) items.push({ title, approxTraffic: traffic });
    }

    return items.slice(0, 20);
  } catch (e) {
    console.warn(`⚠ トレンド取得失敗（デフォルトトピック使用）: ${e}`);
    return [];
  }
}

// ジャンルのキーワードとトレンドの関連度をスコアリング
function scoreRelevance(trendTitle: string, genre: Genre): number {
  const keywordsMap: Record<string, string[]> = {
    invest: ["投資", "株", "NISA", "iDeCo", "積立", "節約", "資産", "配当", "円安", "金利", "インフレ"],
    "side-hustle": ["副業", "フリーランス", "在宅", "稼ぐ", "収入", "副収入", "クラウド", "アフィリエイト"],
    career: ["転職", "就職", "年収", "キャリア", "求人", "採用", "リストラ", "テレワーク", "リモート"],
    health: ["ダイエット", "健康", "筋トレ", "食事", "睡眠", "病気", "医療", "サプリ", "痩せる"],
    beauty: ["美容", "コスメ", "スキンケア", "化粧", "肌", "美白", "ヘア", "ネイル", "エステ"],
    realestate: ["不動産", "住宅", "マンション", "ローン", "家賃", "購入", "土地", "賃貸"],
    "fx-credit": ["FX", "クレカ", "保険", "仮想通貨", "ビットコイン", "ポイント", "マイル", "金融"],
  };

  const keywords = keywordsMap[genre.id] ?? [];
  return keywords.filter((kw) => trendTitle.includes(kw)).length;
}

export async function getTrendTopicForGenre(genre: Genre): Promise<string | null> {
  const trends = await fetchTrendingTopics();
  if (trends.length === 0) return null;

  const scored = trends
    .map((t) => ({ ...t, score: scoreRelevance(t.title, genre) }))
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return null;

  const best = scored[0];
  console.log(`   🔥 トレンドトピック採用: 「${best.title}」（検索数: ${best.approxTraffic}）`);
  return `${best.title}について${genre.name}の視点から解説`;
}

// 単体実行: npx tsx trend-topics.ts [genreId]
if (process.argv[1].endsWith("trend-topics.ts") || process.argv[1].endsWith("trend-topics.js")) {
  const genreId = process.argv[2];
  const genre = GENRES.find((g) => g.id === genreId) ?? GENRES[0];

  fetchTrendingTopics().then((trends) => {
    console.log(`\n🔥 今日のトレンド（日本）:`);
    trends.slice(0, 10).forEach((t, i) => {
      const score = scoreRelevance(t.title, genre);
      const mark = score > 0 ? " ★" : "";
      console.log(`  ${i + 1}. ${t.title} (${t.approxTraffic})${mark}`);
    });
  });
}
