import type { Article } from "./generate.js";
import type { Genre } from "./genres.js";
import { findPublishedUrl } from "./resolve-urls.js";
import nodemailer from "nodemailer";
import * as fs from "fs";

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

/**
 * はてな投稿（重複防止つき）。
 * 送信エラーでも「実は送信済み」のことがある（2026-10-01の実例: Timeoutでも公開されていた）ため、
 * 再送する前に必ずRSSで公開済みか確認する。単純な再送は重複投稿になる。
 * post / confirmWaitMs はテスト用に差し替え可能。
 */
export async function postToHatenaSafely(
  article: Article,
  genre: Genre,
  opts: { post?: typeof postToHatena; confirmWaitMs?: number } = {}
): Promise<string> {
  const post = opts.post ?? postToHatena;
  const waitMs = opts.confirmWaitMs ?? 60_000;
  const confirmPublished = async (): Promise<string | null> => {
    await new Promise((r) => setTimeout(r, waitMs)); // はてな側のメール取り込み待ち
    return findPublishedUrl(article.title); // RSSが取れなければ例外＝再送しない
  };

  try {
    return await post(article, genre);
  } catch (e) {
    console.warn(`   ⚠ 投稿エラー（${errMsg(e)}）。送信済みか${waitMs / 1000}秒後にRSSで確認します`);
    let url: string | null;
    try {
      url = await confirmPublished();
    } catch (e2) {
      throw new Error(`投稿エラー後、公開確認もできず（重複を避けるため再送せず）: ${errMsg(e)} / ${errMsg(e2)}`);
    }
    if (url) {
      console.log(`   ✅ 実際には公開済みでした: ${url}`);
      return url;
    }
    console.warn(`   ↻ 未公開を確認。1回だけ再送信します`);
    try {
      return await post(article, genre);
    } catch (e3) {
      const url2 = await confirmPublished().catch(() => null);
      if (url2) {
        console.log(`   ✅ 再送信はエラーでしたが公開済みでした: ${url2}`);
        return url2;
      }
      throw e3;
    }
  }
}

export async function postToHatena(article: Article, genre: Genre): Promise<string> {
  const hatenaEmail = genre.blog.hatenaEmail;
  if (!hatenaEmail) {
    throw new Error(`ジャンル「${genre.name}」のはてな投稿メールが .env に設定されていません`);
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    // 既定値（socketTimeout=10分）だと通信断で長時間ハングするため明示。
    // タイムアウト後は run-all 側でRSS照合してから再送するので、短めでも重複投稿にはならない。
    connectionTimeout: 30_000,
    greetingTimeout: 30_000,
    socketTimeout: 60_000,
  });

  const htmlContent = convertMarkdownToHtml(article.content);

  // OGP画像があればメールに添付（はてなのメール投稿は添付画像を記事冒頭に表示する）
  const attachments =
    article.ogpImagePath && fs.existsSync(article.ogpImagePath)
      ? [{ filename: "eyecatch.png", path: article.ogpImagePath }]
      : [];
  if (attachments.length === 0) {
    console.warn(`   ⚠ アイキャッチ画像なしで投稿`);
  }

  // はてなのメール投稿は件名先頭の [○○] をカテゴリとして解釈する。
  // M2: 統一カテゴリ体系（genre.category）を使い、旧・冗長なジャンル名での分類を避ける。
  const category = genre.category ?? genre.name;

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: hatenaEmail,
    subject: `[${category}]${article.title}`,
    html: htmlContent,
    attachments,
  });

  console.log(`   ✅ はてなブログに投稿完了: ${genre.blog.hatenaUrl}`);
  return genre.blog.hatenaUrl;
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
