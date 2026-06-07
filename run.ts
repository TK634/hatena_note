import "dotenv/config";
import { generateArticle } from "./generate.js";
import { postToHatena } from "./post-hatena.js";
import * as fs from "fs";

async function main() {
  console.log("🤖 自動投稿システム起動");
  console.log(`📅 ${new Date().toLocaleString("ja-JP")}`);

  // 環境変数チェック
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY が設定されていません");
    console.error("   .env ファイルに ANTHROPIC_API_KEY=sk-ant-... を追加してください");
    process.exit(1);
  }
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.error("❌ GMAIL_APP_PASSWORD が設定されていません");
    process.exit(1);
  }

  try {
    // Step 1: 記事生成
    console.log("\n📝 Step 1: Claude AIで記事を生成中...");
    const article = await generateArticle();
    console.log(`   タイトル: ${article.title}`);

    // Step 2: note.comに投稿
    console.log("\n🚀 Step 2: note.comに投稿中...");
    const url = await postToHatena(article);

    // Step 3: ログ保存
    const log = {
      date: new Date().toISOString(),
      title: article.title,
      url,
      tags: article.tags,
    };
    const logFile = "post-log.json";
    const logs = fs.existsSync(logFile)
      ? JSON.parse(fs.readFileSync(logFile, "utf-8"))
      : [];
    logs.push(log);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));

    console.log("\n🎉 完了！");
    console.log(`   URL: ${url}`);
    console.log(`   ログ保存: ${logFile}`);
  } catch (err) {
    console.error("❌ エラーが発生しました:", err);
    process.exit(1);
  }
}

main();
