/**
 * 全ジャンルを順番に実行する一括投稿スクリプト
 * 使い方: npx tsx run-all.ts
 * 特定ジャンルをスキップ: SKIP_GENRES=career npx tsx run-all.ts
 */
import "dotenv/config";
import { generateArticle } from "./generate.js";
import { postToHatena } from "./post-hatena.js";
import { postToTwitter } from "./post-twitter.js";
import { postToThreads } from "./post-threads.js";
import { sendSummaryEmail, type PostResult } from "./notify.js";
import { GENRES } from "./genres.js";
import * as fs from "fs";

async function runGenre(genre: (typeof GENRES)[0]): Promise<PostResult> {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`▶ ジャンル: ${genre.name} (${genre.id})`);
  console.log(`${"=".repeat(50)}`);

  try {
    console.log(`📝 記事を生成中...`);
    const article = await generateArticle(genre);
    console.log(`   タイトル: ${article.title}`);

    console.log(`🚀 はてなブログに投稿中...`);
    const url = await postToHatena(article, genre);

    if (process.env.TWITTER_API_KEY) {
      console.log(`🐦 Xに投稿中...`);
      await postToTwitter(article, url, genre.twitterHashtags).catch((e) =>
        console.error(`   X投稿エラー（続行）: ${e.message}`)
      );
    }

    console.log(`🧵 Threadsに投稿中...`);
    await postToThreads(article, url, genre.twitterHashtags).catch((e) =>
      console.error(`   Threads投稿エラー（続行）: ${e.message}`)
    );

    const log = {
      date: new Date().toISOString(),
      genreId: genre.id,
      title: article.title,
      url,
      tags: article.tags,
    };
    const logFile = "post-log.json";
    const logs = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, "utf-8")) : [];
    logs.push(log);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));

    console.log(`✅ 完了: ${url}`);
    return { genreId: genre.id, genreName: genre.name, success: true, title: article.title, url };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ エラー [${genre.name}]: ${msg}`);
    return { genreId: genre.id, genreName: genre.name, success: false, error: msg };
  }
}

async function main() {
  console.log(`🤖 全ジャンル一括投稿システム起動`);
  console.log(`📅 ${new Date().toLocaleString("ja-JP")}`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY が設定されていません");
    process.exit(1);
  }

  const skipIds = (process.env.SKIP_GENRES ?? "").split(",").filter(Boolean);
  const targets = GENRES.filter((g) => !skipIds.includes(g.id));

  console.log(`\n対象ジャンル: ${targets.map((g) => g.name).join(", ")}`);
  if (skipIds.length > 0) console.log(`スキップ: ${skipIds.join(", ")}`);

  const results: PostResult[] = [];
  for (const genre of targets) {
    const result = await runGenre(genre);
    results.push(result);
    if (genre !== targets[targets.length - 1]) {
      console.log(`\n⏳ 次のジャンルまで30秒待機...`);
      await new Promise((r) => setTimeout(r, 30_000));
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`📊 実行結果`);
  console.log(`${"=".repeat(50)}`);
  for (const r of results) {
    const icon = r.success ? "✅" : "❌";
    console.log(`${icon} ${r.genreName}: ${r.success ? r.url : r.error}`);
  }
  const successCount = results.filter((r) => r.success).length;
  console.log(`\n合計: ${successCount}/${results.length} 成功`);

  // 結果をメールで通知
  await sendSummaryEmail(results).catch((e) =>
    console.error(`メール通知エラー（続行）: ${e.message}`)
  );
}

main().catch(console.error);
