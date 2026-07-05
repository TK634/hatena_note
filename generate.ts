import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import { type Genre, GENRES, getTopicForGenre } from "./genres.js";
import { hasBudgetLeft, recordUsage, getMonthlySpend, MONTHLY_BUDGET_USD } from "./cost-guard.js";

export class BudgetExceededError extends Error {
  constructor() {
    super(
      `今月のAPI予算（$${MONTHLY_BUDGET_USD}）に達したため生成を停止しました（現在 $${getMonthlySpend().toFixed(2)}）。来月1日に自動リセットされます。`
    );
    this.name = "BudgetExceededError";
  }
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface Article {
  title: string;
  content: string;
  tags: string[];
  genreId: string;
  ogpImagePath?: string;
  /** 記事テーマに直接関係するアフィリリンク名（AIが記事ごとに選定） */
  relevantLinks?: string[];
}

// 未設定（PENDING / REPLACE_）のアフィリリンクは壊れたリンクになるので除外する
import { isActiveLink } from "./affiliate-links.js";
function isValidLink(url: string): boolean {
  return isActiveLink(url);
}

function buildAffiliateSection(genre: Genre, relevantLinks: string[]): string {
  // AIが「この記事に直接関係する」と選んだリンクだけを載せる。
  // 選定がない・全滅の場合はセクション自体を出さない（無関係リンク防止）。
  const validCategories = Object.entries(genre.affiliateLinks)
    .map(([category, links]) => {
      const valid = Object.entries(links).filter(
        ([name, url]) => isValidLink(url) && relevantLinks.includes(name)
      );
      return [category, valid] as const;
    })
    .filter(([, valid]) => valid.length > 0);

  if (validCategories.length === 0) return "";

  let section = "\n\n---\n\n## この記事に関連するサービス\n\n";
  for (const [category, links] of validCategories) {
    section += `### ${category}\n`;
    for (const [name, url] of links) {
      section += `- [${name}](${url})\n`;
    }
    section += "\n";
  }
  return section;
}

function buildPrompt(genre: Genre, topic: string): string {
  // 有効な（REPLACE_を含まない）アフィリエイト商品だけを本文挿入対象にする
  const validProducts = Object.entries(genre.affiliateLinks)
    .flatMap(([cat, links]) =>
      Object.entries(links)
        .filter(([, url]) => isValidLink(url))
        .map(([name]) => `「${name}」（${cat}）`)
    );

  const affiliateBlock =
    validProducts.length > 0
      ? `【商品の自然な言及とリンク選定】
利用可能な商品・サービス一覧: ${validProducts.join("、")}

- この一覧のうち、**記事のテーマに直接関係するものだけ**を relevantLinks に選んでください（0〜3個）。例：鍵のトラブル記事に排水管サービスは選ばない。関係するものが1つもなければ空配列 [] にすること。無関係なリンクを載せると読者の信頼を失います。
- relevantLinks に選んだ商品は、本文の自然な流れ（比較・体験談部分）でも1〜2回名前を出してください。宣伝臭くせず体験ベースで。リンクは付けず名前だけでよい（リンクはシステムが付けます）。
- 選ばなかった商品には本文でも触れないこと。`
      : `【商品の言及について】
今回は紹介できる具体的な商品リンクが未設定のため、特定サービスへの誘導は書かないでください。一般名詞（「ネット証券」「格安SIM」など）で説明し、固有のサービス名でのおすすめや比較は避けてください。relevantLinks は空配列 [] にすること。`;

  const currentYear = new Date().getFullYear();

  return `あなたは${genre.writerPersona}として、自分の実体験を交えてブログ記事を書きます。
※現在は${currentYear}年です。年号が必要な箇所は${currentYear}年と書いてください。

テーマ: ${topic}
想定読者: ${genre.targetReader}

【最重要：リアリティと独自性】
読者は「AIが書いた一般論」を一瞬で見抜いて離脱します。以下を必ず守ってください。
- 一人称（私／筆者）で、具体的なエピソードを最低2つ入れる。例：「最初の3ヶ月は○○で失敗した」「実際にやってみて△△円かかった」など、数字・期間・固有の状況を伴うリアルな描写。
- 抽象論ではなく「いつ・いくら・どうなったか」を必ず数字で書く。
- メリットだけでなく、デメリットや後悔・注意点も正直に書く（信頼性が上がる）。
- よくある反論や「自分には無理かも」という読者の不安に先回りして答える。

【感情に訴える書き方（煽りではなく共感で）】
- 冒頭は読者が今感じている感情をそのまま言語化して始める。例：「口座残高を見るたび、なんとなく不安になる」「あのとき動いていればと、ふと思う夜がある」。
- 失敗談は感情込みで書く。「画面を見た瞬間、血の気が引いた」「正直、家族に言えなかった」など、その瞬間の気持ちを描写する。
- 先延ばしのコスト（機会損失）は事実ベースで具体的に示す。例：「非課税枠は毎年リセットされる。使わなかった1年分は二度と戻らない」。事実で焦りを感じさせるのは良いが、事実でない緊急性を作るのは禁止。
- 記事の最後は「今日、これだけやってみてください」と5分でできる最初の一歩を1つだけ示して背中を押す。
- ただし煽り表現は厳禁：「絶対」「必ず」「今すぐやらないと大損」「知らないと後悔します」のような脅し・誇張はGoogleの品質評価と広告審査の両方で致命的なので1つも使わないこと。感情は「共感と実体験」で動かす。

【絶対に使わない表現（AIっぽさの元）】
「いかがでしたか」「この記事では」「まとめると」「ぜひ参考にしてみてください」「〜と言えるでしょう」の多用、中身のない一般論。これらは禁止。

【事実の正確性（最重要・お金や安全に関わるため）】
- 制度・法律・料金の「公式な数字」（例：NISAの年間投資枠、税率、控除額、手数料の正確な金額、保険の給付条件）は、確実に正しいと言い切れない限り具体的な数字で断定しないこと。「年間の上限額は変更されることがあるため、最新は金融庁や証券会社の公式サイトで確認してください」のように公式確認を促す書き方にする。
- 一方、自分の体験の数字（自分がいくら投資したか、何ヶ月かかったか、いくら払ったか）は具体的に書いてよい。
- 間違った制度の数字を1つ書くだけで記事全体の信頼が崩れる。迷ったら数字をぼかして公式に誘導すること。

【SEO構造】
- タイトル: 検索意図に合う32文字以内。狙うキーワードを前half に置き、数字や${currentYear}年を含める。
- 冒頭100文字に、検索キーワードと「この記事を読むと何が解決するか」を明示。
- h2見出しにキーワードと関連語（共起語）を自然に含める。
- 記事の途中か末尾に「よくある質問」セクションを作り、Q&Aを3つ入れる（Googleの強調スニペット対策）。各回答は2〜3文で簡潔に。
- 比較や手順がある所はマークダウンの表（| 項目 | A | B |）または番号付きリストで整理する。

【記事構成】
1. 冒頭：読者の悩みへの共感＋自分の体験の一言＋この記事でわかること（箇条書き3〜5点）
2. 本文：h2見出し4〜6セクション。体験エピソード・具体的数字・表を織り込む。
3. よくある質問（Q&A 3つ）
4. まとめ：きれいごとでなく、結局どうするのが良いかを自分の意見として言い切る。

【その他】
- 文字数2500〜3500文字。
- マークダウン形式（はてなブログ対応）。
- ${affiliateBlock}

以下のJSON形式のみで返してください。コードブロック（\`\`\`）は使わず、JSONのみ出力すること:
{
  "title": "記事タイトル（32文字以内）",
  "content": "記事本文（マークダウン）",
  "tags": ["タグ1", "タグ2", "タグ3", "タグ4", "タグ5", "タグ6", "タグ7", "タグ8"],
  "relevantLinks": ["記事テーマに直接関係する商品名のみ（無ければ空配列）"]
}`;
}

export async function generateArticle(genre: Genre, customTopic?: string): Promise<Article> {
  // 月の予算チェック（$5を超えないための安全装置）
  if (!hasBudgetLeft()) {
    throw new BudgetExceededError();
  }

  let topic = customTopic ?? null;

  // 【自己改善ループ】3日サイクルで「活用・探索・安定」のバランスを取る
  //   day%3==0: 深掘り日（反応が良かった自記事の関連テーマ = 活用）
  //   day%3==1: トレンド日（他人の伸びている記事から切り口を学ぶ = 探索）
  //   day%3==2: 通常日（トピックローテーション = 網羅性の維持）
  // 偏りすぎによる機会損失を防ぐため、深掘り・トレンドは各1/3日に制限。
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );

