import "dotenv/config";
import { generateArticle } from "./generate.js";
import { postToHatena } from "./post-hatena.js";
import { postToTwitter } from "./post-twitter.js";
import { postToThreads } from "./post-threads.js";
import { sendSummaryEmail } from "./notify.js";
import { GENRES, getGenreById } from "./genres.js";
import * as fs from "fs";

async function main() {
  const genreId = process.argv[2] ?? "invest";
  const genre = getGenreById(genreId);
  if (!genre) {
    console.error(`❌ ジャンルが見つかりません: ${genreId}`);
    console.error(`   利用可能: ${GENRES.map((g) => g.id).join(", ")}`);
    process.exit(1);
  }

  console.log(`🤖 自動投稿システム起動 [${genre.name}]`);
  console.log(`📅 ${new Date().toLocaleString("ja-JP")}`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY が設定されていません");
    process.exit(1);
  }
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.error("❌ GMAIL_APP_PASSWORD が設定されていません");
    process.exit(1);
  }

  try {
    console.log(`\n📝 Step 1: Claude AIで記事を生成中...`);
    const article = await generateArticle(genre);
    console.log(`   タイトル: ${article.title}`);

    console.log(`\n🚀 Step 2: はてなブログに投稿中...`);
    const url = await postToHatena(article, genre);

    if (process.env.TWITTER_API_KEY) {
      console.log(`\n🐦 Step 3: Xに投稿中...`);
      await postToTwitter(article, url, genre.twitterHashtags).catch((e) =>
        console.error("X投稿エラー（続行）:", e.message)
      );
    }

    console.log(`\n🧵 Step 4: Threadsに投稿中...`);
    await postToThreads(article, url, genre.twitterHashtags).catch((e) =>
      console.error("Threads投稿エラー（続行）:", e.message)
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

    console.log(`\n🎉 完了！`);
    console.log(`   URL: ${url}`);

    await sendSummaryEmail([
      { genreId: genre.id, genreName: genre.name, success: true, title: article.title, url },
    ]).catch(() => {});
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("❌ エラーが発生しました:", msg);
    await sendSummaryEmail([
      { genreId: genre.id, genreName: genre.name, success: false, error: msg },
    ]).catch(() => {});
    process.exit(1);
  }
}

main();
