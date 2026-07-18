import fs from "fs";
import { CRON_LOG_PATH } from "./paths";
import { readPostLog, readCostLog, MONTHLY_BUDGET_USD, currentMonthKey } from "./logs";
import { listGenres } from "./genres-parser";

export type TodayStatus = "success" | "failure" | "pending";

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * cron.log は run.ts / run-all.ts の標準出力を追記したものでタイムスタンプは
 * 各実行の先頭「📅 YYYY/M/D H:MM:SS」の1行のみ。この行で実行単位に区切り、
 * 今日分の実行に該当する行だけを連結して返す。
 */
function getTodaysCronLogText(): string {
  if (!fs.existsSync(CRON_LOG_PATH)) return "";
  const text = fs.readFileSync(CRON_LOG_PATH, "utf-8");
  const lines = text.split("\n");
  const now = new Date();

  const segments: { date: Date; lines: string[] }[] = [];
  let current: { date: Date; lines: string[] } | null = null;

  for (const line of lines) {
    const m = line.match(/^📅 (\d{4})\/(\d{1,2})\/(\d{1,2}) (\d{1,2}):(\d{2}):(\d{2})/);
    if (m) {
      const [y, mo, d, h, mi, s] = m.slice(1).map(Number);
      current = { date: new Date(y, mo - 1, d, h, mi, s), lines: [line] };
      segments.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }

  return segments
    .filter((seg) => isSameLocalDay(seg.date, now))
    .map((seg) => seg.lines.join("\n"))
    .join("\n");
}

/** ジャンルごとの「今日の投稿ステータス」。run-all.tsのサマリー行（✅/❌ ジャンル名:）から判定 */
export function getTodayStatusByGenre(): Record<string, TodayStatus> {
  const genres = listGenres();
  const todayText = getTodaysCronLogText();
  const result: Record<string, TodayStatus> = {};
  for (const g of genres) {
    if (todayText.includes(`✅ ${g.name}:`)) {
      result[g.id] = "success";
    } else if (todayText.includes(`❌ ${g.name}:`)) {
      result[g.id] = "failure";
    } else {
      result[g.id] = "pending";
    }
  }
  return result;
}

export function getLast7DaysPostCounts(): { date: string; count: number }[] {
  const postLog = readPostLog();
  const now = new Date();
  const days: { date: string; count: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    const count = postLog.filter((p) => isSameLocalDay(new Date(p.date), d)).length;
    days.push({ date: key, count });
  }
  return days;
}

export function getCostSummary() {
  const costLog = readCostLog();
  const month = currentMonthKey();
  const spend = costLog[month] ?? 0;
  return {
    month,
    spend,
    budget: MONTHLY_BUDGET_USD,
    remaining: Math.max(0, MONTHLY_BUDGET_USD - spend),
  };
}