  if (!topic && dayOfYear % 3 === 0) {
    try {
      if (fs.existsSync("winning-topics.json")) {
        const { winners } = JSON.parse(fs.readFileSync("winning-topics.json", "utf-8"));
        const genreWinners = (winners ?? []).filter((w: { genreId: string }) => w.genreId === genre.id);
        if (genreWinners.length > 0) {
          const titles = genreWinners.slice(0, 3).map((w: { title: string }) => `「${w.title}」`).join("、");
          topic = `過去に読者の反応が良かった記事: ${titles}。これらと同じ読者が次に知りたくなる、より具体的なロングテールテーマをあなたが1つ設定して書く（同じ内容の繰り返しは禁止。関連する別の疑問・状況を扱うこと）`;
          console.log(`   🔁 深掘りモード: 勝ちテーマから派生記事を生成`);
        }
      }
    } catch { /* 深掘り失敗時は通常ローテーションへ */ }
  }

  if (!topic && dayOfYear % 3 === 1) {
    try {
      const { getTrendTopicForGenre } = await import("./trend-topics.js");
      topic = await getTrendTopicForGenre(genre);
    } catch { /* トレンド取得失敗時は通常ローテーションへ */ }
  }

  // 通常日 or 上記が不発の日はトピックローテーション
  if (!topic) {
    topic = getTopicForGenre(genre);
  }

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 8192,
    messages: [{ role: "user", content: buildPrompt(genre, topic) }],
  });

  // 実トークン数から課金額を積算（月の予算管理用）
  const monthTotal = recordUsage(response.usage);
  console.log(`   💰 今月の利用額: $${monthTotal.toFixed(3)} / $${MONTHLY_BUDGET_USD}`);

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  const cleaned = text.replace(/```json/g, "").replace(/```/g, "");
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
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

  // 記事テーマに関係するリンクだけを末尾に追加（AIが選定、無関係リンク防止）
  article.content += buildAffiliateSection(genre, article.relevantLinks ?? []);

  // 同ジャンルの過去記事への内部リンクを追加
  try {
    const { appendInternalLinks } = await import("./internal-links.js");
    Object.assign(article, appendInternalLinks(article));
  } catch { /* post-log.json が空の初回は無視 */ }

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
