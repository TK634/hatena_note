/**
 * 投稿完了後に結果サマリーをメールで通知する
 */
import nodemailer from "nodemailer";

export interface PostResult {
  genreId: string;
  genreName: string;
  success: boolean;
  title?: string;
  url?: string;
  error?: string;
}

export async function sendSummaryEmail(results: PostResult[]): Promise<void> {
  const notifyEmail = process.env.NOTIFY_EMAIL ?? process.env.GMAIL_USER;
  if (!notifyEmail) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const successCount = results.filter((r) => r.success).length;
  const date = new Date().toLocaleString("ja-JP");

  const rows = results
    .map((r) => {
      const icon = r.success ? "✅" : "❌";
      const detail = r.success
        ? `<a href="${r.url}">${r.title}</a>`
        : `エラー: ${r.error}`;
      return `<tr><td>${icon}</td><td>${r.genreName}</td><td>${detail}</td></tr>`;
    })
    .join("");

  const html = `
<h2>📊 auto-income 投稿レポート</h2>
<p>${date}</p>
<p><strong>${successCount}/${results.length} ジャンル 投稿成功</strong></p>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
  <thead>
    <tr style="background:#f0f0f0;">
      <th>状態</th><th>ジャンル</th><th>記事</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
<hr>
<p style="font-size:12px;color:#888;">auto-income 自動投稿システム</p>
`;

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: notifyEmail,
    subject: `[auto-income] ${date} 投稿完了 (${successCount}/${results.length})`,
    html,
  });

  console.log(`   📧 結果メールを送信: ${notifyEmail}`);
}
