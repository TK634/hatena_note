import type { Article } from "./generate.js";
import type { Genre } from "./genres.js";
import * as crypto from "crypto";
import * as fs from "fs";

const HATENA_ID = "takataka634";
const BLOG_ID = "takataka634.hatenablog.com";

function apiKey(): string {
  const key = process.env.HATENA_API_KEY;
  if (!key) throw new Error("HATENA_API_KEY が .env に設定されていません");
  return key;
}

/** はてなフォトライフにOGP画像をアップロードし、画像URLを返す（失敗時はnull） */
async function uploadImageToFotolife(imagePath: string): Promise<string | null> {
  try {
    if (!fs.existsSync(imagePath)) return null;
    const base64 = fs.readFileSync(imagePath).toString("base64");

    // WSSE認証ヘッダを構築
    const nonceRaw = crypto.randomBytes(16).toString("hex");
    const created = new Date().toISOString();
    const digest = crypto
      .createHash("sha1")
      .update(nonceRaw + created + apiKey())
      .digest("base64");
    const wsse = `UsernameToken Username="${HATENA_ID}", PasswordDigest="${digest}", Nonce="${Buffer.from(nonceRaw).toString("base64")}", Created="${created}"`;

    const xml = `<entry xmlns="http://purl.org/atom/ns#">
  <title>blog-eyecatch</title>
  <content mode="base64" type="image/png">${base64}</content>
</entry>`;

    const res = await fetch("https://f.hatena.ne.jp/atom/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/atom+xml",
        "X-WSSE": wsse,
      },
      body: xml,
    });

    if (!res.ok) {
      console.warn(`   ⚠ フォトライフ画像アップ失敗 (${res.status})`);
      return null;
    }
    const body = await res.text();
    const urlMatch = body.match(/<hatena:imageurl>([^<]+)<\/hatena:imageurl>/);
    return urlMatch ? urlMatch[1] : null;
  } catch (e) {
    console.warn(`   ⚠ フォトライフ画像アップエラー: ${e instanceof Error ? e.message : e}`);
    return null;
  }
}

/** AtomPubではてなブログに投稿し、公開された記事の個別URLを返す */
export async function postToHatena(
  article: Article,
  genre: Genre,
  options: { draft?: boolean } = {}
): Promise<string> {
  const endpoint = `https://blog.hatena.ne.jp/${HATENA_ID}/${BLOG_ID}/atom/entry`;

  let htmlContent = convertMarkdownToHtml(article.content);

  // OGP画像をフォトライフにアップして記事冒頭に表示
  if (article.ogpImagePath) {
    const imageUrl = await uploadImageToFotolife(article.ogpImagePath);
    if (imageUrl) {
      htmlContent = `<p><img src="${imageUrl}" alt="${escapeXml(article.title)}" /></p>\n` + htmlContent;
    }
  }

  // カテゴリ: ジャンル名 + 記事タグ先頭3つ
  const categories = [genre.name, ...article.tags.slice(0, 3)]
    .map((tag) => `<category term="${escapeXml(tag)}" />`)
    .join("\n  ");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<entry xmlns="http://www.w3.org/2005/Atom"
       xmlns:app="http://www.w3.org/2007/app">
  <title>${escapeXml(article.title)}</title>
  <content type="text/html"><![CDATA[${htmlContent}]]></content>
  ${categories}
  <app:control>
    <app:draft>${options.draft ? "yes" : "no"}</app:draft>
  </app:control>
</entry>`;

  const credentials = Buffer.from(`${HATENA_ID}:${apiKey()}`).toString("base64");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/atom+xml",
      Authorization: `Basic ${credentials}`,
    },
    body: xml,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`投稿失敗 (${response.status}): ${body.slice(0, 200)}`);
  }

  // レスポンスから記事の個別URLを取得
  const responseText = await response.text();
  const urlMatch = responseText.match(/<link[^>]+rel="alternate"[^>]+href="([^"]+)"/);
  const url = urlMatch ? urlMatch[1] : `https://${BLOG_ID}/`;

  console.log(`   ✅ はてなブログに投稿完了${options.draft ? "（下書き）" : ""}: ${url}`);
  return url;
}

function convertMarkdownToHtml(md: string): string {
  const lines = md.split("\n");
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 表の処理
    if (line.trim().startsWith("|") && i + 1 < lines.length && lines[i + 1].trim().match(/^\|[-| :]+\|$/)) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      output.push(buildTable(tableLines));
      continue;
    }

    if (line.startsWith("### ")) { output.push(`<h3>${inline(line.slice(4))}</h3>`); }
    else if (line.startsWith("## ")) { output.push(`<h2>${inline(line.slice(3))}</h2>`); }
    else if (line.startsWith("# ")) { output.push(`<h1>${inline(line.slice(2))}</h1>`); }
    else if (line.startsWith("- ")) { output.push(`<li>${inline(line.slice(2))}</li>`); }
    else if (line.trim() === "---") { output.push("<hr>"); }
    else if (line.trim() === "") { output.push("<br>"); }
    else { output.push(`<p>${inline(line)}</p>`); }

    i++;
  }

  return output.join("\n")
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
}

function buildTable(tableLines: string[]): string {
  const rows = tableLines.map(l =>
    l.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim())
  );
  const [header, , ...body] = rows;
  const th = header.map(c => `<th>${inline(c)}</th>`).join("");
  const trs = body.map(row =>
    "<tr>" + row.map(c => `<td>${inline(c)}</td>`).join("") + "</tr>"
  ).join("");
  return `<table border="1" cellpadding="6" cellspacing="0"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
}

function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
