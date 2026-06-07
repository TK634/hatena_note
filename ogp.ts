/**
 * 記事のOGP画像を自動生成する
 * SVGを生成してSharpでPNGに変換（1200x630px）
 */
import sharp from "sharp";
import * as fs from "fs";
import type { Genre } from "./genres.js";

// ジャンル別カラーテーマ
const GENRE_COLORS: Record<string, { bg: string; accent: string; text: string }> = {
  invest:      { bg: "#0f2340", accent: "#f97316", text: "#ffffff" },
  "side-hustle": { bg: "#1a1a2e", accent: "#e94560", text: "#ffffff" },
  career:      { bg: "#16213e", accent: "#0f3460", text: "#ffffff" },
  health:      { bg: "#1b4332", accent: "#52b788", text: "#ffffff" },
  beauty:      { bg: "#3d1a47", accent: "#e040fb", text: "#ffffff" },
  realestate:  { bg: "#1c2b3a", accent: "#29b6f6", text: "#ffffff" },
  "fx-credit": { bg: "#1a1200", accent: "#ffd600", text: "#ffffff" },
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const char of text) {
    current += char;
    // 全角文字は2文字分としてカウント
    const len = [...current].reduce((a, c) => a + (c.charCodeAt(0) > 127 ? 2 : 1), 0);
    if (len >= maxChars) {
      lines.push(current);
      current = "";
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3); // 最大3行
}

export async function generateOgpImage(
  title: string,
  genre: Genre,
  outputPath: string
): Promise<void> {
  const colors = GENRE_COLORS[genre.id] ?? GENRE_COLORS["invest"];
  const lines = wrapText(title, 22);
  const titleSvgLines = lines
    .map((line, i) =>
      `<text x="60" y="${220 + i * 90}" font-family="Hiragino Sans, Noto Sans JP, sans-serif"
        font-size="64" font-weight="bold" fill="${colors.text}">${escapeXml(line)}</text>`
    )
    .join("\n");

  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="1200" height="630" fill="${colors.bg}"/>
  <!-- アクセントライン -->
  <rect x="0" y="0" width="12" height="630" fill="${colors.accent}"/>
  <rect x="0" y="580" width="1200" height="50" fill="${colors.accent}" opacity="0.15"/>
  <!-- ジャンルバッジ -->
  <rect x="60" y="60" width="${genre.name.length * 36 + 40}" height="60" rx="8" fill="${colors.accent}"/>
  <text x="80" y="103" font-family="Hiragino Sans, Noto Sans JP, sans-serif"
    font-size="36" font-weight="bold" fill="${colors.bg}">${escapeXml(genre.name)}</text>
  <!-- タイトル -->
  ${titleSvgLines}
  <!-- サイト名 -->
  <text x="60" y="590" font-family="Hiragino Sans, Noto Sans JP, sans-serif"
    font-size="28" fill="${colors.accent}" opacity="0.9">${escapeXml(genre.blog.hatenaUrl)}</text>
</svg>`;

  fs.mkdirSync("ogp", { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
}

// 単体テスト: npx tsx ogp.ts
if (process.argv[1].endsWith("ogp.ts") || process.argv[1].endsWith("ogp.js")) {
  import("./genres.js").then(async ({ GENRES }) => {
    const genre = GENRES[0];
    const out = `ogp/test-${genre.id}.png`;
    await generateOgpImage("新NISAで月3万円積立投資を始める完全ガイド【2024年最新】", genre, out);
    console.log(`✅ OGP画像生成: ${out}`);
  });
}
