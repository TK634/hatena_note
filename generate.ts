import Anthropic from "@anthropic-ai/sdk";
import { getRandomTopic, AFFILIATE_LINKS } from "./topics.js";
import * as fs from "fs";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface Article {
  title: string;
  content: string;
  tags: string[];
}

export async function generateArticle(customTopic?: string): Promise<Article> {
  const topic = customTopic ?? getRandomTopic();

  const prompt = `あなたは株式投資・資産運用・節約の専門家ライターです。
以下のテーマで、note.comに投稿するための高品質な記事を書いてください。

テーマ: ${topic}

【記事の要件】
- 文字数: 2000〜3000文字
- 読者: 20〜40代の投資初心者〜中級者
- 文体: 親しみやすく、でも信頼感のある専門的なトーン
- 構成:
  1. 冒頭フック（読者の悩みに共感する1〜2段落）
  2. この記事でわかること（箇条書き3〜5点）
  3. 本文（見出し付きで3〜5セクション）
  4. まとめ
  5. 次のアクション（読者が今日からできること）

【重要な指示】
- 具体的な数字や事例を使う（計算式は「月3万円 × 12ヶ月 = 年36万円」のように一行で完結させ、途中で複数行に分けない）
- 比較表を使う場合は必ずマークダウンの表形式（| 列1 | 列2 |）で書く
- 「〜すべき」より「〜するとよい」など柔らかい表現を使う
- 記事の最後に関連書籍や証券会社への言及を自然に入れる
- SEOを意識したキーワードを自然に含める
- マークダウン形式で書く（はてなブログのマークダウンに対応）
- 計算例は「例：年収500万円の場合 → 税率20% → 節税額は年間5万円」のようにシンプルにまとめる

アフィリエイト挿入箇所のヒント:
- 証券口座の話題 → 楽天証券・SBI証券への言及
- 書籍の話題 → Amazonの投資本への言及
- 家計管理 → マネーフォワードへの言及

以下のJSON形式で返してください:
{
  "title": "記事タイトル",
  "content": "記事本文（マークダウン）",
  "tags": ["タグ1", "タグ2", "タグ3", "タグ4", "タグ5"]
}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  // JSON部分を抽出
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("API応答（先頭200文字）:", text.slice(0, 200));
    throw new Error("記事の生成に失敗しました");
  }

  let article: Article;
  try {
    article = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("JSON解析エラー:", e);
    console.error("マッチした文字列（先頭300文字）:", jsonMatch[0].slice(0, 300));
    throw new Error("記事の生成に失敗しました");
  }

  // アフィリエイトリンクを本文に追加
  article.content += `\n\n---\n\n## 📚 おすすめリソース\n\n`;
  article.content += `### 証券口座を開設するなら\n`;
  article.content += `- [楽天証券](${AFFILIATE_LINKS.証券口座.楽天証券}) - ポイント投資が使えて初心者向け\n`;
  article.content += `- [SBI証券](${AFFILIATE_LINKS.証券口座.SBI証券}) - 業界最大手で手数料も安い\n\n`;
  article.content += `### 合わせて読みたい本\n`;
  article.content += `- [敗者のゲーム](${AFFILIATE_LINKS.本.敗者のゲーム}) - インデックス投資のバイブル\n`;
  article.content += `- [ウォール街のランダムウォーカー](${AFFILIATE_LINKS.本.ウォール街のランダムウォーカー}) - 長期投資の教科書\n\n`;
  article.content += `### 家計管理アプリ\n`;
  article.content += `- [マネーフォワード ME](${AFFILIATE_LINKS.アプリ.マネーフォワード}) - 資産を一元管理できる無料アプリ\n`;

  // ファイルに保存
  const date = new Date().toISOString().split("T")[0];
  const filename = `articles/${date}-${article.title.slice(0, 20).replace(/[\/\\:*?"<>|]/g, "")}.md`;
  fs.mkdirSync("articles", { recursive: true });
  fs.writeFileSync(filename, `# ${article.title}\n\n${article.content}`);
  console.log(`✅ 記事を生成: ${filename}`);

  return article;
}

// 単体実行用
if (process.argv[1].endsWith("generate.ts") || process.argv[1].endsWith("generate.js")) {
  generateArticle().then((a) => {
    console.log("タイトル:", a.title);
    console.log("タグ:", a.tags);
  }).catch(console.error);
}
