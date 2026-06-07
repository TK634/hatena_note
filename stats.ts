/**
 * 投稿統計・収益予測を表示するコマンド
 * 使い方: npx tsx stats.ts
 */
import "dotenv/config";
import * as fs from "fs";
import { GENRES } from "./genres.js";

interface LogEntry {
  date: string;
  genreId: string;
  title: string;
  url: string;
  tags: string[];
}

// アフィリエイト単価の目安（円）
const ESTIMATED_UNIT_PRICE: Record<string, number> = {
  invest: 8000,      // 証券口座・クレカ系
  "side-hustle": 3000, // クラウドソーシング・会計ソフト系
  career: 15000,     // 転職エージェント系（高単価）
  health: 2000,      // サプリ・フィットネス系
};

// 記事1本あたりの平均クリック→成約率（保守的な見積もり）
const CONVERSION_RATE = 0.002; // 0.2%
const AVG_MONTHLY_PV_PER_ARTICLE = 300;

function main() {
  const logFile = "post-log.json";
  if (!fs.existsSync(logFile)) {
    console.log("投稿ログがまだありません。");
    return;
  }

  const logs: LogEntry[] = JSON.parse(fs.readFileSync(logFile, "utf-8"));

  console.log("=".repeat(60));
  console.log("📊 auto-income 統計レポート");
  console.log(`   ${new Date().toLocaleString("ja-JP")}`);
  console.log("=".repeat(60));

  // ジャンル別集計
  const byGenre = new Map<string, LogEntry[]>();
  for (const entry of logs) {
    const list = byGenre.get(entry.genreId) ?? [];
    list.push(entry);
    byGenre.set(entry.genreId, list);
  }

  let totalMonthlyRevenue = 0;

  console.log("\n📝 ジャンル別投稿数");
  console.log("-".repeat(60));

  for (const genre of GENRES) {
    const entries = byGenre.get(genre.id) ?? [];
    const unitPrice = ESTIMATED_UNIT_PRICE[genre.id] ?? 3000;
    const monthlyPv = entries.length * AVG_MONTHLY_PV_PER_ARTICLE;
    const monthlyRevenue = Math.floor(monthlyPv * CONVERSION_RATE * unitPrice);
    totalMonthlyRevenue += monthlyRevenue;

    console.log(`\n【${genre.name}】`);
    console.log(`  投稿数: ${entries.length} 記事`);
    console.log(`  想定月間PV: ${monthlyPv.toLocaleString()} PV`);
    console.log(`  想定月収: ¥${monthlyRevenue.toLocaleString()}`);

    if (entries.length > 0) {
      const latest = entries[entries.length - 1];
      console.log(`  最新記事: ${latest.title.slice(0, 30)}...`);
      console.log(`  最終投稿: ${new Date(latest.date).toLocaleString("ja-JP")}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`💰 現在の想定月収合計: ¥${totalMonthlyRevenue.toLocaleString()}`);

  // 月収1000万までの目標
  const target = 10_000_000;
  const needed = target - totalMonthlyRevenue;
  const articlesNeeded = Math.ceil(needed / (AVG_MONTHLY_PV_PER_ARTICLE * CONVERSION_RATE * 8000));
  console.log(`🎯 目標月収: ¥${target.toLocaleString()}`);
  console.log(`   残り: ¥${Math.max(0, needed).toLocaleString()}`);
  console.log(`   あと約 ${Math.max(0, articlesNeeded).toLocaleString()} 記事で達成見込み`);

  // 月別投稿数
  console.log("\n📅 月別投稿数");
  console.log("-".repeat(60));
  const byMonth = new Map<string, number>();
  for (const entry of logs) {
    const month = entry.date.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + 1);
  }
  for (const [month, count] of [...byMonth.entries()].sort()) {
    const bar = "█".repeat(Math.min(count, 50));
    console.log(`  ${month}: ${bar} (${count}件)`);
  }

  console.log("\n" + "=".repeat(60));
  console.log(`📦 総投稿数: ${logs.length} 記事`);
  console.log("=".repeat(60));
}

main();
