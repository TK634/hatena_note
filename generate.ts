import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import { type Genre, GENRES, getTopicForGenre } from "./genres.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface Article {
  title: string;
  content: string;
  tags: string[];
  genreId: string;
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
  const affiliateHints = Object.entries(genre.affiliateLinks)
    .map(([cat, links]) => `- ${cat}の話題 → ${Object.keys(links).join("・")}への言及`)
    .join("\n");

  return `あなたは${genre.writerPersona}です。
以下のテーマで、はてなブログに投稿するための高品質な記事を書いてください。

テーマ: ${topic}

【記事の要件】
- 文字数: 2000〜3000文字
- 読者: ${genre.targetReader}
- 文体: 親しみやすく、でも信頼感のある専門的なトーン
- 構成:
  1. 冒頭フック（読者の悩みに共感する1〜2段落）
  2. この記事でわかること（箇条書き3〜5点）
  3. 本文（見出し付きで3〜5セクション）
  4. まとめ
  5. 次のアクション（読者が今日からできること）

【重要な指示】
- 具体的な数字や事例を使う（計算式は一行で完結させる）
- 比較表を使う場合は必ずマークダウンの表形式（| 列1 | 列2 |）で書く
- 「〜すべき」より「〜するとよい」など柔らかい表現を使う
- SEOを意識したキーワードを自然に含める
- マークダウン形式で書く

アフィリエイト挿入箇所のヒント:
${affiliateHints}

以下のJSON形式で返してください:
{
  "title": "記事タイトル",
  "content": "記事本文（マークダウン）",
  "tags": ["タグ1", "タグ2", "タグ3", "タグ4", "タグ5"]
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
  }).catch(console.error);
}
