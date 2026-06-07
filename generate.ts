import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import { type Genre, GENRES, getTopicForGenre } from "./genres.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface Article {
  title: string;
  content: string;
  tags: string[];
  genreId: string;
  ogpImagePath?: string;
}

function buildAffiliateSection(genre: Genre): string {
  let section = "\n\n---\n\n## おすすめリソース\n\n";
  for (const [category, links] of Object.entries(genre.affiliateLinks)) {
    section += `### ${category}\n`;
    for (const [name, url] of Object.entries(links)) {
      section += `- [${name}](${url})\n`;
    }
    section += "\n";
  }
  return section;
}

function buildPrompt(genre: Genre, topic: string): string {
  // アフィリエイト商品を本文中に自然に挿入するためのヒント
  const affiliateProducts = Object.entries(genre.affiliateLinks)
    .flatMap(([cat, links]) => Object.keys(links).map((name) => `「${name}」（${cat}）`))
    .join("、");

  const affiliateHints = Object.entries(genre.affiliateLinks)
    .map(([cat, links]) => `- ${cat}の話題 → ${Object.keys(links).join("・")}への言及`)
    .join("\n");

  return `あなたは${genre.writerPersona}です。
以下のテーマで、はてなブログに投稿するための高品質なSEO記事を書いてください。

テーマ: ${topic}

【SEO要件】
- タイトル: 検索意図に合致した32文字以内のキャッチーなタイトル（数字・メリット・年度を含める）
- 見出し（h2/h3）: キーワードを自然に含める
- 冒頭100文字: 記事の価値を明示してユーザーを引き込む
- 本文にLSIキーワード（関連語）を自然に散りばめる
- 内部リンクを促す「関連記事」セクションを末尾に1つ設ける

【記事要件】
- 文字数: 2500〜3500文字（SEOは文字数が多いほど有利）
- 読者: ${genre.targetReader}
- 文体: 親しみやすく、信頼感のある専門的なトーン
- 構成:
  1. 冒頭フック（読者の悩みに共感する1〜2段落）+ この記事でわかること（箇条書き3〜5点）
  2. 本文（h2見出し付きで4〜6セクション、必要に応じてh3も使う）
  3. 比較表（| 項目 | A | B |形式のマークダウン表）を1〜2個含める
  4. まとめ・次のアクション

【アフィリエイト挿入ルール】
本文の自然な流れの中（比較・紹介・まとめ部分）に以下の商品を1〜3箇所リンク付きで言及すること:
対象商品: ${affiliateProducts}

挿入箇所のヒント:
${affiliateHints}

【重要な指示】
- 具体的な数字・事例・計算式を積極的に使う（一行で完結させる）
- 「〜すべき」より「〜するとよい」など柔らかい表現を使う
- マークダウン形式で書く（はてなブログ対応）

以下のJSON形式で返してください（contentは改行を\\nでエスケープしないこと）:
{
  "title": "記事タイトル（32文字以内）",
  "content": "記事本文（マークダウン）",
  "tags": ["タグ1", "タグ2", "タグ3", "タグ4", "タグ5", "タグ6", "タグ7", "タグ8"]
}`;
}

export async function generateArticle(genre: Genre, customTopic?: string): Promise<Article> {
  const topic = customTopic ?? getTopicForGenre(genre);

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 8192,
    messages: [{ role: "user", content: buildPrompt(genre, topic) }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("API応答（先頭200文字）:", text.slice(0, 200));
    throw new Error("記事の生成に失敗しました");
  }

  let parsed: Omit<Article, "genreId">;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("JSON解析エラー:", e);
    throw new Error("記事の生成に失敗しました");
  }

  const article: Article = { ...parsed, genreId: genre.id };

  // アフィリエイトセクションを末尾に追加
  article.content += buildAffiliateSection(genre);

  // OGP画像を生成
  try {
    const { generateOgpImage } = await import("./ogp.js");
    const date = new Date().toISOString().split("T")[0];
    const safeTitle = article.title.slice(0, 15).replace(/[\/\\:*?"<>|]/g, "");
    const ogpPath = `ogp/${genre.id}-${date}-${safeTitle}.png`;
    await generateOgpImage(article.title, genre, ogpPath);
    article.ogpImagePath = ogpPath;
  } catch (e) {
    console.warn(`   ⚠ OGP画像生成スキップ: ${e instanceof Error ? e.message : e}`);
  }

  // articles/<genreId>/ に保存
  const date = new Date().toISOString().split("T")[0];
  const safeTitle = article.title.slice(0, 20).replace(/[\/\\:*?"<>|]/g, "");
  const dir = `articles/${genre.id}`;
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${dir}/${date}-${safeTitle}.md`;
  fs.writeFileSync(filename, `# ${article.title}\n\n${article.content}`);
  console.log(`   ✅ 記事を生成: ${filename}`);

  return article;
}

// 単体実行: npx tsx generate.ts [genreId]
if (process.argv[1].endsWith("generate.ts") || process.argv[1].endsWith("generate.js")) {
  const genreId = process.argv[2] ?? "invest";
  const genre = GENRES.find((g) => g.id === genreId) ?? GENRES[0];
  generateArticle(genre).then((a) => {
    console.log("タイトル:", a.title);
    console.log("タグ:", a.tags);
    if (a.ogpImagePath) console.log("OGP画像:", a.ogpImagePath);
  }).catch(console.error);
}
