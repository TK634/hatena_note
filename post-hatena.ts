import type { Article } from "./generate.js";
import nodemailer from "nodemailer";

const HATENA_POST_EMAIL = "hzeefh2u4h.z5vbahlsjcgn6@blog.hatena.ne.jp";

export async function postToHatena(article: Article): Promise<string> {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const htmlContent = convertMarkdownToHtml(article.content);

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: HATENA_POST_EMAIL,
    subject: article.title,
    html: htmlContent,
  });

  const blogUrl = "https://takataka634.hatenablog.com/";
  console.log(`✅ はてなブログにメール投稿完了`);
  return blogUrl;
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
