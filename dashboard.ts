/**
 * 投稿履歴・収益予測ダッシュボードHTMLを生成する
 * 使い方: npx tsx dashboard.ts
 * → dashboard.html を開いてブラウザで確認
 */
import * as fs from "fs";
import { GENRES } from "./genres.js";

interface LogEntry {
  date: string;
  genreId: string;
  title: string;
  url: string;
  tags: string[];
}

const UNIT_PRICE: Record<string, number> = {
  invest:        8000,
  "side-hustle": 3000,
  career:       15000,
  health:        2000,
  beauty:        3000,
  realestate:   12000,
  "fx-credit":  10000,
};
const CVR = 0.002;
const PV_PER_ARTICLE = 300;

function main() {
  const logFile = "post-log.json";
  const logs: LogEntry[] = fs.existsSync(logFile)
    ? JSON.parse(fs.readFileSync(logFile, "utf-8"))
    : [];

  const genreStats = GENRES.map((g) => {
    const articles = logs.filter((l) => l.genreId === g.id);
    const unitPrice = UNIT_PRICE[g.id] ?? 3000;
    const revenue = Math.floor(articles.length * PV_PER_ARTICLE * CVR * unitPrice);
    return { genre: g, articles, revenue };
  });

  const totalRevenue = genreStats.reduce((s, g) => s + g.revenue, 0);
  const totalArticles = logs.length;
  const target = 10_000_000;
  const progress = Math.min(100, Math.floor((totalRevenue / target) * 100));

  // 月別データ
  const byMonth: Record<string, number> = {};
  for (const l of logs) {
    const m = l.date.slice(0, 7);
    byMonth[m] = (byMonth[m] ?? 0) + 1;
  }
  const months = Object.keys(byMonth).sort().slice(-6);

  const genreRows = genreStats
    .map(
      (s) => `
      <tr>
        <td>${s.genre.name}</td>
        <td>${s.articles.length}</td>
        <td>¥${(s.articles.length * PV_PER_ARTICLE).toLocaleString()}</td>
        <td>¥${s.revenue.toLocaleString()}</td>
        <td>${s.articles[s.articles.length - 1]?.date.slice(0, 10) ?? "—"}</td>
      </tr>`
    )
    .join("");

  const recentRows = logs
    .slice(-10)
    .reverse()
    .map(
      (l) => `
      <tr>
        <td>${l.date.slice(0, 10)}</td>
        <td>${GENRES.find((g) => g.id === l.genreId)?.name ?? l.genreId}</td>
        <td><a href="${l.url}" target="_blank">${l.title}</a></td>
      </tr>`
    )
    .join("");

  const chartBars = months
    .map((m) => {
      const count = byMonth[m] ?? 0;
      const height = Math.max(10, count * 12);
      return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
        <span style="font-size:11px;font-weight:bold;">${count}</span>
        <div style="width:40px;height:${height}px;background:#f97316;border-radius:4px 4px 0 0;"></div>
        <span style="font-size:10px;color:#888;">${m.slice(5)}月</span>
      </div>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>auto-income ダッシュボード</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Hiragino Sans', sans-serif;
         background: #0f172a; color: #e2e8f0; padding: 24px; }
  h1 { color: #f97316; margin-bottom: 8px; }
  .sub { color: #94a3b8; font-size: 14px; margin-bottom: 32px; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .card { background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155; }
  .card .label { font-size: 12px; color: #94a3b8; margin-bottom: 8px; }
  .card .value { font-size: 28px; font-weight: bold; color: #f1f5f9; }
  .card .accent { color: #f97316; }
  .progress-bar { background: #334155; border-radius: 99px; height: 12px; margin: 8px 0; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, #f97316, #ef4444); border-radius: 99px; transition: width 1s; }
  h2 { font-size: 18px; margin-bottom: 16px; color: #cbd5e1; border-left: 4px solid #f97316; padding-left: 12px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  th { background: #1e293b; color: #94a3b8; font-size: 12px; text-align: left; padding: 10px 12px; }
  td { padding: 10px 12px; border-bottom: 1px solid #1e293b; font-size: 14px; }
  tr:hover td { background: #1e293b; }
  a { color: #f97316; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .chart { display: flex; align-items: flex-end; gap: 12px; height: 120px; background: #1e293b;
           border-radius: 12px; padding: 16px; margin-bottom: 32px; }
  .updated { text-align: right; font-size: 12px; color: #475569; margin-top: 24px; }
</style>
</head>
<body>
<h1>💰 auto-income ダッシュボード</h1>
<p class="sub">月収1000万円達成に向けた進捗</p>

<div class="cards">
  <div class="card">
    <div class="label">総投稿数</div>
    <div class="value">${totalArticles}<span style="font-size:16px;color:#94a3b8;"> 記事</span></div>
  </div>
  <div class="card">
    <div class="label">ジャンル数</div>
    <div class="value">${GENRES.length}<span style="font-size:16px;color:#94a3b8;"> ジャンル</span></div>
  </div>
  <div class="card">
    <div class="label">想定月間PV</div>
    <div class="value accent">${(totalArticles * PV_PER_ARTICLE).toLocaleString()}<span style="font-size:14px;color:#94a3b8;"> PV</span></div>
  </div>
  <div class="card">
    <div class="label">想定月収</div>
    <div class="value accent">¥${totalRevenue.toLocaleString()}</div>
    <div class="progress-bar"><div class="progress-fill" style="width:${progress}%;"></div></div>
    <div style="font-size:12px;color:#94a3b8;">目標: ¥10,000,000（${progress}%）</div>
  </div>
</div>

<h2>📅 月別投稿数</h2>
<div class="chart">${chartBars}</div>

<h2>📝 ジャンル別統計</h2>
<table>
  <tr><th>ジャンル</th><th>記事数</th><th>月間PV</th><th>想定月収</th><th>最終投稿</th></tr>
  ${genreRows}
</table>

<h2>🕐 最近の投稿</h2>
<table>
  <tr><th>日付</th><th>ジャンル</th><th>タイトル</th></tr>
  ${recentRows}
</table>

<p class="updated">最終更新: ${new Date().toLocaleString("ja-JP")}</p>
</body>
</html>`;

  fs.writeFileSync("dashboard.html", html);
  console.log("✅ dashboard.html を生成しました");
  console.log(`   open dashboard.html でブラウザで確認できます`);
}

main();
