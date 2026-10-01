/**
 * 全ジャンルを順番に実行する一括投稿スクリプト
 * 使い方: npx tsx run-all.ts
 * 特定ジャンルをスキップ: SKIP_GENRES=career npx tsx run-all.ts
 */
import "dotenv/config";
import { generateArticle } from "./generate.js";
import { postToHatenaSafely } from "./post-hatena.js";
import { postToNote } from "./post-note.js";
import { postToWordPress } from "./post-wordpress.js";
import { postToTwitter } from "./post-twitter.js";
import { postToThreads } from "./post-threads.js";
import { postToInstagram } from "./post-instagram.js";
import { sendSummaryEmail, type PostResult } from "./notify.js";
import { resolveArticleUrls } from "./resolve-urls.js";
import { hasBudgetLeft, getMonthlySpend, MONTHLY_BUDGET_USD } from "./cost-guard.js";
import { GENRES, pickTodaysGenres } from "./genres.js";
import type { Article } from "./generate.js";
import * as fs from "fs";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

/**
 * ネットワークが使えるまで待つ（最大5分）。
 * スリープ復帰直後は回線が未接続のことがあり、そのまま始めると全ジャンルがタイムアウトする。
 */
async function waitForNetwork(maxWaitMs = 5 * 60_000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      // 何らかのHTTP応答が返れば回線はつながっている（ステータスは問わない）
      await fetch("https://api.anthropic.com", { method: "HEAD", signal: AbortSignal.timeout(10_000) });
      return true;
    } catch {
      console.log(`   ⏳ ネットワーク待機中...（${Math.round((Date.now() - start) / 1000)}秒経過）`);
      await sleep(15_000);
    }
  }
  return false;
}

/** 記事生成: 通信の一時エラーに備えて最大3回（30秒→60秒の間隔で再試行） */
async function generateWithRetry(genre: (typeof GENRES)[0]): Promise<Article> {
  const waits = [30_000, 60_000];
  for (let attempt = 1; ; attempt++) {
    try {
      return await generateArticle(genre);
    } catch (e) {
      // 予算超過は再試行しても無駄なので即終了
      if (e instanceof Error && e.name === "BudgetExceededError") throw e;
      if (attempt > waits.length) throw e;
      console.warn(`   ⚠ 生成失敗（${attempt}回目）、${waits[attempt - 1] / 1000}秒後に再試行: ${errMsg(e)}`);
      await sleep(waits[attempt - 1]);
    }
  }
}

