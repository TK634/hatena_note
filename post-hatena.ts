import type { Article } from "./generate.js";
import type { Genre } from "./genres.js";
import nodemailer from "nodemailer";
import * as fs from "fs";

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

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: hatenaEmail,
    subject: `[${genre.name}]${article.title}`,
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
