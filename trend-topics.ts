/**
 * はてなブックマーク人気エントリ（=実際に今読まれている他人の記事）から
 * トレンドの切り口・タイトルの型を学び、自ジャンルの記事テーマに反映する。
 *
 * 3日サイクルの「トレンド探索日」に generate.ts から呼ばれる。
 * 使い方（単体確認）: npx tsx trend-topics.ts [genreId]
 */
import { GENRES, type Genre } from "./genres.js";

// ジャンル → はてブ人気エントリのカテゴリ
const CATEGORY_MAP: Record<string, string> = {
  invest: "economics",      // 政治と経済
  "fx-credit": "economics",
  emergency: "life",        // 暮らし
};

// &#x...; 形式のHTMLエンティティをデコード
function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"').replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

/** 指定カテゴリの人気エントリタイトルを取得（無料・認証不要） */
export async function fetchHotEntryTitles(category: string, limit = 10): Promise<string[]> {
  try {
    const res = await fetch(`https://b.hatena.ne.jp/hotentry/${category}.rss`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; auto-income-bot/1.0)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();

    const titles: string[] = [];
    for (const m of xml.matchAll(/<item[^>]*>[\s\S]*?<title>([\s\S]*?)<\/title>/g)) {
      const t = decodeEntities(m[1].trim());
      if (t && !t.startsWith("はてなブックマーク")) titles.push(t);
      if (titles.length >= limit) break;
    }
    return titles;
  } catch (e) {
    console.warn(`   ⚠ トレンド取得失敗: ${e instanceof Error ? e.message : e}`);
    return [];
  }
}

/**
 * トレンド探索日のテーマ指示を生成。
 * 他人の伸びている記事から「切り口・タイトルの型・関心事」を学ばせつつ、
 * ジャンルから外れた時事ネタの模倣やコピーは明示的に禁止する。
 */
export async function getTrendTopicForGenre(genre: Genre): Promise<string | null> {
  const category = CATEGORY_MAP[genre.id] ?? "life";
  const titles = await fetchHotEntryTitles(category);
  if (titles.length === 0) return null;

  console.log(`   🔥 トレンド探索モード: はてブ人気エントリ${titles.length}件を参考に生成`);
  return `【トレンド分析回】いま、はてなブックマークで実際に読まれている記事のタイトル一覧:
${titles.map((t) => `・${t}`).join("\n")}

この一覧から「読まれるタイトルの型」「読者の関心の切り口」を分析し、それを${genre.name}ジャンルに応用した具体的なテーマを1つ自分で設定して書いてください。
- 一覧の記事の内容をコピー・要約するのは禁止。学ぶのは切り口と型だけ。
- ジャンルと無関係な時事ネタ・政治ネタをそのまま扱うのも禁止。
- あくまで${genre.targetReader}が検索しそうな実用テーマにすること。`;
}

// 単体実行: npx tsx trend-topics.ts [genreId]
if (process.argv[1] && (process.argv[1].endsWith("trend-topics.ts") || process.argv[1].endsWith("trend-topics.js"))) {
  const genre = GENRES.find((g) => g.id === process.argv[2]) ?? GENRES[0];
  getTrendTopicForGenre(genre).then((t) => console.log(t ?? "（トレンド取得失敗）"));
}