async function runGenre(genre: (typeof GENRES)[0]): Promise<PostResult> {
  console.log(`\n${"=".repeat(55)}`);
  console.log(`▶ ジャンル: ${genre.name} (${genre.id})`);
  console.log(`${"=".repeat(55)}`);

  try {
    console.log(`📝 記事を生成中 + OGP画像作成...`);
    const article = await generateWithRetry(genre);
    console.log(`   タイトル: ${article.title}`);

    // はてなブログ（必須）
    console.log(`🚀 はてなブログに投稿中...`);
    const hatenaUrl = await postToHatenaSafely(article, genre);

    // note.com
    console.log(`📓 note.com に投稿中...`);
    await postToNote(article).catch((e) =>
      console.error(`   note投稿エラー（続行）: ${e.message}`)
    );

    // WordPress（設定済みの場合）
    await postToWordPress(article, genre).catch((e) =>
      console.error(`   WP投稿エラー（続行）: ${e.message}`)
    );

    // X(Twitter)
    if (process.env.TWITTER_API_KEY) {
      console.log(`🐦 Xに投稿中...`);
      await postToTwitter(article, hatenaUrl, genre.twitterHashtags).catch((e) =>
        console.error(`   X投稿エラー（続行）: ${e.message}`)
      );
    }

    // Threads
    console.log(`🧵 Threadsに投稿中...`);
    await postToThreads(article, hatenaUrl, genre.twitterHashtags).catch((e) =>
      console.error(`   Threads投稿エラー（続行）: ${e.message}`)
    );

    // Instagram（OGP画像URLが必要なため、現時点ではスキップ）
    // 将来的にCloudinary等に画像をアップロードしてから使用
    if (process.env.INSTAGRAM_ACCESS_TOKEN && process.env.CLOUDINARY_OGP_URL) {
      console.log(`📸 Instagramに投稿中...`);
      await postToInstagram(article, process.env.CLOUDINARY_OGP_URL, genre.twitterHashtags)
        .catch((e) => console.error(`   Instagram投稿エラー（続行）: ${e.message}`));
    }

    const log = {
      date: new Date().toISOString(),
      genreId: genre.id,
      title: article.title,
      url: hatenaUrl,
      tags: article.tags,
      ogpImagePath: article.ogpImagePath,
    };
    const logFile = "post-log.json";
    const logs = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, "utf-8")) : [];
    logs.push(log);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));

    console.log(`✅ 完了: ${hatenaUrl}`);
    return { genreId: genre.id, genreName: genre.name, success: true, title: article.title, url: hatenaUrl };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ エラー [${genre.name}]: ${msg}`);
    return { genreId: genre.id, genreName: genre.name, success: false, error: msg };
  }
}

async function main() {
  console.log(`🤖 全ジャンル一括投稿システム起動`);
  console.log(`📅 ${new Date().toLocaleString("ja-JP")}`);
  console.log(`📊 対応ジャンル数: ${GENRES.length}`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY が設定されていません");
    process.exit(1);
  }

  const skipIds = (process.env.SKIP_GENRES ?? "").split(",").filter(Boolean);
  const enabled = GENRES.filter((g) => !skipIds.includes(g.id));
  // 1日の投稿本数（既定1。POSTS_PER_DAY=4 で以前の全ジャンル投稿に戻せる）
  const perDay = Math.max(1, Number(process.env.POSTS_PER_DAY) || 1);
  const targets = pickTodaysGenres(enabled, perDay);

  console.log(`\n対象ジャンル: ${targets.map((g) => g.name).join(", ")}`);
  if (skipIds.length > 0) console.log(`スキップ: ${skipIds.join(", ")}`);

  // スリープ復帰直後は回線が未接続のことがあるため、つながるまで待つ
  console.log(`\n🌐 ネットワーク接続を確認中...`);
  if (!(await waitForNetwork())) {
    console.error(`❌ 5分待ってもネットワークに接続できないため、今回の実行を中止します（API代を無駄にしないため）`);
    return;
  }
  console.log(`   ✅ 接続OK`);

  // 前回までに投稿した記事の実URLをRSSから取得してログを補正（内部リンク用）
  console.log(`\n🔗 過去記事のURLを補正中...`);
  await resolveArticleUrls().catch((e) =>
    console.error(`   URL補正エラー（続行）: ${e.message}`)
  );

  // 【自己改善ループ】記事の反応データを収集し、勝ちテーマを更新（無料・API課金なし）
  console.log(`📊 記事の反応データを分析中...`);
  const { analyzePerformance } = await import("./analyze.js");
  await analyzePerformance().catch((e) =>
    console.error(`   分析エラー（続行）: ${e.message}`)
  );

  const results: PostResult[] = [];
  for (const genre of targets) {
    // 月の予算チェック（$5を超えないための安全装置）
    if (!hasBudgetLeft()) {
      console.log(
        `\n🛑 今月のAPI予算 $${MONTHLY_BUDGET_USD} に到達（現在 $${getMonthlySpend().toFixed(2)}）。残りジャンルはスキップします。`
      );
      break;
    }
    const result = await runGenre(genre);
    results.push(result);
    if (genre !== targets[targets.length - 1]) {
      console.log(`\n⏳ 次のジャンルまで30秒待機...`);
      await new Promise((r) => setTimeout(r, 30_000));
    }
  }

  console.log(`\n${"=".repeat(55)}`);
  console.log(`📊 実行結果サマリー`);
  console.log(`${"=".repeat(55)}`);
  for (const r of results) {
    console.log(`${r.success ? "✅" : "❌"} ${r.genreName}: ${r.success ? r.url : r.error}`);
  }
  const successCount = results.filter((r) => r.success).length;
  console.log(`\n合計: ${successCount}/${results.length} 成功`);

  await sendSummaryEmail(results).catch((e) =>
    console.error(`メール通知エラー（続行）: ${e.message}`)
  );
}

main().catch(console.error);
