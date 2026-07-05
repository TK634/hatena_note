/**
 * 投稿済み記事の反応データを収集し、勝ちテーマを特定する自己改善ループの核。
 *
 * 毎朝 run-all.ts の冒頭で実行され：
 * 1. post-log.json の全記事のはてなブックマーク数を取得（無料・認証不要API）
 * 2. manual-signals.json（Search Console等の手動入力データ）があれば合算
 * 3. スコア上位の記事を winning-topics.json に書き出す
 * 4. generate.ts が3日に1回、勝ちテーマの「深掘り記事」を自動生成する
 */
import * as fs from "fs";

interface LogEntry {
  date: string;
  genreId: string;
  title: string;
  url: string;
}

interface ArticleScore {
  title: string;
  genreId: string;
  url: string;
  bookmarks: number;
  searchClicks: number; // manual-signals.json から（任意）
  score: number;
}

/** はてなブックマーク数を一括取得（50件ずつ・認証不要） */
async function fetchBookmarkCounts(urls: string[]): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (let i = 0; i < urls.length; i += 50) {
    const batch = urls.slice(i, i + 50);
    const qs = batch.map((u) => `url=${encodeURIComponent(u)}`).join("&");
    try {
      const res = await fetch(`https://bookmark.hatenaapis.com/count/entries?${qs}`);
      if (res.ok) Object.assign(counts, await res.json());
    } catch { /* ネットワークエラー時はスキップ */ }
  }
  return counts;
}

export async function analyzePerformance(): Promise<ArticleScore[]> {
  if (!fs.existsSync("post-log.json")) return [];
  const logs: LogEntry[] = JSON.parse(fs.readFileSync("post-log.json", "utf-8"));

  // 個別記事URLを持つものだけ（重複除去）
  const entries = [...new Map(
    logs.filter((l) => l.url.includes("/entry/")).map((l) => [l.url, l])
  ).values()];
  if (entries.length === 0) return [];

  const bookmarks = await fetchBookmarkCounts(entries.map((e) => e.url));

  // 手動シグナル（Search Consoleのクリック数などを後から足せる）
  // 形式: { "記事URL": クリック数 }
  let manual: Record<string, number> = {};
  if (fs.existsSync("manual-signals.json")) {
    try { manual = JSON.parse(fs.readFileSync("manual-signals.json", "utf-8")); } catch {}
  }

  const scores: ArticleScore[] = entries.map((e) => {
    const bm = bookmarks[e.url] ?? 0;
    const clicks = manual[e.url] ?? 0;
    return {
      title: e.title,
      genreId: e.genreId,
      url: e.url,
      bookmarks: bm,
      searchClicks: clicks,
      score: bm * 10 + clicks, // ブクマは希少なので重み10倍
    };
  });

  scores.sort((a, b) => b.score - a.score);

  // 反応があった記事（score>0）の上位5件を「勝ちテーマ」として保存
  const winners = scores.filter((s) => s.score > 0).slice(0, 5);
  fs.writeFileSync(
    "winning-topics.json",
    JSON.stringify({ updatedAt: new Date().toISOString(), winners }, null, 2)
  );

  // 履歴も残す（伸び推移を後で見られるように）
  const histFile = "performance-log.json";
  const hist = fs.existsSync(histFile) ? JSON.parse(fs.readFileSync(histFile, "utf-8")) : [];
  hist.push({
    date: new Date().toISOString().split("T")[0],
    totalArticles: entries.length,
    totalBookmarks: scores.reduce((a, s) => a + s.bookmarks, 0),
    totalSearchClicks: scores.reduce((a, s) => a + s.searchClicks, 0),
    top3: winners.slice(0, 3).map((w) => ({ title: w.title, score: w.score })),
  });
  fs.writeFileSync(histFile, JSON.stringify(hist, null, 2));

  if (winners.length > 0) {
    console.log(`   📈 反応のある記事 ${winners.length}件（トップ:「${winners[0].title}」score=${winners[0].score}）`);
  } else {
    console.log(`   📈 まだ反応データなし（記事${entries.length}件を監視中）`);
  }
  return scores;
}

// 単体実行: npx tsx analyze.ts
if (process.argv[1] && (process.argv[1].endsWith("analyze.ts") || process.argv[1].endsWith("analyze.js"))) {
  analyzePerformance().then((s) => {
    console.log(`分析完了: ${s.length}記事`);
    s.slice(0, 10).forEach((x) => console.log(`  score=${x.score} bm=${x.bookmarks} ${x.title}`));
  }).catch(console.error);
}
